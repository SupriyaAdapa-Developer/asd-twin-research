"""
Feature engineering for the environmental ("butterfly") covariate layer.

In a real-data deployment, these helpers would call live APIs:
  - NOAA / OpenWeatherMap for weather
  - National Weather Service for storm warnings
  - Local school district calendars
  - Local construction permit databases
  - Pollen.com or equivalent

For the synthetic analysis, the env data is pre-generated. These helpers
provide the join logic, missingness handling, and derived features that
would also be needed for real data.
"""
from __future__ import annotations

import numpy as np
import pandas as pd


def join_environmental(sessions: pd.DataFrame,
                        cohort: pd.DataFrame,
                        env: pd.DataFrame) -> pd.DataFrame:
    """Join sessions with cohort + environmental records.

    Returns a single design-matrix-ready DataFrame.
    """
    df = sessions.merge(cohort, on="child_id", how="left")
    df = df.merge(env, left_on=["session_date", "home_zip"],
                  right_on=["date", "zip"], how="left",
                  suffixes=("", "_env"))
    return df


def derive_interaction_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute interaction features for the environmental analysis.

    These are the features where the effect only manifests for children
    with the corresponding sensitivity.
    """
    out = df.copy()
    out["pressure_x_pressure_sensitive"] = (
        out["pressure_swing"].astype(int) * out["pressure_sensitive"].astype(int)
    )
    out["pollen_x_pollen_sensitive"] = (
        out["high_pollen"].astype(int) * out["pollen_sensitive"].astype(int)
    )
    out["construction_x_clinic_loc"] = (
        out["construction_local"].astype(int) * (out["location"] == "clinic").astype(int)
    )
    return out


def missingness_report(df: pd.DataFrame, env_columns: list[str] | None = None) -> pd.DataFrame:
    """Report missingness rates for environmental columns.

    Real-data versions of this analysis will have substantial missingness;
    this report drives the imputation strategy.
    """
    if env_columns is None:
        env_columns = [c for c in df.columns if c in {
            "temp_c", "pressure_hpa", "pollen_index", "pm25_ugm3",
            "low_sleep_night", "skipped_breakfast", "family_stress_event",
        }]
    rows = []
    for c in env_columns:
        rows.append({
            "feature": c,
            "n_missing": df[c].isna().sum(),
            "pct_missing": df[c].isna().mean() * 100,
            "dtype": str(df[c].dtype),
        })
    return pd.DataFrame(rows).sort_values("pct_missing", ascending=False)


def variance_explained_decomposition(pipe, tiers: list[int] = (1, 2, 3)) -> pd.DataFrame:
    """Compute the marginal pseudo-R² added by each successive tier.

    This is the headline number for the butterfly-effect framing:
    how much of the outcome variance does each layer explain?
    """
    metrics = []
    for t in tiers:
        m = pipe.evaluate(tier=t, split="test")
        metrics.append({"tier": t, "pseudo_r2": m["pseudo_r2"], "auroc": m["auroc"]})
    df = pd.DataFrame(metrics)
    df["delta_r2"] = df["pseudo_r2"].diff().fillna(df["pseudo_r2"].iloc[0])
    df["delta_auroc"] = df["auroc"].diff().fillna(0)
    return df


def stratified_effect_estimates(sessions: pd.DataFrame,
                                  cohort: pd.DataFrame,
                                  env: pd.DataFrame,
                                  feature: str,
                                  outcome: str = "session_success") -> pd.DataFrame:
    """Compute the success rate split by a binary environmental feature.

    Used in EDA to sanity-check that effects are present before modeling.
    """
    df = join_environmental(sessions, cohort, env)
    if df[feature].dtype == bool:
        df[feature] = df[feature].astype(int)
    grouped = df.groupby(feature)[outcome].agg(["mean", "count"])
    grouped["mean_pct"] = (grouped["mean"] * 100).round(1)
    return grouped.reset_index()
