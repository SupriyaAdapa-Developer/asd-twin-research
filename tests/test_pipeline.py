"""
Tests for the tiered prediction pipeline.

These tests validate the pipeline's structural correctness and that
the model fits within expected performance bands. They do NOT test
clinical validity — that requires real-data replication.

Run with:  pytest tests/ -v
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import pytest

from src.twin.prediction import TieredPipeline, fit_all_tiers


DATA_DIR = Path(__file__).parent.parent / "data"


@pytest.fixture(scope="module")
def fitted_pipeline():
    """Fit all three tiers once and reuse across tests (slow setup)."""
    pipe = TieredPipeline.from_csvs(DATA_DIR)
    for t in (1, 2, 3):
        pipe.fit(tier=t)
    return pipe


# ─── Structural tests ──────────────────────────────────────────────────────

def test_data_files_exist():
    assert (DATA_DIR / "synthetic_cohort.csv").exists(), \
        "Run `python data/data_generation.py` first"
    assert (DATA_DIR / "sessions.csv").exists()
    assert (DATA_DIR / "environmental.csv").exists()


def test_cohort_size():
    cohort = pd.read_csv(DATA_DIR / "synthetic_cohort.csv")
    assert 100 <= len(cohort) <= 300, f"Unexpected cohort size: {len(cohort)}"


def test_sessions_have_required_columns():
    sessions = pd.read_csv(DATA_DIR / "sessions.csv")
    required = {
        "session_id", "child_id", "session_date", "session_type",
        "duration_min", "is_substitute", "treatment_integrity_pct",
        "session_success", "behavioral_incident",
    }
    assert required.issubset(sessions.columns), \
        f"Missing columns: {required - set(sessions.columns)}"


def test_environmental_zip_coverage():
    env = pd.read_csv(DATA_DIR / "environmental.csv")
    sessions = pd.read_csv(DATA_DIR / "sessions.csv")
    cohort = pd.read_csv(DATA_DIR / "synthetic_cohort.csv")
    home_zips = set(cohort["home_zip"].unique())
    env_zips = set(env["zip"].unique())
    assert home_zips.issubset(env_zips), \
        "Some home zips have no environmental records"


# ─── Pipeline tests ────────────────────────────────────────────────────────

def test_pipeline_loads():
    pipe = TieredPipeline.from_csvs(DATA_DIR)
    assert len(pipe.sessions) > 1000
    assert len(pipe.cohort) > 100
    assert len(pipe.env) > 1000


def test_design_matrix_no_data_leakage(fitted_pipeline):
    """Train, val, and test splits must have no overlapping children."""
    df = fitted_pipeline.build_design_matrix()
    splits = fitted_pipeline._splits
    train_kids = set(df.iloc[splits["train"]]["child_id"])
    val_kids   = set(df.iloc[splits["val"]]["child_id"])
    test_kids  = set(df.iloc[splits["test"]]["child_id"])
    assert not (train_kids & test_kids), "Train/test child overlap!"
    assert not (train_kids & val_kids),  "Train/val child overlap!"
    assert not (val_kids & test_kids),   "Val/test child overlap!"


def test_tier_monotonicity(fitted_pipeline):
    """AUROC should be non-decreasing across tiers (each tier is a superset)."""
    aurocs = []
    for t in (1, 2, 3):
        m = fitted_pipeline.evaluate(tier=t)
        aurocs.append(m["auroc"])
    # Allow tiny stochastic dips, but not large ones
    assert aurocs[1] >= aurocs[0] - 0.02, f"Tier 2 < Tier 1: {aurocs}"
    assert aurocs[2] >= aurocs[1] - 0.02, f"Tier 3 < Tier 2: {aurocs}"


def test_tier3_beats_baseline_meaningfully(fitted_pipeline):
    """Tier 3 should beat Tier 1 by ≥0.05 AUROC for the framing to hold."""
    m1 = fitted_pipeline.evaluate(tier=1)
    m3 = fitted_pipeline.evaluate(tier=3)
    assert m3["auroc"] - m1["auroc"] >= 0.05, \
        f"Tier 3 doesn't beat Tier 1 enough: {m3['auroc']} vs {m1['auroc']}"


def test_substitute_therapist_is_negative(fitted_pipeline):
    """Substitute therapist should have a negative coefficient in any tier ≥ 2."""
    coefs = fitted_pipeline.coefficients(tier=3)
    sub = coefs[coefs["feature"] == "is_substitute"].iloc[0]
    assert sub["std_beta"] < -0.05, \
        f"Substitute therapist coef should be clearly negative: {sub['std_beta']}"


def test_treatment_integrity_is_positive(fitted_pipeline):
    """TI should have a positive coefficient (positive control)."""
    coefs = fitted_pipeline.coefficients(tier=3)
    ti = coefs[coefs["feature"] == "treatment_integrity_pct"].iloc[0]
    assert ti["std_beta"] > 0.05, \
        f"TI coef should be clearly positive: {ti['std_beta']}"


def test_calibration_curve_returns_valid(fitted_pipeline):
    cal = fitted_pipeline.calibration_curve(tier=3, n_bins=10)
    assert len(cal) >= 5
    assert (cal["predicted"].between(0, 1)).all()
    assert (cal["observed"].between(0, 1)).all()


def test_roc_curve_endpoints(fitted_pipeline):
    """ROC at threshold 0 should be (1,1); at threshold 1 should be (0,0)."""
    roc = fitted_pipeline.roc_curve(tier=3)
    assert roc.iloc[0]["tpr"] >= 0.95 and roc.iloc[0]["fpr"] >= 0.95
    assert roc.iloc[-1]["tpr"] <= 0.05 and roc.iloc[-1]["fpr"] <= 0.05


def test_brier_score_in_valid_range(fitted_pipeline):
    """Brier ∈ [0, 1]; for a competent model on this problem, should be < 0.25."""
    m = fitted_pipeline.evaluate(tier=3)
    assert 0 <= m["brier"] <= 0.25


# ─── Determinism ───────────────────────────────────────────────────────────

def test_data_generation_is_deterministic(tmp_path):
    """Same seed should produce same data."""
    import subprocess, sys, shutil
    repo_root = Path(__file__).parent.parent

    out1 = tmp_path / "run1"; out1.mkdir()
    out2 = tmp_path / "run2"; out2.mkdir()

    for out in (out1, out2):
        subprocess.run([
            sys.executable, str(repo_root / "data" / "data_generation.py"),
            "--seed", "42", "--n-children", "20", "--out-dir", str(out)
        ], check=True, capture_output=True)

    df1 = pd.read_csv(out1 / "sessions.csv")
    df2 = pd.read_csv(out2 / "sessions.csv")
    pd.testing.assert_frame_equal(df1, df2)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
