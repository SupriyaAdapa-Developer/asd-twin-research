# Methodology

## Study design

This is a **retrospective observational analysis** on synthetic data calibrated to published ABA literature, with a pre-registered analytic plan. The analysis is designed to be directly portable to a real clinical dataset under an IRB-approved protocol (see `ethics.md`).

The unit of analysis is a **session-outcome record**: one row per session, where each row captures the antecedent context, the planned program, the in-session behavioral data, and the outcome label.

The outcome variables are:

1. **Session success** (binary): defined as ≥80% of planned trials/opportunities completed at criterion. This is the standard mastery-progress threshold across most ABA programs.
2. **Behavioral incident** (binary): any logged event of self-injurious behavior, aggression toward others, property destruction, or elopement during the session.
3. **Mastery progression** (continuous): change in cumulative mastered targets per goal-week, derived from session probe data.

## Cohort

The synthetic cohort comprises **n = 184 children** with autism, aged 3–17, diagnosed via ADOS-2 with severity levels distributed:

- ASD-1 (requiring support): 38%
- ASD-2 (requiring substantial support): 47%
- ASD-3 (requiring very substantial support): 15%

Sex distribution is M:F = 4.2:1, calibrated to current epidemiological estimates (CDC ADDM Network, 2023). Each child has 60–270 logged sessions over an 18-month window, for a total of approximately 33,400 session records.

The synthesis script (`data/data_generation.py`) draws physiological baselines, sensory profile values, ADOS calibrated severity scores, and behavioral tendencies from distributions calibrated against:

- ABIDE I & II demographic and phenotype data (Di Martino et al., 2014, 2017)
- Cortisol AUCg parameters from Corbett et al. (2008) and Spratt et al. (2012)
- HRV (RMSSD) parameters from Bujnáková et al. (2016) and Patriquin et al. (2019)
- Sensory Profile-2 distributions from Tomchek & Dunn (2007)
- ABA session outcome base rates from BACB clinical studies aggregated 2018–2024

## Predictor tiers

Models are fit in nested tiers to isolate the marginal contribution of each layer.

### Tier 1 — Baseline (session features only)

What most clinic dashboards already have:

- Session type (DTT, NET, group, parent training)
- Session duration (minutes)
- Number of programs run
- Goal domain (communication, social, academic, ADL, behavior reduction)
- Session location (clinic, home, community, school)
- Time of day
- Day of week
- Session number in current intervention block

### Tier 2 — Therapist & schedule features

What better dashboards add:

- All Tier 1 features
- Therapist ID (anonymized, included as random effect)
- Therapist tenure with this child (days)
- Therapist tenure overall (months)
- Substitute / float therapist flag
- Hours since therapist's last shift
- Days since child's last session
- Days until next school break

### Tier 3 — Environmental covariates (the butterfly layer)

What no dashboard currently has:

**Weather** (from NOAA / OpenWeatherMap APIs by zip code):

- Daily mean temperature (°C)
- Daily temperature delta from prior day
- Barometric pressure (hPa)
- 24-hour pressure delta (sensitivity flag if > ±5 hPa)
- Precipitation (mm)
- Air quality index (PM2.5)
- Pollen index (where available; allergen-specific if child has documented sensitivity)
- Sunlight hours

**Calendar** (from school district + federal/state):

- School day vs. break day
- First day after a break (transition flag)
- Last day before a break (anticipation flag)
- Standardized testing week (school-age children)
- Federal holiday or observance
- Daylight saving transition window (±3 days)

**Community** (from local APIs + manual coding):

- Local construction within 200m of clinic (binary)
- Major community event (parade, festival, sports event) within 5 km (binary)
- School fire drill, lockdown, or major schedule disruption that day

**Family** (from caregiver daily check-in, where available):

- Caregiver-reported family stress event (binary, with category)
- Sleep quality the prior night (1–5 scale)
- Breakfast eaten that morning (binary)
- New caregiver, sibling event, or household change in past 7 days

### Tier 4 — Random effects extension

Tier 3 features plus a per-child random intercept and random slopes for the three highest-variance Tier 1 predictors. Fit as a generalized linear mixed model (GLMM) using `statsmodels.MixedLM` for continuous outcomes and `pymc` for the binary logistic version where Bayesian credible intervals are reported.

## Statistical methods

**Primary analysis.** Logistic regression with L2 regularization (λ chosen by 5-fold CV on the training partition). Reported metrics: AUROC on the held-out test set, calibration via Brier score and reliability diagram, and McFadden's pseudo-R² for variance-explanation comparisons across tiers.

**Secondary analysis.** Gradient-boosted trees (LightGBM, with monotonic constraints on clinically-known predictors to prevent reversals) for non-linear effect estimation. Used for cross-validating the linear model's coefficient signs and surfacing interaction effects.

**Tertiary analysis.** Per-child Bayesian hierarchical model in PyMC, with weakly informative priors on environmental coefficients (centered at zero, σ = 0.5). This is the "digital twin" model — its posterior predictive distributions are the forecasts shown in the prototypes.

**Train/validation/test split.** 70/15/15, stratified by child to prevent within-child contamination across splits. Within-child sessions are kept in the same partition to test whether the model generalizes across children (the harder, more honest test).

**Variable selection.** All Tier 1 and Tier 2 predictors are forced in, regardless of significance. Tier 3 environmental predictors are entered as a block, then individually tested using the Benjamini-Hochberg FDR procedure at q = 0.01.

**Missing data.** Tier 3 environmental features will be missing for some sessions (most commonly: caregiver check-ins not completed, pollen data unavailable for some zip codes). Handled via multiple imputation by chained equations (m = 20) using the `IterativeImputer` from scikit-learn.

## Decision rules (pre-specified)

- An environmental feature is reported as having a meaningful effect if and only if its FDR-corrected p < .01 *and* its standardized coefficient |β| > 0.10.
- The Tier 3 model is reported as superior to Tier 2 only if it improves test-set AUROC by ≥0.03 *and* its calibration (Brier) does not deteriorate.
- The hierarchical model is reported as superior to the regularized linear model only if posterior-predictive checks pass (Bayesian p-value between 0.05 and 0.95) *and* it improves test-set log-loss.

## Reliability and treatment integrity considerations

Where session data depend on therapist-coded events, **inter-observer agreement (IOA)** is computed as proportional agreement on a 15% sample of sessions (target ≥80%, standard ABA threshold).

**Treatment integrity** (the degree to which the planned program was actually delivered as written) is encoded as a per-session score from 0–100% based on therapist self-report and supervisor spot-checks. Sessions with TI < 80% are flagged and a sensitivity analysis re-runs the primary models with these excluded.

## Reporting standards

The analysis follows:

- **TRIPOD** (Transparent Reporting of a multivariable prediction model for Individual Prognosis Or Diagnosis) — for the prediction model components.
- **CONSORT-AI** extension — for the AI-augmented decision support framing.
- **STROBE** — for the observational analysis components.

A completed checklist for each is included in `reports/reporting_checklists/`.

## Software environment

Pinned in `pyproject.toml`. Headline versions:

- Python 3.11.7
- pandas 2.2.0, numpy 1.26.3
- scikit-learn 1.4.0
- statsmodels 0.14.1, pymc 5.10.0
- lightgbm 4.3.0
- quarto 1.4.550

The full environment is captured in `requirements.lock`. A Docker image is provided for reviewers who want bit-identical reproducibility.

## Pre-registration

This methodology was pre-registered on OSF before any model fitting. See `osf_preregistration.md` for the constraining document. Any deviation from the pre-registered plan is reported in `notebooks/05_deviations.qmd` with explicit reasoning.
