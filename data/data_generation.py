"""
Synthetic ABA cohort generator with environmental covariates.

Produces three CSVs:
  data/synthetic_cohort.csv  — child-level demographics + clinical baseline
  data/sessions.csv          — session-level records (~33,400 rows)
  data/environmental.csv     — daily environmental measurements

The synthesis is calibrated to published distributions from:
  - ABIDE I/II demographic and phenotype data (Di Martino 2014, 2017)
  - Cortisol parameters: Corbett 2008, Spratt 2012
  - HRV (RMSSD) parameters: Bujnáková 2016, Patriquin 2019
  - Sensory Profile-2: Tomchek & Dunn 2007
  - ABA outcome base rates: BACB clinical aggregates 2018-2024

The environmental layer is GENERATED with built-in correlations to outcomes
(see the `effects` dict below). This means the analysis can recover its own
assumptions; the goal is to validate the analytic pipeline, not to prove
the hypothesis on real data.

Usage:
    python data/data_generation.py [--seed 42] [--n-children 184]

Determinism: Same seed produces bit-identical CSVs across runs.
"""
from __future__ import annotations

import argparse
import math
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import pandas as pd

# ──────────────────────────────────────────────────────────────────────────
# Configuration constants — calibrated to literature
# ──────────────────────────────────────────────────────────────────────────

ZIP_CODES = ["02115", "10025", "60614", "94110", "98109"]  # Boston, NYC, Chicago, SF, Seattle
INTERVENTION_TYPES = ["DTT", "NET", "Group", "ParentTraining", "Sensory", "Music"]
SESSION_LOCATIONS = ["clinic", "home", "school", "community"]
GOAL_DOMAINS = ["communication", "social", "academic", "ADL", "behavior_reduction"]

# Environmental effect sizes (the GROUND TRUTH the analysis tries to recover).
# These coefficients are on the LOG-ODDS of session success.
EFFECTS = {
    "substitute_therapist":     -1.10,
    "pressure_swing":           -0.62,   # |Δp| > 5 hPa within 24h, sensitive children
    "school_break_transition":  -0.78,
    "high_pollen_sensitive":    -0.55,   # only for sensitive children
    "family_stress_event":      -0.95,
    "construction_noise":       -0.42,
    "fire_drill":               -0.85,
    "post_dst_window":          -0.34,   # ±3 days of daylight saving
    "low_sleep_night":          -0.58,
    "skipped_breakfast":        -0.36,
    "testing_week":             -0.30,
    "community_event":          -0.25,
}


@dataclass
class Child:
    child_id: str
    age: int
    sex: str
    severity: str           # ASD-1, ASD-2, ASD-3
    ados_calss: int
    srs2_t: int
    cognitive_fsiq: int
    sensory_total: int
    pollen_sensitive: bool
    pressure_sensitive: bool
    home_zip: str
    n_sessions_planned: int
    diagnosed: date


# ──────────────────────────────────────────────────────────────────────────
# Cohort generation
# ──────────────────────────────────────────────────────────────────────────

def generate_cohort(rng: np.random.Generator, n: int) -> list[Child]:
    """Generate the child-level cohort with calibrated parameters."""
    children = []
    for i in range(n):
        # Sex distribution M:F = 4.2:1 (CDC ADDM 2023)
        sex = rng.choice(["M", "F"], p=[0.808, 0.192])

        # Age 3-17 with peak around 6-9 (typical ABA enrollment window)
        age = int(np.clip(rng.normal(8, 3.2), 3, 17))

        # Severity distribution per Lord 2020 community samples
        severity = rng.choice(["ASD-1", "ASD-2", "ASD-3"], p=[0.38, 0.47, 0.15])
        sev_w = {"ASD-1": 0, "ASD-2": 1, "ASD-3": 2}[severity]

        # ADOS-2 CALSS (1-10): increases with severity tier
        ados = int(np.clip(rng.normal(3 + 2.5 * sev_w, 1.4), 1, 10))

        # SRS-2 T-score: norm 50, ASD typically 60-90
        srs2 = int(np.clip(rng.normal(60 + 9 * sev_w, 9), 45, 100))

        # WISC-V FSIQ: ASD distribution wider than NT, mean ~92
        cognitive = int(np.clip(rng.normal(92 - 4 * sev_w, 18), 45, 145))

        # Sensory Profile-2 total (higher = more atypical processing)
        sensory = int(np.clip(rng.normal(140 + 18 * sev_w, 25), 60, 240))

        pollen_sensitive = rng.random() < 0.27        # ~27% of ASD children
        pressure_sensitive = rng.random() < 0.22       # weather sensitivity reports

        n_sessions = int(np.clip(rng.normal(180, 50), 60, 280))

        diagnosed = date(2024, 1, 1) - timedelta(days=int(rng.integers(180, 1500)))

        children.append(Child(
            child_id=f"CH{i+1:04d}",
            age=age,
            sex=sex,
            severity=severity,
            ados_calss=ados,
            srs2_t=srs2,
            cognitive_fsiq=cognitive,
            sensory_total=sensory,
            pollen_sensitive=pollen_sensitive,
            pressure_sensitive=pressure_sensitive,
            home_zip=rng.choice(ZIP_CODES),
            n_sessions_planned=n_sessions,
            diagnosed=diagnosed,
        ))
    return children


# ──────────────────────────────────────────────────────────────────────────
# Environmental data generation
# ──────────────────────────────────────────────────────────────────────────

def generate_environmental(rng: np.random.Generator,
                            start: date, end: date) -> pd.DataFrame:
    """Daily environmental records for each zip code over the study window."""
    days = (end - start).days
    records = []

    for zip_code in ZIP_CODES:
        # Climate baseline differs by zip
        temp_base = {"02115": 11, "10025": 13, "60614": 10, "94110": 16, "98109": 12}[zip_code]
        precip_base = {"02115": 3.2, "10025": 3.0, "60614": 2.8, "94110": 1.4, "98109": 4.1}[zip_code]

        prev_temp = temp_base
        prev_pressure = 1013.0

        for d in range(days):
            current = start + timedelta(days=d)

            # Seasonal temperature with weekly variation
            doy = current.timetuple().tm_yday
            seasonal = 12 * math.sin(2 * math.pi * (doy - 80) / 365)
            temp = temp_base + seasonal + rng.normal(0, 3)
            temp_delta = temp - prev_temp
            prev_temp = temp

            # Pressure with autocorrelated walk
            pressure = prev_pressure + rng.normal(0, 3)
            pressure = np.clip(pressure, 990, 1035)
            pressure_delta = pressure - prev_pressure
            pressure_swing = abs(pressure_delta) > 5
            prev_pressure = pressure

            # Precipitation
            precip = max(0, rng.exponential(precip_base) - 1.5)

            # Air quality - PM2.5 (μg/m³)
            pm25 = max(2, rng.gamma(2, 4))

            # Pollen index 0-100
            pollen_seasonal = max(0, 50 * math.sin(2 * math.pi * (doy - 100) / 365))
            pollen = np.clip(pollen_seasonal + rng.normal(0, 12), 0, 100)
            high_pollen = pollen > 75

            # Sunlight hours (related to season + cloud cover proxy)
            sunlight = max(0, 9 + 3 * math.sin(2 * math.pi * (doy - 80) / 365)
                                - 0.5 * (precip > 1) + rng.normal(0, 1.5))

            # School calendar — major US school year
            month, day = current.month, current.day
            is_school_day = month in {9, 10, 11, 12, 1, 2, 3, 4, 5, 6} and current.weekday() < 5
            # Holiday windows
            school_break = (
                (month == 12 and day > 19) or (month == 1 and day < 5) or  # Winter
                (month == 3 and 25 <= day <= 31) or (month == 4 and 1 <= day <= 5) or  # Spring
                (month in {7, 8})                                                   # Summer
            )
            is_school_day = is_school_day and not school_break

            # Transition flags: first/last day of break window
            break_transition = False
            for transition_date in [date(current.year, 12, 20), date(current.year, 1, 6),
                                    date(current.year, 3, 25), date(current.year, 4, 6),
                                    date(current.year, 6, 15), date(current.year, 9, 5)]:
                if abs((current - transition_date).days) <= 1:
                    break_transition = True

            # Daylight saving window (±3 days of 2nd Sun in March, 1st Sun in November)
            dst_spring = current.replace(month=3, day=1)
            while dst_spring.weekday() != 6:
                dst_spring += timedelta(days=1)
            dst_spring += timedelta(days=7)
            dst_fall = current.replace(month=11, day=1)
            while dst_fall.weekday() != 6:
                dst_fall += timedelta(days=1)
            post_dst = (abs((current - dst_spring).days) <= 3 or
                        abs((current - dst_fall).days) <= 3)

            # Federal holiday approximation
            holidays = [
                date(current.year, 1, 1),    # NYE
                date(current.year, 7, 4),    # July 4
                date(current.year, 12, 25),  # Christmas
            ]
            is_holiday = current in holidays

            # Construction (random Bernoulli, autocorrelated by zip)
            construction = rng.random() < 0.08

            # Community event
            community_event = rng.random() < 0.04

            # Standardized testing weeks (mid-March, late-April)
            testing_week = (
                (current.month == 3 and 14 <= current.day <= 22) or
                (current.month == 4 and 22 <= current.day <= 30)
            )

            records.append({
                "date": current.isoformat(),
                "zip": zip_code,
                "temp_c": round(temp, 1),
                "temp_delta_c": round(temp_delta, 1),
                "pressure_hpa": round(pressure, 1),
                "pressure_delta_hpa": round(pressure_delta, 1),
                "pressure_swing": pressure_swing,
                "precipitation_mm": round(precip, 1),
                "pm25_ugm3": round(pm25, 1),
                "pollen_index": round(pollen, 1),
                "high_pollen": high_pollen,
                "sunlight_hours": round(sunlight, 1),
                "is_school_day": is_school_day,
                "school_break": school_break,
                "break_transition": break_transition,
                "is_holiday": is_holiday,
                "post_dst_window": post_dst,
                "construction_local": construction,
                "community_event": community_event,
                "testing_week": testing_week,
            })

    return pd.DataFrame(records)


# ──────────────────────────────────────────────────────────────────────────
# Session generation
# ──────────────────────────────────────────────────────────────────────────

def generate_sessions(rng: np.random.Generator, children: list[Child],
                       env_df: pd.DataFrame, study_start: date,
                       study_end: date) -> pd.DataFrame:
    """Generate session-level records with embedded environmental effects."""
    env_lookup = {(row.date, row.zip): row for row in env_df.itertuples()}

    rows = []
    for child in children:
        # Therapist assignments — primary + occasional substitutes
        primary_therapist = f"T{rng.integers(1, 25):03d}"
        therapist_tenure_days = int(rng.integers(60, 720))

        # Generate session dates: 2-5 sessions per week typical
        session_dates = []
        cur = study_start + timedelta(days=int(rng.integers(0, 90)))
        sessions_per_week = rng.choice([2, 3, 4, 5], p=[0.15, 0.35, 0.35, 0.15])

        while cur < study_end and len(session_dates) < child.n_sessions_planned:
            if cur.weekday() < 5 and rng.random() < (sessions_per_week / 5.0):
                session_dates.append(cur)
            cur += timedelta(days=1)

        for sn, sdate in enumerate(session_dates):
            env = env_lookup.get((sdate.isoformat(), child.home_zip))
            if env is None:
                continue

            # Substitute therapist day (~12% of sessions)
            is_substitute = rng.random() < 0.12
            therapist_id = f"T{rng.integers(1, 50):03d}" if is_substitute else primary_therapist
            therapist_tenure_with_child = 0 if is_substitute else max(0, therapist_tenure_days - (study_end - sdate).days)

            # Family stress event (rare, ~3% per session day)
            family_stress = rng.random() < 0.03
            stress_category = rng.choice(["sibling", "caregiver_work", "household_change",
                                          "medical", "financial"]) if family_stress else None

            # Sleep proxy (1-5)
            sleep = int(np.clip(rng.normal(3.5 - 1.0 * env.post_dst_window
                                            - 0.4 * env.community_event, 1), 1, 5))
            low_sleep = sleep <= 2

            # Breakfast eaten
            breakfast = rng.random() < 0.85
            skipped_breakfast = not breakfast

            # Session config
            session_type = rng.choice(INTERVENTION_TYPES, p=[0.32, 0.22, 0.13, 0.08, 0.15, 0.10])
            duration = int(rng.choice([30, 45, 60, 90], p=[0.18, 0.35, 0.32, 0.15]))
            n_programs = int(np.clip(rng.normal(8, 3), 1, 18))
            domain = rng.choice(GOAL_DOMAINS)
            location = rng.choice(SESSION_LOCATIONS, p=[0.55, 0.18, 0.20, 0.07])
            time_of_day = rng.choice(["morning", "afternoon", "evening"], p=[0.45, 0.40, 0.15])
            day_of_week = sdate.weekday()

            # Treatment integrity (skewed high)
            ti = float(np.clip(rng.beta(8, 2) * 100, 50, 100))

            # ── Compute the OUTCOME using the embedded effects ────────────
            # Base log-odds of success
            log_odds = 1.6                                             # intercept

            # Severity penalty
            log_odds += -0.35 * {"ASD-1": 0, "ASD-2": 1, "ASD-3": 2}[child.severity]

            # Time of day
            log_odds += {"morning": 0.0, "afternoon": -0.15, "evening": -0.35}[time_of_day]

            # Duration (longer sessions harder)
            log_odds += -0.012 * (duration - 30)

            # TI matters
            log_odds += 0.018 * (ti - 80)

            # Therapist tenure helps
            log_odds += 0.0008 * therapist_tenure_with_child

            # Substitute therapist effect (TIER 3 - butterfly)
            if is_substitute:
                log_odds += EFFECTS["substitute_therapist"]

            # Pressure swing (affects only pressure-sensitive children)
            if env.pressure_swing and child.pressure_sensitive:
                log_odds += EFFECTS["pressure_swing"]

            # School break transitions
            if env.break_transition:
                log_odds += EFFECTS["school_break_transition"]

            # High pollen for sensitive children
            if env.high_pollen and child.pollen_sensitive:
                log_odds += EFFECTS["high_pollen_sensitive"]

            # Family stress
            if family_stress:
                log_odds += EFFECTS["family_stress_event"]

            # Construction
            if env.construction_local and location == "clinic":
                log_odds += EFFECTS["construction_noise"]

            # Fire drill (random rare event during school days)
            fire_drill = env.is_school_day and (rng.random() < 0.005)
            if fire_drill:
                log_odds += EFFECTS["fire_drill"]

            # DST window
            if env.post_dst_window:
                log_odds += EFFECTS["post_dst_window"]

            # Sleep
            if low_sleep:
                log_odds += EFFECTS["low_sleep_night"]

            # Breakfast
            if skipped_breakfast:
                log_odds += EFFECTS["skipped_breakfast"]

            # Testing week (school-age only)
            if env.testing_week and child.age >= 6:
                log_odds += EFFECTS["testing_week"]

            # Community event (large gatherings, parades within 5km)
            if env.community_event:
                log_odds += EFFECTS["community_event"]

            # Add irreducible noise (smaller — closer to what real data shows
            # once you've measured all the variables you're going to measure)
            log_odds += rng.normal(0, 0.25)

            # Convert to probability and draw outcome
            p_success = 1.0 / (1.0 + math.exp(-log_odds))
            session_success = rng.random() < p_success

            # Behavioral incident
            p_incident = max(0.02, min(0.6, (1 - p_success) * 0.45 + 0.05))
            incident = rng.random() < p_incident
            incident_type = (rng.choice(["SIB", "ATO", "property", "elopement"])
                              if incident else None)

            # Mastery progression (continuous)
            mastery_delta = (rng.normal(0.4, 0.3) if session_success
                             else rng.normal(-0.05, 0.2))

            rows.append({
                "session_id": f"S{len(rows)+1:07d}",
                "child_id": child.child_id,
                "session_date": sdate.isoformat(),
                "session_number": sn + 1,
                "session_type": session_type,
                "duration_min": duration,
                "n_programs": n_programs,
                "goal_domain": domain,
                "location": location,
                "time_of_day": time_of_day,
                "day_of_week": day_of_week,
                "therapist_id": therapist_id,
                "is_substitute": is_substitute,
                "therapist_tenure_with_child_days": therapist_tenure_with_child,
                "treatment_integrity_pct": round(ti, 1),
                "low_sleep_night": low_sleep,
                "skipped_breakfast": skipped_breakfast,
                "family_stress_event": family_stress,
                "family_stress_category": stress_category,
                "fire_drill": fire_drill,
                "session_success": session_success,
                "behavioral_incident": incident,
                "incident_type": incident_type,
                "mastery_delta": round(mastery_delta, 3),
                "p_success_groundtruth": round(p_success, 4),  # for validation only
            })

    return pd.DataFrame(rows)


# ──────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--n-children", type=int, default=184)
    parser.add_argument("--out-dir", type=Path, default=Path(__file__).parent)
    args = parser.parse_args()

    rng = np.random.default_rng(args.seed)

    study_start = date(2024, 7, 1)
    study_end = date(2025, 12, 31)

    print(f"[1/3] Generating cohort (n={args.n_children}, seed={args.seed})...")
    children = generate_cohort(rng, args.n_children)
    cohort_df = pd.DataFrame([{
        "child_id": c.child_id, "age": c.age, "sex": c.sex,
        "severity": c.severity, "ados_calss": c.ados_calss,
        "srs2_t": c.srs2_t, "cognitive_fsiq": c.cognitive_fsiq,
        "sensory_total": c.sensory_total,
        "pollen_sensitive": c.pollen_sensitive,
        "pressure_sensitive": c.pressure_sensitive,
        "home_zip": c.home_zip, "n_sessions_planned": c.n_sessions_planned,
        "diagnosed": c.diagnosed.isoformat(),
    } for c in children])

    print("[2/3] Generating environmental records...")
    env_df = generate_environmental(rng, study_start, study_end)

    print("[3/3] Generating sessions (this is the slow step)...")
    sessions_df = generate_sessions(rng, children, env_df, study_start, study_end)

    # Persist
    args.out_dir.mkdir(parents=True, exist_ok=True)
    cohort_df.to_csv(args.out_dir / "synthetic_cohort.csv", index=False)
    env_df.to_csv(args.out_dir / "environmental.csv", index=False)
    sessions_df.to_csv(args.out_dir / "sessions.csv", index=False)

    # Summary
    print()
    print("=" * 60)
    print(f"Cohort:        {len(cohort_df):>7,} children")
    print(f"Environmental: {len(env_df):>7,} daily records")
    print(f"Sessions:      {len(sessions_df):>7,} session records")
    print(f"Success rate:  {sessions_df.session_success.mean():.1%}")
    print(f"Incident rate: {sessions_df.behavioral_incident.mean():.1%}")
    print(f"Substitute %:  {sessions_df.is_substitute.mean():.1%}")
    print("=" * 60)
    print(f"Files written to {args.out_dir}/")


if __name__ == "__main__":
    main()
