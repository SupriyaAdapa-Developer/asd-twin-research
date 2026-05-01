"""
Tiered prediction model for ABA session outcomes.

Implements the four model tiers from docs/methodology.md:
  Tier 1 — Baseline session features
  Tier 2 — + Therapist & schedule features
  Tier 3 — + Environmental covariates
  Tier 4 — + Per-child random effects (mixed-effects logistic)

All models predict the binary outcome session_success.

Public API:
    pipeline = TieredPipeline.from_csvs(data_dir)
    pipeline.fit(tier=3)
    metrics = pipeline.evaluate(tier=3)
    coef_df = pipeline.coefficients(tier=3)
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegressionCV
from sklearn.metrics import (
    brier_score_loss, log_loss, roc_auc_score, precision_score, recall_score
)
from sklearn.model_selection import GroupShuffleSplit
from sklearn.preprocessing import StandardScaler


# Predictor blocks (matches the pre-registration)
TIER1_FEATURES = [
    "duration_min", "n_programs", "day_of_week",
    "session_type_DTT", "session_type_NET", "session_type_Group",
    "session_type_ParentTraining", "session_type_Sensory", "session_type_Music",
    "location_clinic", "location_home", "location_school", "location_community",
    "time_of_day_morning", "time_of_day_afternoon", "time_of_day_evening",
    "domain_communication", "domain_social", "domain_academic",
    "domain_ADL", "domain_behavior_reduction",
]

TIER2_ADD = [
    "is_substitute",
    "therapist_tenure_with_child_days",
    "treatment_integrity_pct",
]

TIER3_ADD = [
    "pressure_swing", "high_pollen_sensitive_active",
    "break_transition", "post_dst_window",
    "construction_at_clinic", "fire_drill",
    "low_sleep_night", "skipped_breakfast", "family_stress_event",
    "is_holiday", "testing_week", "community_event",
    "temp_delta_c", "pm25_ugm3", "sunlight_hours",
]


@dataclass
class TieredPipeline:
    """Tier-1 → Tier-3 logistic regression pipeline.

    The hierarchical (Tier-4) model is implemented separately in
    `src/twin/hierarchical.py` because PyMC adds heavy dependencies.
    """
    sessions: pd.DataFrame
    cohort: pd.DataFrame
    env: pd.DataFrame
    seed: int = 42
    test_frac: float = 0.15

    _models: dict[int, LogisticRegressionCV] = field(default_factory=dict)
    _scalers: dict[int, StandardScaler] = field(default_factory=dict)
    _feature_lists: dict[int, list[str]] = field(default_factory=dict)
    _splits: dict[str, np.ndarray] = field(default_factory=dict)

    @classmethod
    def from_csvs(cls, data_dir: Path | str) -> "TieredPipeline":
        data_dir = Path(data_dir)
        return cls(
            sessions=pd.read_csv(data_dir / "sessions.csv"),
            cohort=pd.read_csv(data_dir / "synthetic_cohort.csv"),
            env=pd.read_csv(data_dir / "environmental.csv"),
        )

    # ─── Feature engineering ──────────────────────────────────────────────

    def build_design_matrix(self) -> pd.DataFrame:
        """Join sessions × cohort × environmental and engineer features."""
        df = self.sessions.merge(self.cohort, on="child_id", how="left")
        df = df.merge(
            self.env, left_on=["session_date", "home_zip"],
            right_on=["date", "zip"], how="left", suffixes=("", "_env")
        )

        # One-hot encode categoricals
        for col, values in [
            ("session_type", ["DTT", "NET", "Group", "ParentTraining", "Sensory", "Music"]),
            ("location",     ["clinic", "home", "school", "community"]),
            ("time_of_day",  ["morning", "afternoon", "evening"]),
            ("goal_domain",  ["communication", "social", "academic", "ADL", "behavior_reduction"]),
        ]:
            for v in values:
                prefix = "domain" if col == "goal_domain" else col
                df[f"{prefix}_{v}"] = (df[col] == v).astype(int)

        # Interaction: pollen sensitivity × high pollen day
        df["high_pollen_sensitive_active"] = (
            df["pollen_sensitive"] & df["high_pollen"]
        ).astype(int)

        # Construction-at-clinic interaction
        df["construction_at_clinic"] = (
            df["construction_local"] & (df["location"] == "clinic")
        ).astype(int)

        # Cast booleans
        for col in ["is_substitute", "pressure_swing", "break_transition",
                    "post_dst_window", "fire_drill", "low_sleep_night",
                    "skipped_breakfast", "family_stress_event",
                    "is_holiday", "testing_week", "community_event"]:
            if col in df.columns:
                df[col] = df[col].astype(int)

        return df

    # ─── Splits ───────────────────────────────────────────────────────────

    def make_splits(self, df: pd.DataFrame):
        """Group-aware split: all sessions for a child stay together."""
        gss_test = GroupShuffleSplit(n_splits=1, test_size=self.test_frac,
                                      random_state=self.seed)
        idx_trainval, idx_test = next(gss_test.split(df, groups=df["child_id"]))

        # Further split trainval into train/val
        sub = df.iloc[idx_trainval]
        gss_val = GroupShuffleSplit(n_splits=1, test_size=0.176,  # 0.176 of 0.85 ≈ 15%
                                     random_state=self.seed + 1)
        idx_train, idx_val = next(gss_val.split(sub, groups=sub["child_id"]))

        self._splits = {
            "train": idx_trainval[idx_train],
            "val":   idx_trainval[idx_val],
            "test":  idx_test,
        }

    # ─── Fit ──────────────────────────────────────────────────────────────

    def fit(self, tier: int) -> "TieredPipeline":
        """Fit a model at the specified tier (1, 2, or 3)."""
        if tier not in {1, 2, 3}:
            raise ValueError("tier must be 1, 2, or 3")

        df = self.build_design_matrix()
        if not self._splits:
            self.make_splits(df)

        features = list(TIER1_FEATURES)
        if tier >= 2:
            features += TIER2_ADD
        if tier >= 3:
            features += TIER3_ADD
        self._feature_lists[tier] = features

        train_idx = self._splits["train"]
        X_train = df.iloc[train_idx][features].fillna(0).values
        y_train = df.iloc[train_idx]["session_success"].astype(int).values

        scaler = StandardScaler()
        X_train_s = scaler.fit_transform(X_train)
        self._scalers[tier] = scaler

        model = LogisticRegressionCV(
            Cs=10, cv=5, penalty="l2", solver="liblinear",
            scoring="neg_log_loss", max_iter=2000, random_state=self.seed,
        )
        model.fit(X_train_s, y_train)
        self._models[tier] = model

        return self

    # ─── Evaluate ─────────────────────────────────────────────────────────

    def evaluate(self, tier: int, split: str = "test") -> dict:
        """Compute headline metrics on the held-out split."""
        df = self.build_design_matrix()
        idx = self._splits[split]
        features = self._feature_lists[tier]

        X = df.iloc[idx][features].fillna(0).values
        y = df.iloc[idx]["session_success"].astype(int).values

        X_s = self._scalers[tier].transform(X)
        p = self._models[tier].predict_proba(X_s)[:, 1]
        yhat = (p >= 0.5).astype(int)

        return {
            "tier":      tier,
            "split":     split,
            "n":         len(y),
            "auroc":     roc_auc_score(y, p),
            "brier":     brier_score_loss(y, p),
            "log_loss":  log_loss(y, p),
            "accuracy":  (yhat == y).mean(),
            "precision": precision_score(y, yhat, zero_division=0),
            "recall":    recall_score(y, yhat, zero_division=0),
            "pseudo_r2": self._mcfadden_r2(y, p),
        }

    @staticmethod
    def _mcfadden_r2(y: np.ndarray, p: np.ndarray) -> float:
        """McFadden's pseudo R²: 1 - (logL_full / logL_null)."""
        eps = 1e-15
        p = np.clip(p, eps, 1 - eps)
        ll_full = np.sum(y * np.log(p) + (1 - y) * np.log(1 - p))
        p_null = y.mean()
        ll_null = len(y) * (p_null * np.log(p_null + eps) +
                             (1 - p_null) * np.log(1 - p_null + eps))
        return 1 - (ll_full / ll_null)

    # ─── Coefficients ─────────────────────────────────────────────────────

    def coefficients(self, tier: int) -> pd.DataFrame:
        """Return a sorted coefficient table with standardized betas."""
        model = self._models[tier]
        features = self._feature_lists[tier]
        scaler = self._scalers[tier]

        coefs = model.coef_[0]
        # Standardized betas: coef × σ_X (since we already standardized X,
        # the coefficient already IS the standardized beta)
        std_devs = scaler.scale_

        return pd.DataFrame({
            "feature": features,
            "raw_coef": coefs / std_devs,        # back to original scale
            "std_beta": coefs,                    # already on standardized scale
            "abs_std_beta": np.abs(coefs),
        }).sort_values("abs_std_beta", ascending=False).reset_index(drop=True)

    # ─── Calibration ──────────────────────────────────────────────────────

    def calibration_curve(self, tier: int, n_bins: int = 10, split: str = "test"):
        """Return predicted vs. observed probability for a reliability diagram."""
        df = self.build_design_matrix()
        idx = self._splits[split]
        features = self._feature_lists[tier]
        X = df.iloc[idx][features].fillna(0).values
        y = df.iloc[idx]["session_success"].astype(int).values
        p = self._models[tier].predict_proba(self._scalers[tier].transform(X))[:, 1]

        bins = np.linspace(0, 1, n_bins + 1)
        bin_idx = np.digitize(p, bins[1:-1])
        out = []
        for b in range(n_bins):
            mask = bin_idx == b
            if mask.sum() < 5:
                continue
            out.append({
                "bin_center":   (bins[b] + bins[b + 1]) / 2,
                "predicted":    p[mask].mean(),
                "observed":     y[mask].mean(),
                "n":            int(mask.sum()),
            })
        return pd.DataFrame(out)

    # ─── ROC ──────────────────────────────────────────────────────────────

    def roc_curve(self, tier: int, split: str = "test", n_thresholds: int = 50):
        df = self.build_design_matrix()
        idx = self._splits[split]
        features = self._feature_lists[tier]
        X = df.iloc[idx][features].fillna(0).values
        y = df.iloc[idx]["session_success"].astype(int).values
        p = self._models[tier].predict_proba(self._scalers[tier].transform(X))[:, 1]

        thresholds = np.linspace(0, 1, n_thresholds)
        out = []
        for t in thresholds:
            yhat = (p >= t).astype(int)
            tp = ((yhat == 1) & (y == 1)).sum()
            fp = ((yhat == 1) & (y == 0)).sum()
            tn = ((yhat == 0) & (y == 0)).sum()
            fn = ((yhat == 0) & (y == 1)).sum()
            out.append({
                "threshold": t,
                "tpr":       tp / max(tp + fn, 1),
                "fpr":       fp / max(fp + tn, 1),
            })
        return pd.DataFrame(out)


def fit_all_tiers(data_dir: Path | str) -> tuple[TieredPipeline, pd.DataFrame]:
    """Convenience: fit T1, T2, T3 and return summary metrics."""
    pipe = TieredPipeline.from_csvs(data_dir)
    rows = []
    for t in (1, 2, 3):
        pipe.fit(tier=t)
        rows.append(pipe.evaluate(tier=t, split="test"))
    return pipe, pd.DataFrame(rows)
