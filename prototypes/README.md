# Interactive Prototypes

Two React/Vite projects you can run locally or deploy to Vercel as live websites.

```
prototypes/
├── research_tool/         ← Clinical research dashboard (Twin v0.4)
│   ├── src/App.jsx        ← The actual app
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── tailwind.config.js
│   └── vercel.json        ← Vercel deployment config
└── aura_platform/         ← Family/therapist product (Aura v0.7)
    └── (same structure)
```

## What each prototype is

### `research_tool/` — Clinical Research Dashboard

Dark scientific aesthetic. Six views: Cohort browser, Twin profile, Live telemetry, Simulate intervention, Model & validation, Clinical report. For research teams.

### `aura_platform/` — Aura, family-facing product

Warm cream/navy/terracotta palette. Seven views, including the Heptagon data architecture, Session forecast, Treatment flow, and the Either-way safety net. For families and therapists.

```markdown
## Live demos

- 🔬 [Research Dashboard](https://asd-twin-research.vercel.app) — clinical analytics
- 🌅 [Aura Platform](https://asd-twin-aura-platform.vercel.app) — family/therapist product
```

---

## Run locally instead

If you want to run a prototype on your own machine without deploying:

```bash
cd prototypes/research_tool   # or prototypes/aura_platform
npm install                   # downloads dependencies, ~30s, only needed once
npm run dev                   # starts the dev server
```

## Tech stack

- **React 18** — UI library
- **Vite 6** — build tool and dev server
- **Tailwind CSS** — utility-first styling
- **lucide-react** — icon set
- **recharts** — chart library

No backend. All data is in-memory, generated client-side at component mount. The "predicted probability of success" numbers in the prototypes are illustrative; the real model is in `src/twin/prediction.py` in the parent repository.

For a deployed version, the prototype would call a Python service wrapping `TieredPipeline`. See `notebooks/04_twin_validation.qmd` for the forecast function signature.
