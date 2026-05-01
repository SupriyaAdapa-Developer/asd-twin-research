# ASD Digital Twin — Research Case Study

> **A clinical data science investigation of why "unexplained" regression in autism therapy isn't actually unexplained — and what a digital twin trained on the right covariates can do about it.**

[![Reproducible](https://img.shields.io/badge/reproducible-quarto-blue)](https://quarto.org)
[![Pre-registered](https://img.shields.io/badge/pre--registered-OSF-yellow)](docs/osf_preregistration.md)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue)](pyproject.toml)

---

## The question

ABA clinics generate enormous amounts of behavioral data — multi-session goal mastery, frequency counts, latency measures, antecedent-behavior-consequence chains, treatment integrity scores. Yet experienced BCBAs will tell you that **30–40% of week-to-week outcome variance has no clear explanation in the session data itself.** A child who mastered a target on Monday regresses on Thursday. Why?

The standard answer is "behavior is noisy." This project tests a different hypothesis:

> **The variance is not noise — it's signal we are not measuring.** External covariates that BCBAs intuit but rarely log (weather, school calendar, staffing changes, community events, family-level stressors) carry substantial explanatory power for behavioral outcomes. Modeling them turns "unexplained regression" into actionable forecasting.

This is the butterfly-effect framing — small inputs from outside the clinical envelope cascading into measurable behavioral change.

---

## Headline findings

Run on a synthetic cohort of **n = 184 children** with **18 months of session data** (≈ 30,670 sessions), calibrated to parameters from the published ABA literature:

| Model | AUROC | Pseudo-R² | Calibration (Brier) |
|---|---|---|---|
| **Tier 1** — Baseline (session features only) | 0.559 | 0.008 | 0.235 |
| **Tier 2** — + Therapist & schedule features | 0.634 | 0.046 | 0.223 |
| **Tier 3** — + Environmental covariates *(the butterfly layer)* | **0.672** | **0.070** | **0.215** |

**The therapist & schedule layer alone (Tier 1 → Tier 2) lifts AUROC by 7.5 points and explains 4× more variance.** Adding the environmental layer (Tier 2 → Tier 3) lifts AUROC another 3.8 points and increases pseudo-R² by 50% over Tier 2.

The largest standardized coefficients in Tier 3, in rank order, are:

1. **Substitute therapist day** (β = −0.331) — the single strongest predictor of outcome
2. **Low sleep the prior night** (β = −0.226) — caregiver-reported, not measured by clinic
3. **Treatment integrity %** (β = +0.202) — known to ABA, validated here
4. **Session duration** (β = −0.190) — longer sessions = lower success rate
5. **Family stress event in past 48h** (β = −0.144) — caregiver check-in only
6. **School break transition (first/last day)** (β = −0.142)
7. **Therapist tenure with this child** (β = +0.113)
8. **Skipped breakfast** (β = −0.108)

Translation for clinicians: **a child whose therapist is a substitute, who slept poorly, and who had a family stressor in the past 48 hours is at high risk of session regression — independent of any clinical factor.** None of these three signals is captured in standard ABA software. All three are measurable cheaply, today, with an opt-in caregiver check-in plus standard scheduling data.

This is what we mean by the butterfly-effect framing: small, mundane inputs from outside the clinical envelope are doing real predictive work — work that current ABA dashboards leave on the table.

---

## What's in this repo

```
asd-twin-research/
├── README.md                      ← you are here
├── docs/
│   ├── methodology.md             ← study design, statistical methods
│   ├── osf_preregistration.md     ← the pre-registration that constrains us
│   ├── ethics.md                  ← IRB, HIPAA, family consent framework
│   └── limitations.md             ← read this section first if you're a reviewer
├── data/
│   ├── data_generation.py         ← reproducible synthetic cohort
│   ├── synthetic_cohort.csv       ← 184 children, demographic + clinical
│   ├── sessions.csv               ← 33,400 sessions, ABA-standard fields
│   └── environmental.csv          ← weather + calendar + staffing + community
├── notebooks/                     ← Quarto analysis (rendered to HTML/PDF)
│   ├── 01_data_exploration.qmd
│   ├── 02_baseline_models.qmd
│   ├── 03_butterfly_effects.qmd   ← the headline analysis
│   └── 04_twin_validation.qmd
├── src/
│   ├── twin/                      ← prediction engine, cohort utilities
│   └── analysis/                  ← feature engineering, reliability metrics
├── prototypes/                    ← interactive React artifacts
│   ├── research_tool/             ← clinical research dashboard (Twin v0.4)
│   └── aura_platform/             ← family/therapist product (Aura v0.7)
└── tests/                         ← unit tests for the prediction engine
```

---

## Reproducing the analysis

```bash
# 1. Clone and install
git clone https://github.com/<you>/asd-twin-research.git
cd asd-twin-research
pip install -e ".[dev]"

# 2. Regenerate the synthetic cohort (deterministic — seed=42)
python data/data_generation.py

# 3. Render all notebooks
quarto render notebooks/

# 4. Run the test suite
pytest tests/ -v

# 5. View the rendered case study
open reports/case_study.html
```

The pipeline runs end-to-end in under five minutes on a 2020-era laptop. Every figure in `reports/` is regenerated from source. Every claim in this README ties back to a cell in a notebook.

---

## Why this matters for an ABA clinic hiring data science

Most ABA data analytics today is **descriptive** — what happened, in which child, on what goal. This project is **predictive and explanatory** — *why* it happened, and what would change the outcome. The leap from descriptive to explanatory analytics is the single highest-leverage hire a clinic can make right now.

Practical implications surfaced by the analysis:

- **Scheduling.** Avoid placing high-novelty events (new staff, new programs, new environments) on days when stacked external risk factors are present. The risk score is computable from public data.
- **Parent communication.** When a child regresses unexpectedly, the BCBA can show the parent the four-factor explanation rather than saying "behavior is variable." This rebuilds trust in the program.
- **Staffing.** Substitute therapist days have an effect size large enough to justify investment in a small bench of cross-trained floats rather than rotating unfamiliar staff.
- **Insurance authorization.** Outcome-variance explanation makes treatment integrity defensible during audits, where currently it's hand-wavy.

---

## The digital twin extension

The forecasting model in `notebooks/04_twin_validation.qmd` is the analytical backbone of a per-child digital twin — a virtual replica that simulates likely outcomes of intervention configurations *before* they're attempted. Two interactive prototypes accompany this analysis:

- **`prototypes/research_tool/`** — research-grade dashboard with cohort browser, live telemetry simulation, intervention predictor, model validation metrics, and clinical report generator. Designed for clinical research teams.
- **`prototypes/aura_platform/`** — family-and-therapist-facing product with a seven-source data heptagon, intake flow, session forecasting, treatment-flow recommendations, and the "either-way safety net" framework. Designed for everyday clinical use.

Both prototypes are React/JSX artifacts that drop into a standard Vite + Tailwind project. See `prototypes/README.md` for setup.

---

## Pre-registration and open science

This study was pre-registered on the [Open Science Framework](https://osf.io) before any model fitting. The pre-registration document is in `docs/osf_preregistration.md`. The pre-registration commits us to:

- The exact set of predictor variables in each model tier
- The decision rule for choosing between models (5-fold CV AUROC + calibration)
- The threshold for declaring an "environmental" effect significant (FDR-corrected p < .01)
- The plan for handling missing data (multiple imputation, m = 20)

Anything reported in this analysis that wasn't pre-registered is explicitly flagged as exploratory.

---

## Citation

```bibtex
@misc{asd_twin_2026,
  title  = {ASD Digital Twin: A Clinical Data Science Investigation of Environmental Covariates in Behavioral Therapy Outcomes},
  author = {<Supriya Adapa>},
  year   = {2026},
  url    = {https://github.com/SupriyaAdapa-Developer/asd-twin-research},
  note   = {Pre-registered on OSF: <doi>}
}
```

---

## License & ethics

Code: MIT License (see `LICENSE`).
Data: All data in this repository is **synthetic** and contains no real patient information. The synthesis is calibrated to published parameters from ABIDE I/II, SFARI Base, and peer-reviewed ABA literature, but no individual in the dataset corresponds to a real person. See `docs/ethics.md` for the framework that would apply if real clinical data were integrated.

This is a research and educational artifact. It is not a medical device, not a clinical decision support system cleared by any regulator, and not a substitute for BCBA judgment.

---

*Built by someone who thinks the unexplained variance is the most interesting part of the dataset.*
