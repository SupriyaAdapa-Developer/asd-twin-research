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

Warm cream/navy/terracotta palette. Seven views including the Heptagon data architecture, Session forecast, Treatment flow, and the Either-way safety net. For families and therapists.

---

## Deploy to Vercel (recommended — gets you a live URL)

Vercel is free for personal projects and connects directly to GitHub. Each prototype deploys independently to its own URL.

### One-time: connect Vercel to GitHub

1. Go to **https://vercel.com** and sign in with your GitHub account
2. Click **"Add New" → "Project"**
3. Find `asd-twin-research` in the list and click **"Import"**

### Deploy the research_tool

When Vercel asks how to configure the project:

- **Project Name:** `asd-twin-research-tool` (or whatever you want)
- **Framework Preset:** Vite (auto-detected)
- **Root Directory:** click "Edit" → select `prototypes/research_tool`
- **Build Command:** leave default (`npm run build`)
- **Output Directory:** leave default (`dist`)

Click **Deploy**. Wait 1–2 minutes. You'll get a URL like `https://asd-twin-research-tool.vercel.app`.

### Deploy the aura_platform

Repeat the import flow:

1. Vercel dashboard → "Add New" → "Project"
2. Find `asd-twin-research` again, click **Import**
3. **Project Name:** `aura-twin-platform`
4. **Root Directory:** click "Edit" → select `prototypes/aura_platform`
5. Click **Deploy**

You now have two live URLs.

### Add the URLs to your README

Once deployed, edit the main `README.md` and add a "Live demos" section near the top:

```markdown
## Live demos

- 🔬 [Research Dashboard](https://asd-twin-research-tool.vercel.app) — clinical analytics
- 🌅 [Aura Platform](https://aura-twin-platform.vercel.app) — family/therapist product
```

Vercel automatically rebuilds and redeploys every time you push to GitHub. Your live demos stay in sync with your code.

---

## Run locally instead

If you want to run a prototype on your own machine without deploying:

```bash
cd prototypes/research_tool   # or prototypes/aura_platform
npm install                   # downloads dependencies, ~30s, only needed once
npm run dev                   # starts the dev server
```

Open http://localhost:5173 in your browser. The app reloads automatically as you edit the code.

To produce a static build:

```bash
npm run build                 # outputs to dist/
npm run preview               # serves dist/ locally to preview
```

---

## Tech stack

- **React 18** — UI library
- **Vite 6** — build tool and dev server
- **Tailwind CSS** — utility-first styling
- **lucide-react** — icon set
- **recharts** — chart library

No backend. All data is in-memory, generated client-side at component mount. The "predicted probability of success" numbers in the prototypes are illustrative; the real model is in `src/twin/prediction.py` in the parent repository.

For a deployed version, the prototype would call a Python service wrapping `TieredPipeline`. See `notebooks/04_twin_validation.qmd` for the forecast function signature.
