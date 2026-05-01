# Interactive Prototypes

This directory contains the React/JSX prototypes that demonstrate the digital
twin in two different stakeholder contexts.

## What's here

```
prototypes/
├── research_tool/
│   ├── research_dashboard.jsx     # Clinical research dashboard (Twin v0.4)
│   └── beyond_the_session.jsx     # Research-narrative variant
└── aura_platform/
    └── aura_platform.jsx          # Family/therapist product (Aura v0.7)
```

### `research_tool/research_dashboard.jsx`

A research-grade dashboard for clinical research teams. Six views:

1. **Cohort browser** — filterable view of the synthetic cohort with severity, phenotype, and engagement metrics
2. **Twin profile** — per-child digital twin view with calibration, sensitivities, and intervention history
3. **Live telemetry** — simulated real-time HRV, EDA, and predicted cortisol during a session
4. **Simulate intervention** — counterfactual forecast of session outcome under modifiable parameters
5. **Model & validation** — AUROC, calibration curves, coefficient tables, equity audit
6. **Clinical report** — auto-generated executive summary for a child

Aesthetic: dark scientific. Fonts: Fraunces (display) + Geist (body) + JetBrains Mono (data).

### `aura_platform/aura_platform.jsx`

Family-and-therapist-facing product. Seven views:

1. **Welcome** — onboarding for a new family
2. **Intake** — three-step intake flow with document upload
3. **Heptagon** — the seven-source data architecture visualization (centerpiece)
4. **Twin profile** — child-friendly version of the digital twin
5. **Session forecast** — interactive forecast with environmental sliders
6. **Treatment flow** — recommended program with the "either-way safety net"
7. **Safety net** — Plan A / Plan B framework for de-escalation

Aesthetic: warm, trustworthy. Palette: cream/navy/terracotta. Fonts: Newsreader (display) + DM Sans (body) + JetBrains Mono (data).

## Running locally

The prototypes are single-file React components designed to drop into a
standard Vite + Tailwind + lucide-react + recharts project.

### Quick setup

```bash
# 1. Create a new Vite project
npm create vite@latest twin-demo -- --template react
cd twin-demo

# 2. Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react recharts

# 3. Configure Tailwind
# In tailwind.config.js, set content: ["./src/**/*.{js,jsx,ts,tsx}"]
# In src/index.css, add: @tailwind base; @tailwind components; @tailwind utilities;

# 4. Drop the prototype in
cp /path/to/this-repo/prototypes/research_tool/research_dashboard.jsx src/App.jsx
# (rename the export accordingly, or import as a named component)

# 5. Run
npm run dev
```

The prototypes use only:

- **React** (default export from JSX)
- **lucide-react** (icons)
- **recharts** (data visualization)

No backend is required. All data is in-memory, generated client-side at mount.

## Relationship to the analysis

The prototypes' "predicted probability of success" numbers are **illustrative**
and computed client-side from a small embedded approximation. The real model
that backs them is in `src/twin/prediction.py` and the analysis in
`notebooks/03_butterfly_effects.qmd` and `notebooks/04_twin_validation.qmd`.

In a deployed version, the prototype would call a Python service (FastAPI
typically) wrapping `TieredPipeline`. The forecast endpoint signature would be:

```python
POST /forecast
{
  "child_id": "CH0001",
  "session_plan": { "type": "DTT", "location": "clinic", ... },
  "environmental_overrides": { "low_sleep_night": true, ... }
}
→
{
  "p_success": 0.71,
  "top_factors": [
    { "feature": "is_substitute", "contribution": -0.12 },
    { "feature": "low_sleep_night", "contribution": -0.09 }
  ]
}
```

A reference Python wrapper is in `src/twin/prediction.py`'s `forecast()` helper
shown in notebook 04.

## Aesthetic notes

The two prototypes use deliberately different visual languages because their
audiences require it:

- **Research dashboard**: dark mode, monospace data, precision aesthetics — signals "this is a tool for analytical professionals"
- **Aura platform**: warm cream palette, friendly serif headers, large trust-building elements — signals "this is for families navigating an emotionally heavy decision"

A real product team would test both with their actual users; a portfolio piece
shows that the candidate understands the choice has to be made.

## Provenance

Both files are syntactically validated (Babel parser + esbuild) and ran clean
in a sandboxed React render. They are single-file artifacts — no separate
CSS or sub-components — to maximize portability.
