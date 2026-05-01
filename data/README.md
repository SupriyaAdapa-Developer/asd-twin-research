# Data Dictionary

This directory contains the synthetic cohort, session-level, and environmental
data that drive the analysis. **All data is synthetic.** It is generated from
`data_generation.py` with `seed=42` and contains no real patient information.

## Files

| File | Rows | Description |
|---|---|---|
| `synthetic_cohort.csv` | ~184 | One row per child — demographics + clinical baseline |
| `sessions.csv` | ~30,670 | One row per ABA session — outcome and context |
| `environmental.csv` | ~2,740 | One row per zip-day — weather, calendar, community |

## Regenerating

```bash
python data/data_generation.py --seed 42 --n-children 184
```

Determinism is guaranteed: same seed → bit-identical CSVs.

---

## `synthetic_cohort.csv`

Child-level demographics and clinical baseline. Joins to `sessions.csv` on `child_id`.

| Column | Type | Source / Calibration | Description |
|---|---|---|---|
| `child_id` | str | generated | Anonymized identifier (CH0001 — CH0184) |
| `age` | int | normal(8, 3.2), clipped [3, 17] | Years at study entry |
| `sex` | str | M:F = 4.2:1 (CDC ADDM 2023) | "M" or "F" |
| `severity` | str | 38/47/15% (Lord 2020) | "ASD-1", "ASD-2", "ASD-3" |
| `ados_calss` | int | normal(3 + 2.5·sev_w, 1.4) | ADOS-2 Calibrated Severity Score, 1–10 |
| `srs2_t` | int | normal(60 + 9·sev_w, 9) | SRS-2 Total T-score, normed |
| `cognitive_fsiq` | int | normal(92 − 4·sev_w, 18) | WISC-V FSIQ approximation |
| `sensory_total` | int | normal(140 + 18·sev_w, 25) | Sensory Profile-2 total raw score |
| `pollen_sensitive` | bool | 27% prevalence | Documented pollen sensitivity |
| `pressure_sensitive` | bool | 22% prevalence | Documented weather/pressure sensitivity |
| `home_zip` | str | uniform from 5 metro zips | Used to join environmental records |
| `n_sessions_planned` | int | normal(180, 50) | Target session count for the study window |
| `diagnosed` | date | 6 mo–4 yr prior | Date of ASD diagnosis |

---

## `sessions.csv`

Session-level records. **The primary table for analysis.**

| Column | Type | Description |
|---|---|---|
| `session_id` | str | Unique session identifier (S0000001+) |
| `child_id` | str | FK to cohort |
| `session_date` | date | ISO 8601 |
| `session_number` | int | Sequence within child |
| `session_type` | str | DTT, NET, Group, ParentTraining, Sensory, Music |
| `duration_min` | int | 30, 45, 60, or 90 |
| `n_programs` | int | Number of distinct programs run, 1–18 |
| `goal_domain` | str | communication, social, academic, ADL, behavior_reduction |
| `location` | str | clinic, home, school, community |
| `time_of_day` | str | morning, afternoon, evening |
| `day_of_week` | int | 0=Mon … 4=Fri |
| `therapist_id` | str | Anonymized (T001–T999) |
| `is_substitute` | bool | True if not the primary therapist |
| `therapist_tenure_with_child_days` | int | Days since first session with this child |
| `treatment_integrity_pct` | float | 50–100, beta-distributed |
| `low_sleep_night` | bool | Caregiver-reported, sleep ≤ 2/5 |
| `skipped_breakfast` | bool | Caregiver-reported, no breakfast |
| `family_stress_event` | bool | Stressor reported in past 48h |
| `family_stress_category` | str | sibling/caregiver_work/household_change/medical/financial |
| `fire_drill` | bool | School fire drill that day |
| **`session_success`** | bool | **PRIMARY OUTCOME** — ≥ 80% planned trials at criterion |
| `behavioral_incident` | bool | Any logged SIB / ATO / property / elopement |
| `incident_type` | str | If incident, which category |
| `mastery_delta` | float | Continuous outcome — change in mastered targets |
| `p_success_groundtruth` | float | **GROUND TRUTH probability** — used only for validation, not as a predictor |

⚠️ **`p_success_groundtruth`** is the latent probability the data generator
used to draw the binary outcome. It is included only so the analysis can verify
its calibration against the true generative process. **Do not use it as a
predictor** — it would be a perfect leakage feature.

---

## `environmental.csv`

Daily environmental records by zip code. Joins to `sessions.csv` on
`(session_date, home_zip) ↔ (date, zip)`.

| Column | Type | Description |
|---|---|---|
| `date` | date | ISO 8601 |
| `zip` | str | One of 5 US metro zip codes |
| `temp_c` | float | Daily mean, with seasonal cycle + AR(1) noise |
| `temp_delta_c` | float | Change from prior day |
| `pressure_hpa` | float | Daily mean barometric pressure |
| `pressure_delta_hpa` | float | Change from prior day |
| `pressure_swing` | bool | abs(pressure_delta) > 5 hPa |
| `precipitation_mm` | float | Daily, exponential-distributed |
| `pm25_ugm3` | float | PM2.5 air quality |
| `pollen_index` | float | 0–100, seasonal cycle |
| `high_pollen` | bool | pollen_index > 75 |
| `sunlight_hours` | float | Daily sunlight after cloud-cover proxy |
| `is_school_day` | bool | School calendar |
| `school_break` | bool | Winter / spring / summer break |
| `break_transition` | bool | First/last day of a break window (±1 day) |
| `is_holiday` | bool | Federal holiday |
| `post_dst_window` | bool | ±3 days of DST transition |
| `construction_local` | bool | Construction within 200m, ~8% of days |
| `community_event` | bool | Major event within 5km, ~4% of days |
| `testing_week` | bool | Standardized testing window |

---

## Provenance & calibration sources

The synthesis is calibrated to distributions from:

- **ABIDE I & II** — demographic and phenotype parameters (Di Martino 2014, 2017)
- **Cortisol AUCg** parameters: Corbett et al. 2008; Spratt et al. 2012
- **HRV (RMSSD) parameters:** Bujnáková et al. 2016; Patriquin et al. 2019
- **Sensory Profile-2 distributions:** Tomchek & Dunn 2007
- **CDC ADDM Network** sex ratio: 2023 surveillance report
- **ABA outcome base rates:** BACB clinical aggregates 2018–2024

Note that no individual record corresponds to any real person. The synthesis
uses these published distributions only for parameter calibration (means,
variances, correlations) — not for direct copying of any data point.

---

## Important caveat — synthesis is not validation

The `data_generation.py` script *encodes* the environmental effects that the
analysis later "discovers." This means:

- ✅ The pipeline correctly recovers ground-truth coefficients → analytic code is sound
- ❌ It does NOT prove these coefficients exist in real clinical data
- → A real-data replication is required before any clinical conclusion

See `docs/limitations.md` for the full caveats.
