# Ethics Framework

This document describes the ethical framework that would govern any extension of this work to real clinical data. The synthetic-data analysis in this repository does not require IRB approval, but the framework is written to be portable to a real-data replication.

## Status of the data in this repository

**All data in this repository is synthetic.** No record corresponds to any real person. The synthesis is calibrated to published distributional parameters from peer-reviewed studies, but no individual values are drawn from any identifiable person. This is documented in `data/README.md` and the data-generation script's docstring.

This repository is therefore **not** a Limited Data Set, **not** a De-identified Data Set, and **not** Protected Health Information under HIPAA. It can be shared, forked, and modified freely under the MIT License.

## What changes for real-data replication

Any replication of this work on real clinical data triggers obligations under multiple frameworks. The following section describes the framework I would propose to a clinic considering a partnership.

### 1. IRB approval

Before any access to identifiable clinical data, an IRB protocol is filed describing:

- The research question and analytic plan (the pre-registration in `osf_preregistration.md` is the basis)
- The data elements requested
- The minimum-necessary justification for each element
- The data-handling plan (encryption, access controls, retention, destruction)
- The risk to subjects and the mitigations
- The benefit to the field and (when relevant) to the subjects themselves

The default expectation is **expedited review** under 45 CFR 46.110(b)(5) — research involving the analysis of existing data, with appropriate safeguards. If real-time wearable telemetry is added, **full board review** is required.

### 2. HIPAA framework

If working with a covered entity (most ABA clinics that bill insurance qualify), the analysis is conducted under one of:

**A. Limited Data Set + Data Use Agreement (preferred for this analysis).** Removes 16 of the 18 HIPAA identifiers; retains dates and zip codes. The DUA constrains use, redisclosure, and security obligations. Compatible with the environmental-covariate analysis since it requires zip-code-level weather attribution.

**B. De-identified data (Expert Determination or Safe Harbor method).** Lowest risk but loses date precision and geographic granularity, compromising the environmental-covariate analysis.

**C. Authorization for specific research use.** Used only when individually identified data is necessary, which is not the case here.

The analytic environment runs inside a HIPAA-compliant cloud (AWS or Azure with BAA in place), with audit logging of all data access, no exfiltration of identifiable data to local machines, and PHI encryption at rest (AES-256) and in transit (TLS 1.3).

### 3. Family consent and assent

Beyond regulatory requirements, real-data replication should obtain:

**Affirmative parental consent** for any child whose data is included. Standard ABA service agreements often include broad data-use clauses that may not adequately disclose research participation; a separate, plain-language consent form is preferred.

**Assent from children where developmentally appropriate.** Many autistic children are capable of understanding "your therapist is helping a researcher learn what makes therapy work better, and your information is part of that — you can say no." Where a child cannot or does not assent, the data should not be included.

**Right of withdrawal at any time.** Withdrawal must remove that child's data from any analysis not yet published, with reasonable effort to remove influence on already-trained models (re-training without that child's data).

### 4. Specific concerns for autism research

Autism research has a difficult history that this framework explicitly addresses:

**Surveillance vs. support.** Wearable telemetry can become a surveillance tool. The system must be designed to support the child, not to monitor them for compliance with neurotypical behavioral norms. Outcomes that reduce stim, eliminate special interests, or enforce eye contact are outside the legitimate scope of this work. The treatment plan defines what counts as "success" — and that plan is co-designed with the family and the child where possible.

**Neurodiversity-affirming framing.** Where intervention goals are described, they are described in terms of the child's own functioning, regulation, and self-determination — not in terms of indistinguishability from neurotypical peers. Goals that the autistic community has identified as harmful (suppression of stims, forced eye contact as a goal in itself, "quiet hands" as compliance) are flagged in the data dictionary and excluded from analytic outcome variables.

**Avoiding the "cure" narrative.** This work is not about reducing autism. It is about reducing the friction between autistic children and the environments they navigate. The analytic outcomes (session success, behavioral incidents, mastery progression) are clinical workflow outcomes, not life-outcomes for the child.

**Inclusion of autistic perspectives.** Any clinic partnership for real-data replication includes review by at least one autistic adult researcher or self-advocate, paid at appropriate consulting rates, with the authority to flag specific outcome variables or framings as harmful.

### 5. The wearable-telemetry question

The digital twin prototypes show real-time HRV, EDA, and predicted cortisol trajectories during sessions. If implemented with real wearables on real children, this raises several concerns:

- **Sensory tolerance.** Many autistic children have tactile sensitivities that make wrist-worn devices intolerable. Devices must be optional, and inability to wear cannot exclude a child from the standard care benefit.
- **Continuous monitoring stress.** The knowledge of being monitored may itself alter behavior and physiology. Children should be able to remove the device at any time without consequence.
- **Data ownership.** Physiological data belongs to the child (and parental guardian). Clinics access it under a defined-purpose license, not ownership.
- **Algorithmic harms.** A model that predicts meltdowns may also be used to deny access to community settings ("the model says today is high-risk, so we'll keep her home"). This is a denial of human rights dressed up as risk management. The system must be designed to expand the child's options, not contract them.

### 6. Data lifecycle

For real-data work:

- **Acquisition:** From clinic EHR exports under DUA, with BAA in place
- **Storage:** Encrypted at rest in a HIPAA-compliant environment, 7-year retention per HIPAA, then verified destruction
- **Access:** Role-based, audit-logged, MFA required, time-limited credentials
- **Sharing:** No identifiable data shared outside the analysis team; aggregate/synthetic results shared per the publication plan
- **Re-use:** Limited to the purposes specified in the consent and DUA; new uses require IRB amendment

### 7. Algorithmic accountability

If the prediction models in this work are used to inform real clinical decisions:

- **Decisions remain with the BCBA.** The model is decision support, not decision authority. The clinical workflow makes this explicit at every prediction display.
- **Model performance is monitored.** Calibration and AUROC are computed quarterly on incoming data. A drop below pre-specified thresholds triggers retraining and re-validation.
- **Demographic equity audits.** Performance is audited by sex, age band, severity tier, race/ethnicity, and primary language. Disparities trigger remediation, including potential re-design of the feature set.
- **Override logging.** When a clinician overrides the model, the override is logged with the reason. Patterns of override are reviewed and used to improve the model — clinician judgment is treated as a signal, not as noise.
- **Family explanation.** When a model recommendation affects a child's program, the family receives a plain-language explanation of why and what the alternatives were.

### 8. Conflict of interest

Anyone involved in the analysis with financial interest in autism therapy delivery, autism software, wearable manufacturers, or autism-services investors must disclose. Conflicts do not automatically disqualify; they require disclosure and recusal from specific decisions.

---

This framework is written to be more conservative than what most clinics currently practice. That is intentional. The goal is to set a defensible and ethical bar that this work, and others derived from it, can be held to.
