"""
ABA-specific reliability and treatment fidelity metrics.

Implements:
  - Inter-observer agreement (IOA): proportional and Cohen's kappa
  - Treatment integrity (TI): per-session fidelity scoring
  - Reliability stratification for outcome models

Real-data deployments will compute these metrics from independent
observer codings; the synthetic version uses simulated agreement.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.metrics import cohen_kappa_score


def proportional_iao(coder_1: np.ndarray, coder_2: np.ndarray) -> float:
    """Simple proportional agreement (matches/total)."""
    return float(np.mean(coder_1 == coder_2))


def cohen_kappa_iao(coder_1: np.ndarray, coder_2: np.ndarray) -> float:
    """Cohen's kappa — chance-corrected agreement.

    Standard ABA acceptance threshold: kappa ≥ 0.60 (substantial).
    """
    return float(cohen_kappa_score(coder_1, coder_2))


def treatment_integrity_score(planned: dict, delivered: dict) -> float:
    """Treatment integrity as proportion of planned components delivered.

    Args:
        planned:   keys = component names, values = planned counts
        delivered: keys = component names, values = actually-delivered counts

    Returns:
        TI score in [0, 1]; 1.0 = perfect fidelity to written plan.
    """
    if not planned:
        return float("nan")
    component_scores = []
    for component, planned_n in planned.items():
        delivered_n = delivered.get(component, 0)
        if planned_n == 0:
            continue
        # Cap at 1.0; over-delivery isn't fidelity
        component_scores.append(min(delivered_n / planned_n, 1.0))
    return float(np.mean(component_scores)) if component_scores else float("nan")


def stratified_performance_by_ti(sessions: pd.DataFrame,
                                   ti_threshold: float = 80.0,
                                   outcome: str = "session_success") -> pd.DataFrame:
    """Compare model-relevant outcomes across high vs. low TI sessions."""
    sessions = sessions.copy()
    sessions["ti_high"] = sessions["treatment_integrity_pct"] >= ti_threshold
    grouped = sessions.groupby("ti_high")[outcome].agg(["mean", "count"])
    grouped.index = grouped.index.map({True: f"TI ≥ {ti_threshold}",
                                         False: f"TI < {ti_threshold}"})
    grouped["pct"] = (grouped["mean"] * 100).round(1)
    return grouped.reset_index()


def session_iaa_audit(sessions: pd.DataFrame,
                        sample_frac: float = 0.15,
                        random_seed: int = 42) -> dict:
    """Simulate an IOA audit by drawing a sample and computing agreement.

    In a real audit, two independent observers would code the same
    sessions; here we simulate by adding small disagreement noise.
    """
    rng = np.random.default_rng(random_seed)
    sample = sessions.sample(frac=sample_frac, random_state=random_seed)

    primary = sample["session_success"].astype(int).values
    # Simulate secondary observer with ~88% per-session agreement
    flip = rng.random(len(primary)) < 0.12
    secondary = np.where(flip, 1 - primary, primary)

    return {
        "n_audited":              len(sample),
        "proportional_agreement": proportional_iao(primary, secondary),
        "cohen_kappa":            cohen_kappa_iao(primary, secondary),
        "meets_aba_threshold":    cohen_kappa_iao(primary, secondary) >= 0.60,
    }
