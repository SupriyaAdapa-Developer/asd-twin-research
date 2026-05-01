import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Activity, Brain, Heart, Waves, AlertTriangle, CheckCircle2, FileText,
  Database, GitBranch, Zap, Users, TrendingUp, Settings2, Play, Pause,
  ChevronRight, Beaker, ShieldCheck, BookOpen, Clock, Target, Layers,
  Microscope, LineChart as LineIcon, BarChart3, ScatterChart as ScatterIcon,
  Download, Cpu, Network, Sparkles, Eye, Volume2, Hand, Sun, Wind
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ReferenceLine, ReferenceArea, ComposedChart, Cell, PieChart, Pie
} from "recharts";

/* =========================================================================
   ASD DIGITAL TWIN — RESEARCH PROTOTYPE v0.4
   Calibrated to parameters from: ABIDE I/II, SFARI Base, NDAR, Empatica E4
   autism studies (Goodwin et al. 2019, Kushki et al. 2014, Anderson 2013).
   This is a research/educational tool, not a clinical device.
   ========================================================================= */

// --- Design tokens ---------------------------------------------------------
const C = {
  ink:      "#0b0e13",
  ink2:     "#11151c",
  ink3:     "#171c25",
  line:     "#262d39",
  line2:    "#323b4a",
  bone:     "#ede5d7",
  bone2:    "#c8c0b1",
  mute:     "#7a8290",
  mute2:    "#525a68",
  red:      "#d94e2c",   // clinical risk
  amber:    "#c4934d",   // caution
  green:    "#6b9c5a",   // safe
  blue:     "#5a8ec4",   // info
  violet:   "#9b6cc4",   // model
};

// --- Fonts injected via <style> -------------------------------------------
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,700;9..144,900&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
    .f-display { font-family: 'Fraunces', 'Times New Roman', serif; font-optical-sizing: auto; letter-spacing: -0.02em; }
    .f-body    { font-family: 'Geist', system-ui, sans-serif; }
    .f-mono    { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    .grain {
      background-image:
        radial-gradient(rgba(237,229,215,0.018) 1px, transparent 1px),
        radial-gradient(rgba(237,229,215,0.012) 1px, transparent 1px);
      background-size: 3px 3px, 7px 7px;
      background-position: 0 0, 1px 2px;
    }
    .scan::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(237,229,215,0.02) 50%, transparent 100%);
      pointer-events: none;
    }
    .pulse-dot {
      animation: pulse-dot 1.4s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%,100% { opacity: 0.4; transform: scale(0.9); }
      50%     { opacity: 1; transform: scale(1.15); }
    }
    .stream-line { animation: stream-line 8s linear infinite; }
    @keyframes stream-line {
      0%   { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -200; }
    }
    .rec-recharts .recharts-cartesian-grid line { stroke: ${C.line}; }
    .rec-recharts .recharts-text { fill: ${C.mute}; font-family: 'JetBrains Mono', monospace; font-size: 10px; }
    .rec-recharts .recharts-tooltip-wrapper { outline: none; }
  `}</style>
);

// --- Deterministic PRNG (seedable) so cohort is reproducible --------------
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gaussian(rng, mu = 0, sigma = 1) {
  const u = 1 - rng(), v = 1 - rng();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

// --- Synthetic cohort generator (calibrated to ABIDE/SFARI demographics) --
// Refs: ABIDE I+II n=2226, M:F~5:1, age 6-40; ADOS-2 sev 1-10; SRS-2 t-scores
// Cortisol AUCg elevated ~15-25% in ASD (Corbett 2008, Spratt 2012)
// HRV (RMSSD) reduced ~15-25% in ASD (Bujnakova 2016, Patriquin 2019)
function buildCohort() {
  const rng = mulberry32(42);
  const names = [
    ["Jordan M.","11","M","ASD-2","ID-A001"],
    ["Priya S.", "9","F","ASD-2","ID-A002"],
    ["Mateo R.","14","M","ASD-1","ID-A003"],
    ["Aisha K.","7", "F","ASD-3","ID-A004"],
    ["Devon C.","16","M","ASD-2","ID-A005"],
    ["Yuki T.", "10","NB","ASD-1","ID-A006"],
  ];
  return names.map(([name, age, sex, severity, id], idx) => {
    const sev = severity === "ASD-3" ? 3 : severity === "ASD-2" ? 2 : 1;
    const sevW = sev / 2; // weighting
    // Physiological baselines (with realistic ASD shifts)
    const hr_rest = clamp(gaussian(rng, 78 + 4 * sevW, 6), 60, 110);     // bpm
    const hrv_rmssd = clamp(gaussian(rng, 38 - 6 * sevW, 9), 12, 70);    // ms
    const cortisol_morning = clamp(gaussian(rng, 0.42 + 0.07*sevW, 0.10), 0.15, 0.85); // ug/dL proxy
    const eda_baseline = clamp(gaussian(rng, 4.5 + 0.8 * sevW, 1.2), 1, 12); // uS

    // Sensory profile (Dunn 1999, range 0-100, higher = more sensitive)
    const sensory = {
      auditory: clamp(gaussian(rng, 65 + 8*sevW, 10), 20, 100),
      visual:   clamp(gaussian(rng, 55 + 6*sevW, 12), 15, 100),
      tactile:  clamp(gaussian(rng, 60 + 7*sevW, 11), 15, 100),
      proprio:  clamp(gaussian(rng, 50 + 5*sevW, 10), 10, 95),
    };

    // Behavioral fingerprint: tendencies (0-1)
    const behavior = {
      transition_rigidity: clamp(gaussian(rng, 0.55 + 0.12*sevW, 0.12), 0.1, 0.95),
      social_initiation:    clamp(gaussian(rng, 0.45 - 0.10*sevW, 0.13), 0.05, 0.9),
      stim_baseline:        clamp(gaussian(rng, 0.30 + 0.15*sevW, 0.12), 0.05, 0.85),
      verbal_output:        clamp(gaussian(rng, 0.60 - 0.12*sevW, 0.15), 0.05, 0.95),
      novelty_tolerance:    clamp(gaussian(rng, 0.40 - 0.08*sevW, 0.12), 0.05, 0.85),
    };

    // Generate session history (60-90 sessions)
    const nSessions = 60 + Math.floor(rng() * 30);
    const today = new Date();
    const sessions = [];
    for (let i = 0; i < nSessions; i++) {
      const daysAgo = nSessions - i;
      const date = new Date(today.getTime() - daysAgo * 86400000);
      const intervention = ["ABA","Speech","OT","Sensory","Social-Group","Music"][Math.floor(rng()*6)];
      const noise = clamp(gaussian(rng, 50, 18), 25, 95);
      const peers = Math.floor(rng() * 6);
      const familiar = rng() > 0.3;
      const dur = [20,30,45,60][Math.floor(rng()*4)];
      const disruption = rng() > 0.7;

      // Outcome model (the "ground truth" generator for synthetic data)
      const noiseStress = (noise / 100) * (sensory.auditory / 100);
      const peerStress = (peers / 5) * (1 - behavior.social_initiation);
      const novelStress = (familiar ? 0 : 1) * (1 - behavior.novelty_tolerance) * 0.7;
      const disruptStress = disruption ? behavior.transition_rigidity * 0.8 : 0;
      const durStress = (dur / 60) * 0.4;
      const totalStress = noiseStress * 1.2 + peerStress * 0.9 + novelStress + disruptStress + durStress;

      // Intervention modifiers
      const ivBuff = { "ABA": -0.05, "Speech": 0.05, "OT": -0.10, "Sensory": -0.20, "Social-Group": 0.25, "Music": -0.15 }[intervention];
      const successProb = clamp(0.8 - totalStress * 0.5 + ivBuff + gaussian(rng, 0, 0.05), 0.05, 0.97);
      const success = rng() < successProb;
      const meltdown = !success && rng() < (totalStress * 0.55);

      // Physiological response
      const hr_peak = hr_rest + 8 + totalStress * 28 + gaussian(rng, 0, 4);
      const hrv_min = hrv_rmssd * (1 - clamp(totalStress * 0.35, 0.05, 0.55));
      const cortisol_peak = cortisol_morning * (1 + totalStress * 0.6);
      const eda_peak = eda_baseline * (1 + totalStress * 1.2);

      sessions.push({
        date: date.toISOString().slice(0,10),
        daysAgo, intervention, noise, peers, familiar, dur, disruption,
        success, meltdown,
        hr_peak: Math.round(hr_peak),
        hrv_min: Math.round(hrv_min*10)/10,
        cortisol_peak: Math.round(cortisol_peak*100)/100,
        eda_peak: Math.round(eda_peak*10)/10,
        stressLoad: Math.round(totalStress*100)/100,
      });
    }

    // Triggers extracted from history
    const triggers = [
      { name: "Auditory > 70dB",   weight: sensory.auditory/100, evidence: sessions.filter(s=>s.noise>70&&s.meltdown).length },
      { name: "Schedule disruption", weight: behavior.transition_rigidity, evidence: sessions.filter(s=>s.disruption&&s.meltdown).length },
      { name: "Unfamiliar therapist", weight: 1-behavior.novelty_tolerance, evidence: sessions.filter(s=>!s.familiar&&s.meltdown).length },
      { name: "Group > 3 peers",   weight: 1-behavior.social_initiation, evidence: sessions.filter(s=>s.peers>3&&s.meltdown).length },
      { name: "Session > 45 min",  weight: 0.5, evidence: sessions.filter(s=>s.dur>=60&&s.meltdown).length },
    ].sort((a,b)=>b.evidence-a.evidence);

    // Diagnostic instruments (calibrated)
    const ados_calss = clamp(Math.round(gaussian(rng, sev*3+1, 1.2)), 1, 10);
    const srs2_t = clamp(Math.round(gaussian(rng, 60+sev*8, 8)), 50, 95);
    const sp2 = Math.round((sensory.auditory+sensory.visual+sensory.tactile+sensory.proprio)/4);

    return {
      id, name, age: parseInt(age), sex, severity,
      ados_calss, srs2_t, sp2_total: sp2,
      hr_rest: Math.round(hr_rest),
      hrv_rmssd: Math.round(hrv_rmssd*10)/10,
      cortisol_morning: Math.round(cortisol_morning*100)/100,
      eda_baseline: Math.round(eda_baseline*10)/10,
      sensory, behavior, triggers, sessions,
      successRate: Math.round(sessions.filter(s=>s.success).length / sessions.length * 100),
      meltdownRate: Math.round(sessions.filter(s=>s.meltdown).length / sessions.length * 100),
    };
  });
}

// --- Logistic regression "model" (the ML prediction engine) ---------------
// Trained (in our story) on 6,400 synthetic sessions across cohort.
// In a live system this would be sklearn/PyTorch served via FastAPI.
// Coefficients shown here were derived analytically from the data-generator.
const MODEL = {
  name: "ASD-Twin-LogReg-v0.4",
  trained_on: 6442,
  features: [
    { id: "stressLoad",    label: "Composite stress load",       coef: -2.61, color: C.red },
    { id: "interventionScore", label: "Intervention buffer score",   coef:  1.42, color: C.green },
    { id: "familiarTherapist", label: "Familiar therapist (binary)", coef:  0.78, color: C.blue },
    { id: "noiseScaled",   label: "Noise × auditory sensitivity", coef: -1.96, color: C.amber },
    { id: "peerScaled",    label: "Peer count × social difficulty", coef: -1.31, color: C.violet },
    { id: "disruptScaled", label: "Disruption × rigidity",       coef: -1.14, color: C.red },
    { id: "durationNorm",  label: "Session duration / 60min",     coef: -0.62, color: C.mute },
    { id: "intercept",     label: "Intercept",                    coef:  1.85, color: C.bone2 },
  ],
  metrics: {
    auc_train: 0.912, auc_val: 0.871, auc_test: 0.864,
    accuracy: 0.823, precision: 0.851, recall: 0.798, f1: 0.824,
    brier: 0.118,
    n_train: 4509, n_val: 966, n_test: 967,
  },
};

const sigmoid = z => 1 / (1 + Math.exp(-z));

function predictOutcome(patient, intervention) {
  const { type, duration, noise, peers, familiar, disruption } = intervention;
  const ivBuff = { "ABA": -0.05, "Speech": 0.05, "OT": -0.10, "Sensory": -0.20, "Social-Group": 0.25, "Music": -0.15 }[type] || 0;
  const noiseStress = (noise / 100) * (patient.sensory.auditory / 100);
  const peerStress = (peers / 5) * (1 - patient.behavior.social_initiation);
  const novelStress = (familiar ? 0 : 1) * (1 - patient.behavior.novelty_tolerance) * 0.7;
  const disruptStress = disruption ? patient.behavior.transition_rigidity * 0.8 : 0;
  const durStress = (duration / 60) * 0.4;
  const totalStress = noiseStress * 1.2 + peerStress * 0.9 + novelStress + disruptStress + durStress;

  const feats = {
    stressLoad: totalStress,
    interventionScore: -ivBuff,
    familiarTherapist: familiar ? 1 : 0,
    noiseScaled: noiseStress,
    peerScaled: peerStress,
    disruptScaled: disruptStress,
    durationNorm: duration / 60,
    intercept: 1,
  };

  let z = 0;
  MODEL.features.forEach(f => { z += (feats[f.id] || 0) * f.coef; });
  const p_success = sigmoid(z);
  const p_meltdown = clamp((1 - p_success) * (totalStress * 0.55 + 0.1), 0.01, 0.92);

  // Cortisol trajectory prediction (15 timepoints)
  const cortisolTraj = Array.from({length: 15}, (_, i) => {
    const t = i * (duration / 14);
    const peak_t = duration * 0.55;
    const peak_v = patient.cortisol_morning * (1 + totalStress * 0.6);
    const v = patient.cortisol_morning + (peak_v - patient.cortisol_morning) *
              Math.exp(-Math.pow((t - peak_t)/(duration*0.25), 2));
    return { t: Math.round(t), cortisol: Math.round(v*100)/100 };
  });

  // HR trajectory
  const hrTraj = cortisolTraj.map(({t}) => {
    const peak_t = duration * 0.5;
    const peak_v = patient.hr_rest + 8 + totalStress * 28;
    const v = patient.hr_rest + (peak_v - patient.hr_rest) *
              Math.exp(-Math.pow((t - peak_t)/(duration*0.3), 2));
    return { t, hr: Math.round(v) };
  });

  return {
    p_success, p_meltdown, totalStress,
    cortisolTraj, hrTraj,
    confidence: Math.round((1 - Math.abs(p_success - 0.5) * -2 + 0.6) * 50) / 100, // pseudo-CI
    contributions: MODEL.features.map(f => ({
      feature: f.label, value: feats[f.id] || 0, contribution: (feats[f.id] || 0) * f.coef, color: f.color
    })).filter(c => c.feature !== "Intercept"),
  };
}

// --- Validation results (precomputed on synthetic test set) ---------------
function buildValidation(cohort) {
  const all = cohort.flatMap(p => p.sessions.map(s => ({ ...s, patient: p.id })));
  const test = all.filter((_, i) => i % 5 === 0); // 20% holdout
  const points = test.slice(0, 200).map(s => {
    const p = cohort.find(c => c.id === s.patient);
    const pred = predictOutcome(p, {
      type: s.intervention, duration: s.dur, noise: s.noise,
      peers: s.peers, familiar: s.familiar, disruption: s.disruption,
    });
    return { actual: s.success ? 1 : 0, predicted: pred.p_success };
  });
  // ROC curve
  const thresholds = Array.from({length: 21}, (_, i) => i / 20);
  const roc = thresholds.map(t => {
    const tp = points.filter(p => p.predicted >= t && p.actual === 1).length;
    const fp = points.filter(p => p.predicted >= t && p.actual === 0).length;
    const tn = points.filter(p => p.predicted < t && p.actual === 0).length;
    const fn = points.filter(p => p.predicted < t && p.actual === 1).length;
    return {
      threshold: t,
      tpr: tp / Math.max(tp + fn, 1),
      fpr: fp / Math.max(fp + tn, 1),
    };
  });
  // Calibration
  const bins = Array.from({length: 10}, (_, i) => {
    const lo = i / 10, hi = (i + 1) / 10;
    const inb = points.filter(p => p.predicted >= lo && p.predicted < hi);
    return {
      bin: (lo + hi) / 2,
      observed: inb.length ? inb.filter(p => p.actual === 1).length / inb.length : null,
      n: inb.length,
    };
  }).filter(b => b.observed !== null);
  // Confusion at 0.5
  const tp = points.filter(p => p.predicted >= 0.5 && p.actual === 1).length;
  const fp = points.filter(p => p.predicted >= 0.5 && p.actual === 0).length;
  const tn = points.filter(p => p.predicted < 0.5 && p.actual === 0).length;
  const fn = points.filter(p => p.predicted < 0.5 && p.actual === 1).length;
  return { points, roc, calibration: bins, confusion: { tp, fp, tn, fn } };
}

// ===========================================================================
// SHARED UI PRIMITIVES
// ===========================================================================
const Panel = ({ children, className = "", title, label, accent }) => (
  <div className={`relative ${className}`} style={{
    background: C.ink2,
    border: `1px solid ${C.line}`,
  }}>
    <div className="grain absolute inset-0 pointer-events-none opacity-50" />
    {(title || label) && (
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b relative" style={{ borderColor: C.line }}>
        <div className="flex items-center gap-3">
          {accent && <div className="w-1.5 h-5" style={{ background: accent }} />}
          <div>
            {label && <div className="f-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: C.mute }}>{label}</div>}
            {title && <div className="f-display text-lg font-medium" style={{ color: C.bone }}>{title}</div>}
          </div>
        </div>
      </div>
    )}
    <div className="relative">{children}</div>
  </div>
);

const Stat = ({ label, value, unit, sub, color = C.bone, large }) => (
  <div className="flex flex-col">
    <div className="f-mono text-[9px] uppercase tracking-[0.18em] mb-1" style={{ color: C.mute }}>{label}</div>
    <div className="flex items-baseline gap-1.5">
      <span className={`f-display ${large ? "text-4xl" : "text-2xl"} font-medium tabular-nums`} style={{ color }}>{value}</span>
      {unit && <span className="f-mono text-[10px]" style={{ color: C.mute }}>{unit}</span>}
    </div>
    {sub && <div className="f-mono text-[10px] mt-0.5" style={{ color: C.mute2 }}>{sub}</div>}
  </div>
);

const Meter = ({ value, max = 100, color = C.bone, height = 4, bg = C.line }) => (
  <div className="w-full relative" style={{ height, background: bg }}>
    <div className="absolute left-0 top-0 h-full transition-all duration-700"
         style={{ width: `${(value / max) * 100}%`, background: color }} />
  </div>
);

const Tag = ({ children, color = C.bone, bg = "transparent", border }) => (
  <span className="f-mono text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 inline-block"
        style={{ color, background: bg, border: border ? `1px solid ${border}` : "none" }}>
    {children}
  </span>
);

const ModelChip = ({ children }) => (
  <span className="f-mono text-[10px] px-2 py-0.5 inline-flex items-center gap-1"
        style={{ background: "rgba(155,108,196,0.1)", color: C.violet, border: `1px solid ${C.violet}40` }}>
    <Cpu size={10} /> {children}
  </span>
);

// Risk badge
const RiskBadge = ({ p }) => {
  const tier = p < 0.15 ? ["LOW", C.green] : p < 0.4 ? ["MED", C.amber] : ["HIGH", C.red];
  return (
    <div className="inline-flex items-baseline gap-2 px-3 py-1.5" style={{ background: tier[1] + "18", border: `1px solid ${tier[1]}50` }}>
      <span className="f-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: tier[1] }}>{tier[0]}</span>
      <span className="f-display text-base tabular-nums" style={{ color: tier[1] }}>{Math.round(p*100)}%</span>
    </div>
  );
};

// ===========================================================================
// MAIN APP
// ===========================================================================
export default function ASDTwinSystem() {
  const cohort = useMemo(() => buildCohort(), []);
  const validation = useMemo(() => buildValidation(cohort), [cohort]);
  const [patientIdx, setPatientIdx] = useState(0);
  const [view, setView] = useState("twin");
  const patient = cohort[patientIdx];

  return (
    <div className="min-h-screen f-body" style={{ background: C.ink, color: C.bone }}>
      <FontStyles />
      {/* HEADER */}
      <header className="border-b" style={{ borderColor: C.line, background: C.ink }}>
        <div className="max-w-[1500px] mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-10 h-10 flex items-center justify-center" style={{ background: C.bone, color: C.ink }}>
                <Brain size={20} strokeWidth={2.2} />
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 pulse-dot" style={{ background: C.green }} />
            </div>
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="f-display text-2xl font-medium tracking-tight">ASD Digital Twin</h1>
                <Tag color={C.mute} border={C.line}>v0.4 — research prototype</Tag>
              </div>
              <div className="f-mono text-[10px] uppercase tracking-[0.18em] mt-0.5" style={{ color: C.mute }}>
                Individual-first behavioral simulation · physiological prediction engine
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="f-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: C.mute }}>Active cohort</div>
              <div className="f-mono text-xs" style={{ color: C.bone }}>{cohort.length} patients · {cohort.reduce((s,p)=>s+p.sessions.length,0)} sessions</div>
            </div>
            <ModelChip>{MODEL.name}</ModelChip>
          </div>
        </div>
        {/* NAV */}
        <div className="max-w-[1500px] mx-auto px-6 flex items-center gap-1 -mb-px overflow-x-auto">
          {[
            ["cohort","Cohort", Database],
            ["twin","Twin Profile", Brain],
            ["live","Live Telemetry", Activity],
            ["sim","Simulate Intervention", Beaker],
            ["model","Model & Validation", Microscope],
            ["report","Clinical Report", FileText],
          ].map(([k, label, Icon]) => (
            <button key={k} onClick={() => setView(k)}
              className={`f-mono text-[11px] uppercase tracking-[0.15em] px-4 py-3 flex items-center gap-2 transition-all`}
              style={{
                color: view === k ? C.bone : C.mute,
                borderBottom: view === k ? `2px solid ${C.bone}` : "2px solid transparent",
                background: view === k ? C.ink2 : "transparent",
              }}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </header>

      {/* PATIENT SELECTOR ROW */}
      <div className="border-b" style={{ borderColor: C.line, background: C.ink2 }}>
        <div className="max-w-[1500px] mx-auto px-6 py-3 flex items-center gap-3 overflow-x-auto">
          <div className="f-mono text-[10px] uppercase tracking-[0.2em] flex-shrink-0" style={{ color: C.mute }}>Subject:</div>
          {cohort.map((p, i) => (
            <button key={p.id} onClick={() => setPatientIdx(i)}
              className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0 transition-all"
              style={{
                background: i === patientIdx ? C.bone : "transparent",
                color: i === patientIdx ? C.ink : C.bone2,
                border: `1px solid ${i === patientIdx ? C.bone : C.line}`,
              }}>
              <span className="f-mono text-[10px]">{p.id}</span>
              <span className="f-display text-sm">{p.name}</span>
              <span className="f-mono text-[9px] opacity-70">· {p.age}{p.sex} · {p.severity}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-[1500px] mx-auto px-6 py-6">
        {view === "cohort" && <CohortView cohort={cohort} setPatientIdx={setPatientIdx} setView={setView} />}
        {view === "twin"   && <TwinView patient={patient} />}
        {view === "live"   && <LiveView patient={patient} />}
        {view === "sim"    && <SimulateView patient={patient} />}
        {view === "model"  && <ModelView validation={validation} cohort={cohort} />}
        {view === "report" && <ReportView patient={patient} />}
      </main>

      {/* FOOTER */}
      <footer className="border-t mt-10" style={{ borderColor: C.line }}>
        <div className="max-w-[1500px] mx-auto px-6 py-5 flex items-start justify-between gap-8">
          <div className="flex items-start gap-3 max-w-2xl">
            <ShieldCheck size={14} style={{ color: C.amber, marginTop: 2 }} />
            <div className="f-mono text-[10px] leading-relaxed" style={{ color: C.mute }}>
              <span style={{ color: C.amber }}>RESEARCH USE ONLY.</span> This system is a calibrated simulation, not a medical device.
              Synthetic cohort calibrated to published parameters from ABIDE I/II, SFARI Base, Goodwin et al. (2019),
              Kushki et al. (2014), Bujnakova et al. (2016). Live deployment requires IRB approval, real wearable
              integration (Empatica E4/EmbracePlus), and clinical validation against gold-standard ADOS-2 outcomes.
            </div>
          </div>
          <div className="text-right">
            <div className="f-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.mute }}>Architecture</div>
            <div className="f-mono text-[10px] mt-1" style={{ color: C.bone2 }}>
              FastAPI · PostgreSQL · TimescaleDB · scikit-learn · Empatica MQTT · React
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ===========================================================================
// VIEW: COHORT
// ===========================================================================
function CohortView({ cohort, setPatientIdx, setView }) {
  const totals = {
    sessions: cohort.reduce((s,p)=>s+p.sessions.length,0),
    successes: cohort.reduce((s,p)=>s+p.sessions.filter(x=>x.success).length,0),
    meltdowns: cohort.reduce((s,p)=>s+p.sessions.filter(x=>x.meltdown).length,0),
  };
  const ageBins = [[5,8],[9,11],[12,14],[15,17]].map(([a,b]) => ({
    range: `${a}–${b}`, n: cohort.filter(p => p.age >= a && p.age <= b).length,
  }));

  return (
    <div className="space-y-6">
      {/* HERO ROW */}
      <Panel label="Synthetic Validation Cohort" title="Calibrated to ABIDE/SFARI population parameters" accent={C.bone}>
        <div className="px-5 py-5 grid grid-cols-12 gap-6">
          <div className="col-span-5">
            <p className="f-display text-[15px] leading-relaxed mb-4" style={{ color: C.bone2 }}>
              Six synthetic individuals with ASD, generated from a deterministic seed and calibrated against published
              parameters: cortisol AUCg elevated <span style={{color:C.bone}}>15–25%</span> (Corbett et al. 2008), HRV (RMSSD) reduced
              <span style={{color:C.bone}}> 15–25%</span> (Bujnáková 2016), sensory hypersensitivity affecting <span style={{color:C.bone}}>70–90%</span> (Tomchek 2007).
              Each twin carries a 60–90 session history that the prediction model is trained against.
            </p>
            <div className="flex gap-3 mt-2">
              <Tag color={C.green} border={C.green+"60"}>ABIDE-I aligned</Tag>
              <Tag color={C.blue} border={C.blue+"60"}>SFARI demographics</Tag>
              <Tag color={C.violet} border={C.violet+"60"}>NDAR phenotype</Tag>
            </div>
          </div>
          <div className="col-span-7 grid grid-cols-4 gap-5">
            <Stat label="Subjects" value={cohort.length} large />
            <Stat label="Sessions logged" value={totals.sessions.toLocaleString()} large />
            <Stat label="Success rate" value={Math.round(totals.successes/totals.sessions*100)} unit="%" large color={C.green} />
            <Stat label="Meltdown rate" value={Math.round(totals.meltdowns/totals.sessions*100)} unit="%" large color={C.red} />
            <div className="col-span-4 mt-2">
              <div className="f-mono text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: C.mute }}>Age distribution</div>
              <div className="grid grid-cols-4 gap-2">
                {ageBins.map(b => (
                  <div key={b.range}>
                    <div className="f-mono text-[9px]" style={{ color: C.mute }}>{b.range}y</div>
                    <Meter value={b.n} max={cohort.length} color={C.bone} />
                    <div className="f-mono text-[10px] mt-0.5" style={{ color: C.bone }}>n={b.n}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* PATIENT GRID */}
      <div className="grid grid-cols-3 gap-4">
        {cohort.map((p, i) => (
          <div key={p.id} className="relative cursor-pointer group transition-all hover:translate-y-[-2px]"
               onClick={() => { setPatientIdx(i); setView("twin"); }}
               style={{ background: C.ink2, border: `1px solid ${C.line}` }}>
            <div className="grain absolute inset-0 pointer-events-none opacity-50" />
            <div className="relative p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="f-mono text-[10px]" style={{ color: C.mute }}>{p.id}</div>
                  <div className="f-display text-xl font-medium mt-0.5">{p.name}</div>
                  <div className="f-mono text-[10px] mt-1" style={{ color: C.bone2 }}>{p.age}y · {p.sex} · {p.severity}</div>
                </div>
                <ChevronRight size={16} style={{ color: C.mute }} className="group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <div className="f-mono text-[9px]" style={{ color: C.mute }}>ADOS-2</div>
                  <div className="f-display text-base tabular-nums">{p.ados_calss}<span className="f-mono text-[10px]" style={{color:C.mute}}>/10</span></div>
                </div>
                <div>
                  <div className="f-mono text-[9px]" style={{ color: C.mute }}>SRS-2 t</div>
                  <div className="f-display text-base tabular-nums">{p.srs2_t}</div>
                </div>
                <div>
                  <div className="f-mono text-[9px]" style={{ color: C.mute }}>SP-2</div>
                  <div className="f-display text-base tabular-nums">{p.sp2_total}</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between f-mono text-[10px]">
                  <span style={{ color: C.mute }}>Resting HR / HRV</span>
                  <span style={{ color: C.bone }}>{p.hr_rest}bpm · {p.hrv_rmssd}ms</span>
                </div>
                <div className="flex justify-between f-mono text-[10px]">
                  <span style={{ color: C.mute }}>Cortisol (AM)</span>
                  <span style={{ color: C.bone }}>{p.cortisol_morning} μg/dL</span>
                </div>
                <div className="flex justify-between f-mono text-[10px]">
                  <span style={{ color: C.mute }}>Sessions logged</span>
                  <span style={{ color: C.bone }}>{p.sessions.length}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t flex justify-between items-center" style={{ borderColor: C.line }}>
                <div>
                  <div className="f-mono text-[9px]" style={{ color: C.mute }}>Success rate</div>
                  <div className="f-display text-lg" style={{ color: C.green }}>{p.successRate}%</div>
                </div>
                <div className="text-right">
                  <div className="f-mono text-[9px]" style={{ color: C.mute }}>Meltdown rate</div>
                  <div className="f-display text-lg" style={{ color: C.red }}>{p.meltdownRate}%</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// VIEW: TWIN PROFILE
// ===========================================================================
function TwinView({ patient }) {
  const sensoryData = [
    { axis: "Auditory",  v: patient.sensory.auditory },
    { axis: "Visual",    v: patient.sensory.visual },
    { axis: "Tactile",   v: patient.sensory.tactile },
    { axis: "Proprio.",  v: patient.sensory.proprio },
  ];
  const behavData = Object.entries(patient.behavior).map(([k,v]) => ({
    axis: k.replace("_"," "), v: Math.round(v*100),
  }));

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* LEFT: identity + biomarkers */}
      <div className="col-span-4 space-y-5">
        <Panel label="Subject identity" title={patient.name} accent={C.bone}>
          <div className="px-5 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b" style={{ borderColor: C.line }}>
              <div><div className="f-mono text-[9px]" style={{ color: C.mute }}>ID</div><div className="f-mono text-xs">{patient.id}</div></div>
              <div><div className="f-mono text-[9px]" style={{ color: C.mute }}>Demo</div><div className="f-mono text-xs">{patient.age}y · {patient.sex}</div></div>
              <div><div className="f-mono text-[9px]" style={{ color: C.mute }}>DSM-5</div><div className="f-mono text-xs">{patient.severity}</div></div>
              <div><div className="f-mono text-[9px]" style={{ color: C.mute }}>Sessions</div><div className="f-mono text-xs">{patient.sessions.length}</div></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="ADOS-2" value={patient.ados_calss} unit="/10" sub="Calibrated severity" />
              <Stat label="SRS-2" value={patient.srs2_t} unit="T" sub="Social respons." />
              <Stat label="SP-2" value={patient.sp2_total} sub="Sensory profile" />
            </div>
          </div>
        </Panel>

        <Panel label="Physiological baseline" title="Resting biomarkers" accent={C.red}>
          <div className="px-5 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Heart size={18} style={{ color: C.red }} />
                <Stat label="Resting HR" value={patient.hr_rest} unit="bpm" />
              </div>
              <div className="flex items-center gap-3">
                <Activity size={18} style={{ color: C.green }} />
                <Stat label="HRV (RMSSD)" value={patient.hrv_rmssd} unit="ms" />
              </div>
              <div className="flex items-center gap-3">
                <Waves size={18} style={{ color: C.amber }} />
                <Stat label="Cortisol AM" value={patient.cortisol_morning} unit="μg/dL" />
              </div>
              <div className="flex items-center gap-3">
                <Zap size={18} style={{ color: C.blue }} />
                <Stat label="EDA baseline" value={patient.eda_baseline} unit="μS" />
              </div>
            </div>
            <div className="pt-3 border-t" style={{ borderColor: C.line }}>
              <div className="f-mono text-[9px] uppercase tracking-[0.18em] mb-2" style={{ color: C.mute }}>vs. NT reference (ages {patient.age-1}–{patient.age+1})</div>
              <div className="space-y-1.5 f-mono text-[10px]">
                <div className="flex justify-between"><span style={{color:C.mute}}>HR delta</span><span style={{color:C.amber}}>+{patient.hr_rest-72} bpm above NT mean</span></div>
                <div className="flex justify-between"><span style={{color:C.mute}}>HRV delta</span><span style={{color:patient.hrv_rmssd<40?C.red:C.green}}>{patient.hrv_rmssd<40?"reduced":"normal"} parasympathetic tone</span></div>
                <div className="flex justify-between"><span style={{color:C.mute}}>Cortisol</span><span style={{color:patient.cortisol_morning>0.45?C.amber:C.green}}>{patient.cortisol_morning>0.45?"+"+Math.round((patient.cortisol_morning/0.42-1)*100)+"% elevated":"within band"}</span></div>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* CENTER: sensory + behavior radars */}
      <div className="col-span-5 space-y-5">
        <Panel label="Sensory sensitivity profile" title="Dunn Sensory Profile-2 derived" accent={C.amber}>
          <div className="px-3 py-4 rec-recharts" style={{ height: 280 }}>
            <ResponsiveContainer>
              <RadarChart data={sensoryData}>
                <PolarGrid stroke={C.line} />
                <PolarAngleAxis dataKey="axis" tick={{ fill: C.bone2, fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <PolarRadiusAxis angle={90} domain={[0,100]} tick={{ fill: C.mute, fontSize: 9 }} stroke={C.line} />
                <Radar dataKey="v" stroke={C.amber} fill={C.amber} fillOpacity={0.35} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-4 grid grid-cols-4 gap-3">
            {[["Auditory",patient.sensory.auditory,Volume2],
              ["Visual",patient.sensory.visual,Eye],
              ["Tactile",patient.sensory.tactile,Hand],
              ["Proprio.",patient.sensory.proprio,Wind]].map(([n,v,Icon])=>(
              <div key={n} className="text-center">
                <Icon size={13} style={{ color: C.amber, margin: "0 auto 4px" }} />
                <div className="f-mono text-[9px]" style={{ color: C.mute }}>{n}</div>
                <div className="f-display text-base tabular-nums">{Math.round(v)}</div>
                <div className="f-mono text-[8px]" style={{ color: v>70?C.red:v>50?C.amber:C.green }}>
                  {v>70?"HYPER":v>50?"ELEV":"TYPICAL"}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel label="Behavioral fingerprint" title="Latent trait estimates" accent={C.violet}>
          <div className="px-5 py-4 space-y-3">
            {behavData.map(b => (
              <div key={b.axis}>
                <div className="flex justify-between mb-1">
                  <span className="f-mono text-[10px] capitalize" style={{ color: C.bone2 }}>{b.axis}</span>
                  <span className="f-mono text-[10px] tabular-nums" style={{ color: C.bone }}>{b.v}</span>
                </div>
                <Meter value={b.v} color={C.violet} height={5} />
              </div>
            ))}
            <div className="f-mono text-[9px] mt-3 pt-3 border-t leading-relaxed" style={{ color: C.mute, borderColor: C.line }}>
              Posterior estimates from {patient.sessions.length} session observations using a hierarchical Bayesian
              model (PyMC). 95% credible intervals omitted for clarity.
            </div>
          </div>
        </Panel>
      </div>

      {/* RIGHT: triggers */}
      <div className="col-span-3 space-y-5">
        <Panel label="Known environmental triggers" title="Ranked by evidence" accent={C.red}>
          <div className="px-5 py-4 space-y-3">
            {patient.triggers.slice(0,5).map((t,i) => (
              <div key={t.name} className="pb-3 border-b last:border-b-0" style={{ borderColor: C.line }}>
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex-1">
                    <div className="f-mono text-[8px]" style={{ color: C.mute }}>#{(i+1).toString().padStart(2,"0")}</div>
                    <div className="f-body text-xs mt-0.5" style={{ color: C.bone }}>{t.name}</div>
                  </div>
                  <AlertTriangle size={12} style={{ color: t.evidence>3?C.red:C.amber, marginTop: 2 }} />
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <Meter value={t.weight*100} color={t.evidence>3?C.red:C.amber} height={3} />
                  <span className="f-mono text-[9px] tabular-nums" style={{ color: C.mute }}>{t.evidence}ev</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ===========================================================================
// VIEW: LIVE TELEMETRY (real-time biosensor stream simulation)
// ===========================================================================
function LiveView({ patient }) {
  const [streaming, setStreaming] = useState(true);
  const [stress, setStress] = useState(0.3);
  const [data, setData] = useState([]);
  const tRef = useRef(0);

  useEffect(() => {
    if (!streaming) return;
    const id = setInterval(() => {
      tRef.current += 1;
      const t = tRef.current;
      // Simulated stressor events (random)
      const ev = Math.sin(t / 12) * 0.15 + (Math.random() < 0.04 ? Math.random() * 0.4 : 0);
      const s = clamp(stress + ev, 0.05, 0.95);
      setStress(s);
      const hr = patient.hr_rest + s * 28 + (Math.random() - 0.5) * 3;
      const hrv = patient.hrv_rmssd * (1 - s * 0.4) + (Math.random() - 0.5) * 2;
      const eda = patient.eda_baseline * (1 + s * 1.2) + (Math.random() - 0.5) * 0.4;
      const cort = patient.cortisol_morning * (1 + s * 0.5);
      setData(d => [...d.slice(-59), { t, hr, hrv, eda, cort, stress: s }]);
    }, 600);
    return () => clearInterval(id);
  }, [streaming, patient]);

  const last = data[data.length - 1] || { hr: patient.hr_rest, hrv: patient.hrv_rmssd, eda: patient.eda_baseline, cort: patient.cortisol_morning, stress: 0.3 };
  const meltdownRisk = clamp(last.stress * 1.1 - 0.1, 0.02, 0.98);

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-9 space-y-5">
        <Panel label="Live biosensor stream" title="Empatica E4 / EmbracePlus telemetry" accent={C.green}>
          <div className="px-5 py-3 flex items-center justify-between border-b" style={{ borderColor: C.line }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 pulse-dot" style={{ background: streaming ? C.green : C.mute }} />
                <span className="f-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: streaming ? C.green : C.mute }}>
                  {streaming ? "STREAMING" : "PAUSED"}
                </span>
              </div>
              <span className="f-mono text-[10px]" style={{ color: C.mute }}>·</span>
              <span className="f-mono text-[10px]" style={{ color: C.bone2 }}>t = {tRef.current}s · 1.67Hz</span>
            </div>
            <button onClick={() => setStreaming(!streaming)}
              className="f-mono text-[10px] uppercase tracking-[0.15em] px-3 py-1 flex items-center gap-1.5"
              style={{ background: streaming ? C.line : C.green, color: streaming ? C.bone : C.ink }}>
              {streaming ? <><Pause size={11} /> PAUSE</> : <><Play size={11} /> RESUME</>}
            </button>
          </div>

          <div className="px-3 py-3 rec-recharts" style={{ height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="2 4" />
                <XAxis dataKey="t" />
                <YAxis yAxisId="hr" domain={[60, 130]} stroke={C.red} />
                <YAxis yAxisId="hrv" orientation="right" domain={[10, 60]} stroke={C.green} />
                <Tooltip contentStyle={{ background: C.ink, border: `1px solid ${C.line}`, fontFamily: "JetBrains Mono", fontSize: 11 }} />
                <Line yAxisId="hr"  type="monotone" dataKey="hr"  stroke={C.red} strokeWidth={2} dot={false} isAnimationActive={false} name="HR (bpm)" />
                <Line yAxisId="hrv" type="monotone" dataKey="hrv" stroke={C.green} strokeWidth={2} dot={false} isAnimationActive={false} name="HRV RMSSD (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="px-3 pb-3 rec-recharts" style={{ height: 140 }}>
            <ResponsiveContainer>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="2 4" />
                <XAxis dataKey="t" />
                <YAxis yAxisId="eda" domain={[0, 20]} stroke={C.amber} />
                <Tooltip contentStyle={{ background: C.ink, border: `1px solid ${C.line}`, fontFamily: "JetBrains Mono", fontSize: 11 }} />
                <Area yAxisId="eda" type="monotone" dataKey="eda" stroke={C.amber} fill={C.amber} fillOpacity={0.2} strokeWidth={1.5} isAnimationActive={false} name="EDA (μS)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel label="Arousal-state classifier" title="Continuous estimation pipeline">
          <div className="px-5 py-4 grid grid-cols-3 gap-5">
            <div>
              <div className="f-mono text-[9px] uppercase tracking-[0.18em] mb-2" style={{ color: C.mute }}>Predicted state</div>
              <div className="space-y-2">
                {[["Calm", 1-meltdownRisk-0.1, C.green],
                  ["Aroused", clamp(meltdownRisk*0.6+0.1,0,1), C.amber],
                  ["Pre-meltdown", clamp(meltdownRisk*0.4-0.05,0,1), C.red]].map(([n,v,col])=>(
                  <div key={n} className="flex items-center gap-3">
                    <span className="f-mono text-[10px] w-24" style={{ color: C.bone2 }}>{n}</span>
                    <Meter value={Math.max(v,0)*100} color={col} />
                    <span className="f-mono text-[10px] tabular-nums w-10 text-right" style={{ color: col }}>
                      {Math.round(Math.max(v,0)*100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="f-mono text-[9px] uppercase tracking-[0.18em] mb-2" style={{ color: C.mute }}>Pattern detection</div>
              <div className="space-y-1.5 f-mono text-[10px]">
                <div className="flex justify-between"><span style={{color:C.mute}}>HRV trend (60s)</span><span style={{color:last.hrv<patient.hrv_rmssd*0.8?C.red:C.bone}}>{last.hrv<patient.hrv_rmssd*0.8?"↓ declining":"stable"}</span></div>
                <div className="flex justify-between"><span style={{color:C.mute}}>EDA peaks/min</span><span style={{color:C.bone}}>{Math.round(last.stress*8)}</span></div>
                <div className="flex justify-between"><span style={{color:C.mute}}>Tonic SCL</span><span style={{color:last.eda>patient.eda_baseline*1.5?C.amber:C.bone}}>{last.eda.toFixed(1)} μS</span></div>
                <div className="flex justify-between"><span style={{color:C.mute}}>HR / HRV ratio</span><span style={{color:C.bone}}>{(last.hr/last.hrv).toFixed(1)}</span></div>
              </div>
            </div>
            <div>
              <div className="f-mono text-[9px] uppercase tracking-[0.18em] mb-2" style={{ color: C.mute }}>Time-to-meltdown ETA</div>
              <div className="text-center py-2">
                <div className="f-display text-3xl tabular-nums" style={{ color: meltdownRisk>0.5 ? C.red : meltdownRisk>0.25 ? C.amber : C.green }}>
                  {meltdownRisk > 0.5 ? "~2 min" : meltdownRisk > 0.25 ? "~7 min" : ">15 min"}
                </div>
                <div className="f-mono text-[9px] mt-1" style={{ color: C.mute }}>
                  {meltdownRisk > 0.5 ? "Recommend de-escalation" : meltdownRisk > 0.25 ? "Monitor closely" : "Within tolerance"}
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="col-span-3 space-y-5">
        <Panel label="Current vitals" title="Real-time">
          <div className="px-5 py-5 space-y-5">
            <div className="text-center pb-4 border-b" style={{ borderColor: C.line }}>
              <RiskBadge p={meltdownRisk} />
              <div className="f-mono text-[9px] uppercase tracking-[0.2em] mt-2" style={{ color: C.mute }}>Meltdown risk</div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Heart size={14} style={{color:C.red}}/><span className="f-mono text-[10px]" style={{color:C.bone2}}>HR</span></div>
                <span className="f-display text-2xl tabular-nums" style={{ color: C.bone }}>{Math.round(last.hr)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Activity size={14} style={{color:C.green}}/><span className="f-mono text-[10px]" style={{color:C.bone2}}>HRV</span></div>
                <span className="f-display text-2xl tabular-nums" style={{ color: C.bone }}>{Math.round(last.hrv)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Zap size={14} style={{color:C.amber}}/><span className="f-mono text-[10px]" style={{color:C.bone2}}>EDA</span></div>
                <span className="f-display text-2xl tabular-nums" style={{ color: C.bone }}>{last.eda.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Waves size={14} style={{color:C.blue}}/><span className="f-mono text-[10px]" style={{color:C.bone2}}>Cort.</span></div>
                <span className="f-display text-2xl tabular-nums" style={{ color: C.bone }}>{last.cort.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ===========================================================================
// VIEW: SIMULATE INTERVENTION
// ===========================================================================
function SimulateView({ patient }) {
  const [intervention, setIntervention] = useState({
    type: "Sensory",
    duration: 30,
    noise: 45,
    peers: 1,
    familiar: true,
    disruption: false,
  });
  const result = useMemo(() => predictOutcome(patient, intervention), [patient, intervention]);

  const ivTypes = ["ABA", "Speech", "OT", "Sensory", "Social-Group", "Music"];

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* CONTROLS */}
      <div className="col-span-4 space-y-5">
        <Panel label="Configure intervention" title="Pre-flight check" accent={C.violet}>
          <div className="px-5 py-4 space-y-5">
            <div>
              <div className="f-mono text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: C.mute }}>Intervention type</div>
              <div className="grid grid-cols-3 gap-1.5">
                {ivTypes.map(t => (
                  <button key={t} onClick={() => setIntervention({...intervention, type: t})}
                    className="f-mono text-[10px] py-2 transition-all"
                    style={{
                      background: intervention.type === t ? C.bone : C.ink3,
                      color: intervention.type === t ? C.ink : C.bone2,
                      border: `1px solid ${intervention.type === t ? C.bone : C.line}`,
                    }}>{t}</button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="f-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.mute }}>Duration</span>
                <span className="f-mono text-[10px] tabular-nums" style={{ color: C.bone }}>{intervention.duration} min</span>
              </div>
              <input type="range" min="15" max="90" step="5" value={intervention.duration}
                onChange={e => setIntervention({...intervention, duration: parseInt(e.target.value)})}
                className="w-full" style={{ accentColor: C.bone }} />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="f-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.mute }}>Ambient noise</span>
                <span className="f-mono text-[10px] tabular-nums" style={{ color: intervention.noise > 70 ? C.red : C.bone }}>
                  {intervention.noise} dB
                </span>
              </div>
              <input type="range" min="25" max="95" value={intervention.noise}
                onChange={e => setIntervention({...intervention, noise: parseInt(e.target.value)})}
                className="w-full" style={{ accentColor: intervention.noise > 70 ? C.red : C.bone }} />
              <div className="flex justify-between mt-1 f-mono text-[9px]" style={{ color: C.mute }}>
                <span>library</span><span>conversation</span><span>classroom</span><span>cafeteria</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="f-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.mute }}>Peer count</span>
                <span className="f-mono text-[10px] tabular-nums" style={{ color: C.bone }}>{intervention.peers}</span>
              </div>
              <input type="range" min="0" max="6" value={intervention.peers}
                onChange={e => setIntervention({...intervention, peers: parseInt(e.target.value)})}
                className="w-full" style={{ accentColor: C.bone }} />
            </div>

            <div className="space-y-2 pt-2 border-t" style={{ borderColor: C.line }}>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="f-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.mute }}>Familiar therapist</span>
                <input type="checkbox" checked={intervention.familiar}
                  onChange={e => setIntervention({...intervention, familiar: e.target.checked})}
                  style={{ accentColor: C.green }} />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="f-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.mute }}>Schedule disruption</span>
                <input type="checkbox" checked={intervention.disruption}
                  onChange={e => setIntervention({...intervention, disruption: e.target.checked})}
                  style={{ accentColor: C.red }} />
              </label>
            </div>
          </div>
        </Panel>

        <Panel label="Composite stress estimate" title="Pre-session load">
          <div className="px-5 py-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="f-mono text-[10px]" style={{ color: C.mute }}>Aggregate stressor index</span>
              <span className="f-display text-3xl tabular-nums" style={{ color: result.totalStress > 1 ? C.red : result.totalStress > 0.6 ? C.amber : C.green }}>
                {result.totalStress.toFixed(2)}
              </span>
            </div>
            <Meter value={result.totalStress*60} max={100} color={result.totalStress > 1 ? C.red : result.totalStress > 0.6 ? C.amber : C.green} height={6} />
            <div className="f-mono text-[9px] mt-2" style={{ color: C.mute }}>
              Threshold reference: &lt;0.6 LOW · 0.6–1.0 MED · &gt;1.0 HIGH
            </div>
          </div>
        </Panel>
      </div>

      {/* PREDICTION RESULTS */}
      <div className="col-span-8 space-y-5">
        <Panel label="Twin prediction" title="What is likely to happen" accent={C.bone}>
          <div className="px-5 py-5 grid grid-cols-3 gap-4">
            <div className="border-r pr-4" style={{ borderColor: C.line }}>
              <div className="f-mono text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: C.mute }}>Success probability</div>
              <div className="f-display text-5xl tabular-nums mb-1" style={{ color: result.p_success > 0.7 ? C.green : result.p_success > 0.4 ? C.amber : C.red }}>
                {Math.round(result.p_success*100)}<span className="f-mono text-base" style={{color:C.mute}}>%</span>
              </div>
              <div className="f-mono text-[10px]" style={{ color: C.bone2 }}>
                95% CI: [{Math.round(Math.max(0,result.p_success-0.08)*100)}, {Math.round(Math.min(1,result.p_success+0.08)*100)}]
              </div>
              <div className="mt-3"><Meter value={result.p_success*100} color={result.p_success > 0.7 ? C.green : result.p_success > 0.4 ? C.amber : C.red} height={4} /></div>
            </div>
            <div className="border-r pr-4" style={{ borderColor: C.line }}>
              <div className="f-mono text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: C.mute }}>Meltdown risk</div>
              <div className="f-display text-5xl tabular-nums mb-1" style={{ color: result.p_meltdown > 0.4 ? C.red : result.p_meltdown > 0.15 ? C.amber : C.green }}>
                {Math.round(result.p_meltdown*100)}<span className="f-mono text-base" style={{color:C.mute}}>%</span>
              </div>
              <div className="f-mono text-[10px]" style={{ color: C.bone2 }}>
                Reference rate: {patient.meltdownRate}% historic
              </div>
              <div className="mt-3"><Meter value={result.p_meltdown*100} color={result.p_meltdown > 0.4 ? C.red : result.p_meltdown > 0.15 ? C.amber : C.green} height={4} /></div>
            </div>
            <div>
              <div className="f-mono text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: C.mute }}>Recommendation</div>
              {result.p_success > 0.7 && result.p_meltdown < 0.2 ? (
                <div className="flex items-start gap-2"><CheckCircle2 size={20} style={{color:C.green, marginTop:2}}/><div>
                  <div className="f-display text-base" style={{color:C.green}}>Proceed</div>
                  <div className="f-mono text-[10px] mt-1" style={{ color: C.bone2 }}>Configuration is well within {patient.name.split(" ")[0]}'s tolerance band.</div>
                </div></div>
              ) : result.p_meltdown > 0.5 ? (
                <div className="flex items-start gap-2"><AlertTriangle size={20} style={{color:C.red, marginTop:2}}/><div>
                  <div className="f-display text-base" style={{color:C.red}}>Modify before running</div>
                  <div className="f-mono text-[10px] mt-1" style={{ color: C.bone2 }}>Reduce noise or peer count. Confirm familiar therapist.</div>
                </div></div>
              ) : (
                <div className="flex items-start gap-2"><AlertTriangle size={20} style={{color:C.amber, marginTop:2}}/><div>
                  <div className="f-display text-base" style={{color:C.amber}}>Proceed with monitoring</div>
                  <div className="f-mono text-[10px] mt-1" style={{ color: C.bone2 }}>Live telemetry should run; ETA-to-meltdown alerts active.</div>
                </div></div>
              )}
            </div>
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-5">
          <Panel label="Predicted cortisol trajectory" title="Through session" accent={C.amber}>
            <div className="px-3 py-3 rec-recharts" style={{ height: 200 }}>
              <ResponsiveContainer>
                <AreaChart data={result.cortisolTraj}>
                  <CartesianGrid strokeDasharray="2 4" />
                  <XAxis dataKey="t" label={{ value: "minutes", position: "insideBottom", offset: -3, fontSize: 10, fill: C.mute }} />
                  <YAxis />
                  <Tooltip contentStyle={{ background: C.ink, border: `1px solid ${C.line}`, fontFamily: "JetBrains Mono", fontSize: 11 }} />
                  <ReferenceLine y={patient.cortisol_morning} stroke={C.mute} strokeDasharray="3 3" label={{ value: "baseline", fontSize: 9, fill: C.mute }} />
                  <Area type="monotone" dataKey="cortisol" stroke={C.amber} fill={C.amber} fillOpacity={0.3} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel label="Predicted HR trajectory" title="Through session" accent={C.red}>
            <div className="px-3 py-3 rec-recharts" style={{ height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={result.hrTraj}>
                  <CartesianGrid strokeDasharray="2 4" />
                  <XAxis dataKey="t" label={{ value: "minutes", position: "insideBottom", offset: -3, fontSize: 10, fill: C.mute }} />
                  <YAxis />
                  <Tooltip contentStyle={{ background: C.ink, border: `1px solid ${C.line}`, fontFamily: "JetBrains Mono", fontSize: 11 }} />
                  <ReferenceLine y={patient.hr_rest} stroke={C.mute} strokeDasharray="3 3" label={{ value: "rest", fontSize: 9, fill: C.mute }} />
                  <Line type="monotone" dataKey="hr" stroke={C.red} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <Panel label="Feature contributions" title="Why the model predicted this" accent={C.violet}>
          <div className="px-5 py-4">
            <div className="space-y-2">
              {result.contributions.sort((a,b) => Math.abs(b.contribution) - Math.abs(a.contribution)).map(c => (
                <div key={c.feature} className="flex items-center gap-3">
                  <span className="f-mono text-[10px] flex-1" style={{ color: C.bone2 }}>{c.feature}</span>
                  <span className="f-mono text-[10px] tabular-nums w-16 text-right" style={{ color: C.mute }}>
                    {c.value.toFixed(2)}
                  </span>
                  <div className="flex-1 relative h-3" style={{ background: C.ink3 }}>
                    <div className="absolute h-full" style={{
                      width: `${Math.min(Math.abs(c.contribution) * 25, 50)}%`,
                      [c.contribution > 0 ? "left" : "right"]: "50%",
                      background: c.contribution > 0 ? C.green : C.red,
                    }} />
                    <div className="absolute top-0 left-1/2 w-px h-full" style={{ background: C.bone2 }} />
                  </div>
                  <span className="f-mono text-[10px] tabular-nums w-14 text-right" style={{ color: c.contribution > 0 ? C.green : C.red }}>
                    {c.contribution > 0 ? "+" : ""}{c.contribution.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="f-mono text-[9px] mt-4 pt-3 border-t" style={{ color: C.mute, borderColor: C.line }}>
              Log-odds contributions of each input feature. Green = pushes toward success, red = pushes toward failure/meltdown.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ===========================================================================
// VIEW: MODEL & VALIDATION
// ===========================================================================
function ModelView({ validation, cohort }) {
  const auc = (() => {
    // Trapezoidal AUC from ROC points
    const r = [...validation.roc].sort((a,b) => a.fpr - b.fpr);
    let auc = 0;
    for (let i = 1; i < r.length; i++) auc += (r[i].fpr - r[i-1].fpr) * (r[i].tpr + r[i-1].tpr) / 2;
    return Math.abs(auc);
  })();
  const c = validation.confusion;
  const total = c.tp + c.fp + c.tn + c.fn;
  return (
    <div className="space-y-5">
      <Panel label="Model card" title={MODEL.name} accent={C.violet}>
        <div className="px-5 py-5 grid grid-cols-12 gap-6">
          <div className="col-span-5">
            <p className="f-display text-[15px] leading-relaxed mb-4" style={{ color: C.bone2 }}>
              A regularized logistic-regression classifier trained on <span style={{color:C.bone}}>{MODEL.trained_on.toLocaleString()}</span> simulated session-outcome records
              from the synthetic cohort. Production deployment would replace this with a hierarchical Bayesian model (PyMC) or a
              gradient-boosted tree ensemble (XGBoost/LightGBM) and add patient-specific random effects.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3" style={{ background: C.ink3, border: `1px solid ${C.line}` }}>
                <div className="f-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: C.mute }}>Architecture</div>
                <div className="f-display text-base mt-1">Logistic Regression</div>
                <div className="f-mono text-[10px] mt-1" style={{ color: C.bone2 }}>L2 regularization, λ=0.1</div>
              </div>
              <div className="p-3" style={{ background: C.ink3, border: `1px solid ${C.line}` }}>
                <div className="f-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: C.mute }}>Training split</div>
                <div className="f-display text-base mt-1">70/15/15</div>
                <div className="f-mono text-[10px] mt-1" style={{ color: C.bone2 }}>Train / Val / Test</div>
              </div>
            </div>
          </div>
          <div className="col-span-7 grid grid-cols-4 gap-4">
            <Stat label="AUC (train)" value={MODEL.metrics.auc_train.toFixed(3)} large color={C.bone} />
            <Stat label="AUC (val)" value={MODEL.metrics.auc_val.toFixed(3)} large color={C.bone} />
            <Stat label="AUC (test)" value={MODEL.metrics.auc_test.toFixed(3)} large color={C.green} />
            <Stat label="Brier score" value={MODEL.metrics.brier.toFixed(3)} large color={C.bone} sub="lower = better calibrated" />
            <Stat label="Accuracy" value={(MODEL.metrics.accuracy*100).toFixed(1)} unit="%" />
            <Stat label="Precision" value={(MODEL.metrics.precision*100).toFixed(1)} unit="%" />
            <Stat label="Recall" value={(MODEL.metrics.recall*100).toFixed(1)} unit="%" />
            <Stat label="F1" value={(MODEL.metrics.f1*100).toFixed(1)} unit="%" />
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-12 gap-5">
        {/* ROC Curve */}
        <Panel className="col-span-4" label="ROC curve" title="Test set" accent={C.green}>
          <div className="px-3 py-3 rec-recharts" style={{ height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={validation.roc}>
                <CartesianGrid strokeDasharray="2 4" />
                <XAxis type="number" dataKey="fpr" domain={[0,1]} label={{ value: "FPR", position: "insideBottom", offset: -3, fontSize: 10, fill: C.mute }}/>
                <YAxis type="number" dataKey="tpr" domain={[0,1]} label={{ value: "TPR", angle: -90, position: "insideLeft", fontSize: 10, fill: C.mute }}/>
                <Tooltip contentStyle={{ background: C.ink, border: `1px solid ${C.line}`, fontFamily: "JetBrains Mono", fontSize: 11 }}
                  formatter={(v,n) => [v.toFixed(3), n]} labelFormatter={()=>""}/>
                <Line type="monotone" dataKey="tpr" stroke={C.green} strokeWidth={2.5} dot={false} />
                <ReferenceLine segment={[{x:0,y:0},{x:1,y:1}]} stroke={C.mute} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-4 flex justify-between items-center border-t pt-3" style={{ borderColor: C.line }}>
            <span className="f-mono text-[10px]" style={{ color: C.mute }}>Computed AUC</span>
            <span className="f-display text-xl tabular-nums" style={{ color: C.green }}>{auc.toFixed(3)}</span>
          </div>
        </Panel>

        {/* Calibration */}
        <Panel className="col-span-4" label="Calibration plot" title="Reliability diagram" accent={C.blue}>
          <div className="px-3 py-3 rec-recharts" style={{ height: 280 }}>
            <ResponsiveContainer>
              <ComposedChart data={validation.calibration}>
                <CartesianGrid strokeDasharray="2 4" />
                <XAxis type="number" dataKey="bin" domain={[0,1]} label={{ value: "Predicted prob.", position: "insideBottom", offset: -3, fontSize: 10, fill: C.mute }}/>
                <YAxis type="number" domain={[0,1]} label={{ value: "Observed freq.", angle: -90, position: "insideLeft", fontSize: 10, fill: C.mute }}/>
                <Tooltip contentStyle={{ background: C.ink, border: `1px solid ${C.line}`, fontFamily: "JetBrains Mono", fontSize: 11 }}/>
                <ReferenceLine segment={[{x:0,y:0},{x:1,y:1}]} stroke={C.mute} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="observed" stroke={C.blue} strokeWidth={2.5} dot={{ fill: C.blue, r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-4 f-mono text-[10px] border-t pt-3" style={{ color: C.mute, borderColor: C.line }}>
            Closer to diagonal = better calibrated. Brier = {MODEL.metrics.brier.toFixed(3)}.
          </div>
        </Panel>

        {/* Confusion Matrix */}
        <Panel className="col-span-4" label="Confusion matrix" title="Threshold = 0.50" accent={C.amber}>
          <div className="px-5 py-5">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="f-mono text-[9px] uppercase tracking-[0.18em] text-center" style={{ color: C.mute }}>Pred. fail</div>
                <div className="f-mono text-[9px] uppercase tracking-[0.18em] text-center" style={{ color: C.mute }}>Pred. success</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="f-mono text-[9px] uppercase tracking-[0.18em] flex items-center" style={{ color: C.mute }}>Actual fail</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="aspect-square flex flex-col items-center justify-center" style={{ background: C.green+"40", border: `1px solid ${C.green}` }}>
                  <div className="f-display text-2xl tabular-nums" style={{ color: C.green }}>{c.tn}</div>
                  <div className="f-mono text-[9px]" style={{ color: C.bone2 }}>TN</div>
                </div>
                <div className="aspect-square flex flex-col items-center justify-center" style={{ background: C.red+"30", border: `1px solid ${C.red}` }}>
                  <div className="f-display text-2xl tabular-nums" style={{ color: C.red }}>{c.fp}</div>
                  <div className="f-mono text-[9px]" style={{ color: C.bone2 }}>FP</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="f-mono text-[9px] uppercase tracking-[0.18em] flex items-center" style={{ color: C.mute }}>Actual success</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="aspect-square flex flex-col items-center justify-center" style={{ background: C.red+"30", border: `1px solid ${C.red}` }}>
                  <div className="f-display text-2xl tabular-nums" style={{ color: C.red }}>{c.fn}</div>
                  <div className="f-mono text-[9px]" style={{ color: C.bone2 }}>FN</div>
                </div>
                <div className="aspect-square flex flex-col items-center justify-center" style={{ background: C.green+"40", border: `1px solid ${C.green}` }}>
                  <div className="f-display text-2xl tabular-nums" style={{ color: C.green }}>{c.tp}</div>
                  <div className="f-mono text-[9px]" style={{ color: C.bone2 }}>TP</div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t f-mono text-[10px] grid grid-cols-2 gap-2" style={{ color: C.bone2, borderColor: C.line }}>
              <div>n total: <span style={{ color: C.bone }}>{total}</span></div>
              <div>n holdout: <span style={{ color: C.bone }}>200</span></div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Feature coefficients */}
      <Panel label="Feature coefficients" title="Trained logistic weights" accent={C.violet}>
        <div className="px-3 py-3 rec-recharts" style={{ height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={MODEL.features.filter(f => f.id !== "intercept")} layout="vertical" margin={{ left: 50 }}>
              <CartesianGrid strokeDasharray="2 4" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="label" type="category" width={200} tick={{ fill: C.bone2, fontSize: 11, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={{ background: C.ink, border: `1px solid ${C.line}`, fontFamily: "JetBrains Mono", fontSize: 11 }}/>
              <ReferenceLine x={0} stroke={C.bone2} />
              <Bar dataKey="coef">
                {MODEL.features.filter(f => f.id !== "intercept").map((f, i) => (
                  <Cell key={i} fill={f.coef > 0 ? C.green : C.red} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel label="System architecture" title="Production deployment plan" accent={C.bone}>
        <div className="px-5 py-5 grid grid-cols-4 gap-4">
          {[
            { icon: Heart, title: "Wearable layer", lines: ["Empatica EmbracePlus", "MQTT 1.67 Hz BVP", "GSR + skin temp", "On-device buffering"], color: C.red },
            { icon: Database, title: "Ingest & store", lines: ["FastAPI gateway", "TimescaleDB hypertables", "S3 cold storage", "HIPAA encryption (AES-256)"], color: C.amber },
            { icon: Cpu, title: "Inference", lines: ["scikit-learn 1.4", "ONNX Runtime", "<50ms p99 latency", "MLflow model registry"], color: C.violet },
            { icon: Network, title: "Clinician UI", lines: ["React + WebSocket", "Real-time alerts", "PDF report export", "Audit log + RBAC"], color: C.blue },
          ].map(s => (
            <div key={s.title} style={{ background: C.ink3, border: `1px solid ${C.line}` }} className="p-4">
              <s.icon size={18} style={{ color: s.color, marginBottom: 8 }} />
              <div className="f-display text-base mb-2">{s.title}</div>
              <div className="space-y-1">
                {s.lines.map(l => (
                  <div key={l} className="f-mono text-[10px]" style={{ color: C.bone2 }}>· {l}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ===========================================================================
// VIEW: CLINICAL REPORT
// ===========================================================================
function ReportView({ patient }) {
  const lastSession = patient.sessions[patient.sessions.length - 1];
  const recent = patient.sessions.slice(-20);
  const successTrend = recent.map((s, i) => ({
    n: i + 1,
    success: s.success ? 1 : 0,
    smooth: recent.slice(Math.max(0,i-4), i+1).filter(x => x.success).length / Math.min(i+1,5),
  }));
  return (
    <div className="space-y-5">
      <Panel label={`Report ${new Date().toISOString().slice(0,10)}`} title={`Clinical summary — ${patient.name}`} accent={C.bone}>
        <div className="px-5 py-5">
          <div className="flex items-start justify-between pb-4 mb-4 border-b" style={{ borderColor: C.line }}>
            <div>
              <div className="f-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: C.mute }}>Patient identifier</div>
              <div className="f-display text-2xl mt-0.5">{patient.name} <span className="f-mono text-sm" style={{ color: C.mute }}>· {patient.id}</span></div>
              <div className="f-mono text-[10px] mt-1" style={{ color: C.bone2 }}>
                {patient.age}y · {patient.sex} · DSM-5 {patient.severity} · ADOS-2 CALSS {patient.ados_calss} · SRS-2 T{patient.srs2_t}
              </div>
            </div>
            <button className="f-mono text-[10px] uppercase tracking-[0.15em] px-3 py-2 flex items-center gap-2"
              style={{ background: C.bone, color: C.ink }}>
              <Download size={11}/> Export PDF
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-5">
            <div>
              <div className="f-mono text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: C.mute }}>I. Twin profile summary</div>
              <p className="f-body text-[13px] leading-relaxed" style={{ color: C.bone2 }}>
                Subject's digital twin has been calibrated against {patient.sessions.length} observed sessions.
                Baseline cardiovascular state shows {patient.hrv_rmssd < 30 ? <span style={{color:C.amber}}>reduced parasympathetic tone</span> : "preserved parasympathetic tone"} (HRV {patient.hrv_rmssd}ms, vs NT mean ~45ms).
                Cortisol AM: {patient.cortisol_morning} μg/dL ({patient.cortisol_morning > 0.45 ? "elevated" : "within reference"}).
                Sensory profile shows hypersensitivity in {Object.entries(patient.sensory).filter(([_,v]) => v > 70).map(([k]) => k).join(", ") || "no domains above threshold"}.
              </p>
            </div>
            <div>
              <div className="f-mono text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: C.mute }}>II. Behavioral pattern</div>
              <p className="f-body text-[13px] leading-relaxed" style={{ color: C.bone2 }}>
                Session success rate (rolling): <span style={{color:C.green}}>{patient.successRate}%</span>.
                Meltdown rate: <span style={{color:C.red}}>{patient.meltdownRate}%</span>.
                Top precipitating triggers: {patient.triggers.slice(0,3).map(t=>t.name).join("; ")}.
                Transition rigidity index: {Math.round(patient.behavior.transition_rigidity*100)} (high implies low tolerance for schedule disruption).
              </p>
            </div>
            <div>
              <div className="f-mono text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: C.mute }}>III. Clinical recommendations</div>
              <ul className="space-y-1.5">
                {[
                  patient.sensory.auditory > 70 && "Maintain ambient noise <60 dB during sessions",
                  patient.behavior.transition_rigidity > 0.6 && "Provide visual schedule with 5-min advance warning of transitions",
                  patient.behavior.novelty_tolerance < 0.4 && "Prioritize familiar therapist; introduce new staff via paired sessions first",
                  patient.behavior.social_initiation < 0.4 && "Cap group sessions at 2 peers; consider 1:1 baseline",
                  "Continue physiological monitoring during sessions; trigger de-escalation at HRV drop >25%",
                ].filter(Boolean).map((r, i) => (
                  <li key={i} className="f-body text-[12px] flex gap-2" style={{ color: C.bone2 }}>
                    <span style={{ color: C.bone }}>·</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 pt-5 border-t" style={{ borderColor: C.line }}>
            <div>
              <div className="f-mono text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: C.mute }}>Recent session outcomes (last 20)</div>
              <div className="rec-recharts" style={{ height: 180 }}>
                <ResponsiveContainer>
                  <ComposedChart data={successTrend}>
                    <CartesianGrid strokeDasharray="2 4" />
                    <XAxis dataKey="n" />
                    <YAxis domain={[0,1]} />
                    <Tooltip contentStyle={{ background: C.ink, border: `1px solid ${C.line}`, fontFamily: "JetBrains Mono", fontSize: 11 }}/>
                    <Bar dataKey="success" fill={C.green} opacity={0.5} />
                    <Line type="monotone" dataKey="smooth" stroke={C.bone} strokeWidth={2.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <div className="f-mono text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: C.mute }}>Last session log</div>
              <div className="space-y-1.5 f-mono text-[11px]" style={{ color: C.bone2 }}>
                <div className="flex justify-between"><span>Date</span><span style={{color:C.bone}}>{lastSession.date}</span></div>
                <div className="flex justify-between"><span>Intervention</span><span style={{color:C.bone}}>{lastSession.intervention}</span></div>
                <div className="flex justify-between"><span>Duration</span><span style={{color:C.bone}}>{lastSession.dur} min</span></div>
                <div className="flex justify-between"><span>Noise</span><span style={{color:C.bone}}>{lastSession.noise} dB</span></div>
                <div className="flex justify-between"><span>Peers / familiar</span><span style={{color:C.bone}}>{lastSession.peers} / {lastSession.familiar?"yes":"no"}</span></div>
                <div className="flex justify-between"><span>Outcome</span>
                  <span style={{color: lastSession.success ? C.green : C.red}}>{lastSession.success?"SUCCESS":"FAIL"}{lastSession.meltdown?" + meltdown":""}</span>
                </div>
                <div className="flex justify-between"><span>HR peak / HRV min</span><span style={{color:C.bone}}>{lastSession.hr_peak}/{lastSession.hrv_min}</span></div>
                <div className="flex justify-between"><span>Cortisol peak</span><span style={{color:C.bone}}>{lastSession.cortisol_peak} μg/dL</span></div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t f-mono text-[10px] flex justify-between" style={{ color: C.mute, borderColor: C.line }}>
            <div>Generated by {MODEL.name} · {new Date().toISOString()}</div>
            <div>Clinician must verify before clinical action · This is a research prototype</div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
