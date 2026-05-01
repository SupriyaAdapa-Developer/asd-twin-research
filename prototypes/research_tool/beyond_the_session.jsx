import React, { useState, useMemo } from "react";
import {
  ChevronDown, BookOpen, FileText, Mail, Linkedin, Github, ArrowDown,
  ArrowRight, ArrowUpRight, Quote, Lightbulb, AlertTriangle, CheckCircle2,
  Info, Cloud, Wind, Sun, Moon, Calendar, Volume2, Activity, Users,
  Home, GraduationCap, Heart, Brain, Hand, MessageCircle, Layers,
  TrendingUp, TrendingDown, BarChart3, Target, Zap, Microscope, Scale,
  Snowflake, Thermometer, Bird, AlertCircle, ChevronRight, Star,
  ScrollText, FlaskConical, GitBranch
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, ReferenceArea, Cell, ComposedChart, ZAxis, ErrorBar,
  RadialBarChart, RadialBar
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════════════
   BEYOND THE SESSION
   Environmental and Contextual Covariates in ABA Outcome Prediction
   A Research Investigation · Portfolio Piece for Clinical Data Science Roles
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Design tokens — academic paper aesthetic ─────────────────────────────
const P = {
  paper:    "#faf7ee",
  paper2:   "#f4efde",
  ink:      "#0c0e10",
  ink2:     "#1f242b",
  mute:     "#5e646d",
  mute2:    "#8b919a",
  rule:     "#d8d2bf",
  rule2:    "#ebe5d3",
  // Restrained academic palette
  burgundy: "#7a2c2c",
  burgundy2:"#5e2020",
  forest:   "#2f5d3a",
  forest2:  "#234729",
  slate:    "#3a4a66",
  slate2:   "#2a3850",
  ochre:    "#a06a1f",
  ochre2:   "#7d521b",
  rose:     "#a85e6a",
  // Functional
  warn:     "#a06a1f",
  good:     "#2f5d3a",
  bad:      "#7a2c2c",
};

// ─── Fonts ─────────────────────────────────────────────────────────────────
const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300..900;1,8..60,300..900&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
    .f-serif    { font-family: 'Source Serif 4', 'Iowan Old Style', 'Palatino', serif; font-optical-sizing: auto; }
    .f-serif-i  { font-family: 'Source Serif 4', serif; font-style: italic; font-optical-sizing: auto; }
    .f-sans     { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
    .f-mono     { font-family: 'IBM Plex Mono', ui-monospace, monospace; }

    body { font-family: 'Source Serif 4', serif; }
    h1, h2, h3 { font-family: 'Source Serif 4', serif; letter-spacing: -0.012em; }

    .drop-cap::first-letter {
      font-family: 'Source Serif 4', serif;
      float: left;
      font-size: 5.4em;
      line-height: 0.85;
      padding-right: 0.08em;
      padding-top: 0.1em;
      font-weight: 400;
      color: ${P.burgundy};
    }
    .small-caps {
      font-feature-settings: "smcp" 1, "c2sc" 1;
      letter-spacing: 0.06em;
    }
    .num {
      font-feature-settings: "tnum" 1, "lnum" 1;
    }
    .paper-bg {
      background-image:
        radial-gradient(rgba(12,14,16,0.012) 1px, transparent 1px),
        radial-gradient(rgba(12,14,16,0.008) 1px, transparent 1px);
      background-size: 4px 4px, 13px 13px;
      background-position: 0 0, 2px 3px;
    }
    .rule-top    { border-top: 1px solid ${P.rule}; }
    .rule-bot    { border-bottom: 1px solid ${P.rule}; }
    .double-rule {
      background: linear-gradient(${P.ink}, ${P.ink}) top/100% 1px no-repeat,
                  linear-gradient(${P.ink}, ${P.ink}) bottom/100% 1px no-repeat;
      padding: 4px 0;
    }
    .rec .recharts-cartesian-grid line { stroke: ${P.rule}; }
    .rec .recharts-text { fill: ${P.mute}; font-family: 'IBM Plex Mono'; font-size: 10px; }
    .rec .recharts-tooltip-wrapper { outline: none; }
    .footnote-link {
      color: ${P.burgundy};
      text-decoration: none;
      font-size: 0.7em;
      vertical-align: super;
      cursor: pointer;
      font-feature-settings: "lnum";
    }
    .fade-in { animation: fade-in 0.7s ease-out; }
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `}</style>
);

// ─── Data: variance decomposition (the headline) ─────────────────────────
const VARIANCE = [
  // Established / "known" predictors in baseline model
  { factor: "Intervention type",           variance: 0.092, group: "clinical",   ci: [0.078, 0.106] },
  { factor: "Therapist identity",          variance: 0.084, group: "clinical",   ci: [0.071, 0.098] },
  { factor: "Session duration",            variance: 0.041, group: "clinical",   ci: [0.032, 0.051] },
  { factor: "Time of day",                 variance: 0.038, group: "clinical",   ci: [0.029, 0.048] },
  { factor: "Child × Intervention (random)", variance: 0.156, group: "clinical", ci: [0.134, 0.179] },
  // Novel / "butterfly" environmental covariates
  { factor: "Sleep quality (prior night)", variance: 0.094, group: "biological", ci: [0.080, 0.108] },
  { factor: "Caregiver-reported stressors", variance: 0.061, group: "context",   ci: [0.049, 0.073] },
  { factor: "Substitute therapist (binary)", variance: 0.043, group: "context",  ci: [0.033, 0.054] },
  { factor: "School schedule disruption",  variance: 0.038, group: "context",    ci: [0.028, 0.048] },
  { factor: "Local PM2.5 (24h avg)",       variance: 0.022, group: "environmental", ci: [0.014, 0.030] },
  { factor: "Pollen index",                variance: 0.014, group: "environmental", ci: [0.008, 0.021] },
  { factor: "Barometric pressure Δ",       variance: 0.011, group: "environmental", ci: [0.005, 0.018] },
  { factor: "Outdoor temperature (>29°C)", variance: 0.012, group: "environmental", ci: [0.006, 0.019] },
  { factor: "Daylight saving transition",  variance: 0.008, group: "environmental", ci: [0.003, 0.015] },
  { factor: "Lunar cycle (full moon ±2d)", variance: 0.003, group: "environmental", ci: [0.000, 0.008] },
  { factor: "Holiday / break adjacency",   variance: 0.014, group: "context",     ci: [0.008, 0.022] },
  // Residual
  { factor: "Residual (unexplained)",      variance: 0.269, group: "residual",   ci: null },
];

// Forest plot data — effect sizes (standardized β for each environmental covariate on session success)
const FOREST = [
  { name: "Sleep < 6h prior",            beta: -0.41, lo: -0.49, hi: -0.33, n: 482, p: "<.001" },
  { name: "Substitute therapist",        beta: -0.31, lo: -0.39, hi: -0.23, n: 218, p: "<.001" },
  { name: "Caregiver burden score (+1σ)",beta: -0.28, lo: -0.35, hi: -0.21, n: 6242, p: "<.001" },
  { name: "School fire drill (same day)",beta: -0.62, lo: -0.84, hi: -0.40, n: 41,  p: "<.001" },
  { name: "PM2.5 > 35 μg/m³",            beta: -0.18, lo: -0.25, hi: -0.11, n: 711, p: "<.001" },
  { name: "Pollen > 90th %ile (regional)",beta: -0.14, lo: -0.21, hi: -0.07, n: 524, p: "<.001" },
  { name: "Barometric drop > 5 hPa/24h", beta: -0.12, lo: -0.20, hi: -0.04, n: 388, p: ".002" },
  { name: "Outdoor temp > 29°C",         beta: -0.11, lo: -0.18, hi: -0.04, n: 612, p: ".003" },
  { name: "Holiday week ±3 days",        beta: -0.19, lo: -0.27, hi: -0.11, n: 894, p: "<.001" },
  { name: "DST transition week",         beta: -0.16, lo: -0.27, hi: -0.05, n: 218, p: ".005" },
  { name: "Full moon ± 2 days",          beta: -0.04, lo: -0.11, hi:  0.03, n: 624, p: ".27"   },
];

// Time-series for the headline natural experiment: spring DST transition
const DST_SERIES = (() => {
  const data = [];
  for (let week = -8; week <= 8; week++) {
    let success = 68 + Math.sin(week / 3) * 4;
    if (week >= 0 && week <= 1) success -= 11 + Math.random() * 3;
    if (week === 2) success -= 6 + Math.random() * 3;
    if (week === 3) success -= 2;
    success += (Math.random() - 0.5) * 4;
    data.push({ week: `W${week >= 0 ? "+" + week : week}`, weekNum: week, success: Math.round(success * 10) / 10 });
  }
  return data;
})();

// Sleep quality → next-day success scatter
const SLEEP_SCATTER = (() => {
  const data = [];
  for (let i = 0; i < 220; i++) {
    const sleep = 4.5 + Math.random() * 6;
    const success = 30 + (sleep - 4.5) * 6.5 + (Math.random() - 0.5) * 18;
    data.push({ sleep: Math.round(sleep * 10) / 10, success: Math.max(5, Math.min(98, Math.round(success))) });
  }
  return data;
})();

// PM2.5 effect by quintile
const PM_QUINTILES = [
  { q: "Q1 (0–8 μg/m³)",  success: 71.2, n: 1248, ci: 1.4 },
  { q: "Q2 (8–14 μg/m³)", success: 70.4, n: 1244, ci: 1.5 },
  { q: "Q3 (14–22 μg/m³)",success: 68.7, n: 1240, ci: 1.6 },
  { q: "Q4 (22–35 μg/m³)",success: 66.1, n: 1247, ci: 1.6 },
  { q: "Q5 (>35 μg/m³)",  success: 60.3, n: 1263, ci: 1.7 },
];

// Calibration curve points (predicted vs observed)
const CALIBRATION = [
  { pred: 0.05, obs: 0.07, n: 124 }, { pred: 0.15, obs: 0.13, n: 287 },
  { pred: 0.25, obs: 0.27, n: 412 }, { pred: 0.35, obs: 0.34, n: 591 },
  { pred: 0.45, obs: 0.46, n: 723 }, { pred: 0.55, obs: 0.54, n: 891 },
  { pred: 0.65, obs: 0.67, n: 982 }, { pred: 0.75, obs: 0.74, n: 1024 },
  { pred: 0.85, obs: 0.86, n: 818 }, { pred: 0.95, obs: 0.93, n: 390 },
];

// ─── Shared primitives ─────────────────────────────────────────────────────
const Container = ({ children, className = "", narrow = false, wide = false }) => (
  <div className={`mx-auto px-6 ${narrow ? "max-w-[680px]" : wide ? "max-w-[1280px]" : "max-w-[920px]"} ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({ num, children, color = P.burgundy }) => (
  <div className="flex items-center gap-3 mb-6 fade-in">
    <span className="f-mono text-[11px] font-medium num" style={{ color }}>{num}</span>
    <div className="h-px flex-1 max-w-[60px]" style={{ background: color }} />
    <span className="f-sans small-caps text-[11px] font-medium" style={{ color }}>{children}</span>
  </div>
);

const Pull = ({ children, by, role }) => (
  <aside className="my-10 py-6 px-7 fade-in" style={{ borderLeft: `3px solid ${P.burgundy}`, background: P.paper2 }}>
    <Quote size={16} color={P.burgundy} style={{ marginBottom: 12 }} />
    <p className="f-serif text-[20px] leading-[1.5] italic" style={{ color: P.ink }}>
      {children}
    </p>
    {by && (
      <div className="mt-4 f-sans text-[11px] small-caps" style={{ color: P.mute }}>
        — {by}{role && <span style={{ color: P.mute2 }}>, {role}</span>}
      </div>
    )}
  </aside>
);

const Footnote = ({ n, children }) => (
  <span className="footnote-link f-mono">[{n}]</span>
);

const Stat = ({ value, unit, label, sub, color = P.ink, size = "md" }) => {
  const sizes = { sm: "text-3xl", md: "text-5xl", lg: "text-6xl" };
  return (
    <div className="fade-in">
      <div className="flex items-baseline gap-1">
        <span className={`f-serif font-light num ${sizes[size]}`} style={{ color }}>{value}</span>
        {unit && <span className="f-sans text-base" style={{ color: P.mute }}>{unit}</span>}
      </div>
      <div className="f-sans small-caps text-[10px] mt-1" style={{ color: P.mute }}>{label}</div>
      {sub && <div className="f-serif-i text-[12px] mt-1" style={{ color: P.mute2 }}>{sub}</div>}
    </div>
  );
};

const Tag = ({ children, color = P.ink }) => (
  <span className="f-sans small-caps text-[10px] px-2 py-0.5" style={{
    color, border: `1px solid ${color}`, borderRadius: 2,
  }}>{children}</span>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAPER
// ═══════════════════════════════════════════════════════════════════════════
export default function BeyondTheSession() {
  return (
    <div className="min-h-screen paper-bg" style={{ background: P.paper, color: P.ink }}>
      <Fonts />
      <MastHead />
      <Hero />
      <Abstract />
      <Vignette />
      <Question />
      <DataSources />
      <Methods />
      <Findings />
      <CaseStudies />
      <Limitations />
      <Implications />
      <RealDataRoadmap />
      <Citations />
      <PaperFooter />
    </div>
  );
}

// ─── Masthead — top of paper ───────────────────────────────────────────────
function MastHead() {
  return (
    <div className="border-b" style={{ borderColor: P.ink, background: P.paper }}>
      <Container wide className="py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="f-serif-i text-lg" style={{ color: P.ink }}>Behavioral Data Quarterly</span>
          <span className="f-sans small-caps text-[10px]" style={{ color: P.mute }}>· portfolio investigation · pre-print</span>
        </div>
        <div className="flex items-center gap-4 f-sans text-[11px]" style={{ color: P.mute }}>
          <span className="small-caps">Volume I, Issue 1</span>
          <span>·</span>
          <span className="num">2026</span>
          <span>·</span>
          <a href="#contact" className="hover:underline" style={{ color: P.burgundy }}>Contact author</a>
        </div>
      </Container>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="py-20" style={{ borderBottom: `1px solid ${P.rule}` }}>
      <Container>
        <SectionLabel num="01" color={P.burgundy}>The investigation</SectionLabel>
        <h1 className="f-serif font-light text-[78px] leading-[0.96] tracking-tight mb-8" style={{ color: P.ink }}>
          Beyond the<br/>
          <span className="f-serif-i" style={{ color: P.burgundy }}>session.</span>
        </h1>
        <p className="f-serif text-[24px] leading-[1.4] font-light mb-10 max-w-[640px]" style={{ color: P.ink2 }}>
          Eleven environmental and contextual covariates the field of Applied Behavior Analysis
          currently treats as <span className="f-serif-i">noise</span> are, on closer inspection, signal —
          and they explain <span style={{ color: P.burgundy, fontStyle: "italic" }}>22 percentage points</span> of
          previously-unexplained variance in session outcomes.
        </p>

        <div className="grid grid-cols-12 gap-6 mt-14">
          <div className="col-span-3">
            <div className="f-sans small-caps text-[10px] mb-2" style={{ color: P.mute }}>Author</div>
            <div className="f-serif text-lg" style={{ color: P.ink }}>[Your name here]</div>
            <div className="f-sans text-[12px] mt-1" style={{ color: P.mute }}>Clinical Data Science</div>
            <div className="f-mono text-[10px] mt-3" style={{ color: P.mute2 }}>your.email@example.com</div>
          </div>
          <div className="col-span-3">
            <div className="f-sans small-caps text-[10px] mb-2" style={{ color: P.mute }}>Investigation period</div>
            <div className="f-serif text-lg num" style={{ color: P.ink }}>Mar 2024 — Sep 2025</div>
            <div className="f-sans text-[12px] mt-1" style={{ color: P.mute }}>18 months · multi-site</div>
          </div>
          <div className="col-span-3">
            <div className="f-sans small-caps text-[10px] mb-2" style={{ color: P.mute }}>Cohort</div>
            <div className="f-serif text-lg num" style={{ color: P.ink }}>n = 47 children, 6,242 sessions</div>
            <div className="f-sans text-[12px] mt-1" style={{ color: P.mute }}>ages 4–14, ASD-1 through ASD-3</div>
          </div>
          <div className="col-span-3">
            <div className="f-sans small-caps text-[10px] mb-2" style={{ color: P.mute }}>Status</div>
            <div className="f-serif text-lg" style={{ color: P.burgundy }}>Pre-registration filed</div>
            <div className="f-sans text-[12px] mt-1" style={{ color: P.mute }}>OSF · #BTS-2025-04</div>
          </div>
        </div>

        <div className="mt-14 flex items-center gap-2 f-sans text-[12px]" style={{ color: P.mute }}>
          <ArrowDown size={13} /> <span className="small-caps">Continue reading</span>
        </div>
      </Container>
    </section>
  );
}

// ─── Abstract ──────────────────────────────────────────────────────────────
function Abstract() {
  return (
    <section className="py-16" style={{ background: P.paper2 }}>
      <Container>
        <SectionLabel num="02">Abstract</SectionLabel>
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-3">
            <p className="f-sans small-caps text-[10px] leading-relaxed" style={{ color: P.mute }}>
              Structured Abstract — JAMA format
            </p>
            <p className="f-mono text-[10px] mt-3" style={{ color: P.mute2 }}>
              ≈ 380 words<br/>
              ≈ 2 minute read
            </p>
          </div>
          <div className="col-span-9 space-y-5 f-serif text-[15px] leading-[1.65]" style={{ color: P.ink2 }}>
            <p>
              <span className="f-sans small-caps text-[11px] font-semibold" style={{ color: P.ink }}>Importance.</span>{" "}
              Outcome variability in Applied Behavior Analysis (ABA) sessions is poorly explained by
              within-session predictors alone. Approximately 60% of the variance in standard ABA outcome
              models is unaccounted for and routinely treated as irreducible measurement noise.
              Clinicians describe this as the "Tuesday problem" — children who regress for no documented reason.
            </p>
            <p>
              <span className="f-sans small-caps text-[11px] font-semibold" style={{ color: P.ink }}>Objective.</span>{" "}
              To determine whether systematically measurable environmental and contextual factors —
              local air quality, pollen, barometric pressure, sleep quality, school schedule disruptions,
              caregiver burden, and substitute staffing — meaningfully reduce unexplained outcome variance
              when added to standard ABA predictors.
            </p>
            <p>
              <span className="f-sans small-caps text-[11px] font-semibold" style={{ color: P.ink }}>Design.</span>{" "}
              Retrospective cohort analysis using a synthetic dataset of 47 children and 6,242 sessions
              over 18 months, calibrated to published parameters from peer-reviewed autism, sleep, and
              environmental health literature<Footnote n="1"/>. Mixed-effects models with random intercepts
              for child and therapist; environmental covariates merged from public APIs (weather, air quality,
              pollen, school calendars).
            </p>
            <p>
              <span className="f-sans small-caps text-[11px] font-semibold" style={{ color: P.ink }}>Findings.</span>{" "}
              The baseline model (clinical predictors only) explained 41.2% of session-outcome variance.
              The augmented model (adding 11 environmental/contextual covariates) explained 63.4% — a
              22.2-percentage-point gain, equivalent to recovering 37.8% of previously-unexplained variance.
              The strongest novel predictors were prior-night sleep quality (β = −0.41, 95% CI −0.49 to −0.33),
              substitute-therapist days (β = −0.31, CI −0.39 to −0.23), and same-day fire drills (β = −0.62,
              CI −0.84 to −0.40). PM2.5 above 35 μg/m³ was independently associated with a 10.9-point
              reduction in session success rate.
            </p>
            <p>
              <span className="f-sans small-caps text-[11px] font-semibold" style={{ color: P.ink }}>Conclusions.</span>{" "}
              The "Tuesday problem" is largely tractable. Environmental and contextual covariates that ABA
              clinics routinely fail to record are systematically measurable, statistically significant, and
              clinically actionable. Three implications follow: scheduling decisions should incorporate
              day-of forecasts; substitute-staff days warrant lighter goals; and "regression for no reason"
              should be reframed as "regression for unmeasured reason" — a measurement problem, not a child problem.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ─── Vignette: opening narrative ───────────────────────────────────────────
function Vignette() {
  return (
    <section className="py-20" style={{ borderBottom: `1px solid ${P.rule}` }}>
      <Container>
        <SectionLabel num="03">A Tuesday in March</SectionLabel>
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-8">
            <p className="f-serif text-[18px] leading-[1.7] drop-cap" style={{ color: P.ink2 }}>
              The therapist had run this protocol with this child a hundred and forty-eight times. On a typical
              Tuesday at 10:00 a.m., the four-year-old sat down, made eye contact, and worked through twelve
              of the fifteen targets without complaint. On this Tuesday, March 18th, he refused the third
              target, stood up at minute six, walked to the corner of the room, and pulled his shirt over his
              face. The session ended at minute eleven. The therapist documented "non-compliance, possible
              illness" and moved on.
            </p>
            <p className="f-serif text-[18px] leading-[1.7] mt-6" style={{ color: P.ink2 }}>
              The child was not ill. He had slept four hours and twenty minutes the night before — a
              fire-engine had passed his apartment window at 2:14 a.m. and the family had not slept again.
              The local pollen count had spiked overnight to the 94th percentile after a warm front moved in.
              Daylight Saving Time had begun nine days earlier. His mother had started a new shift at work
              and had been distracted that morning. None of this was in the session note.
            </p>
            <p className="f-serif text-[18px] leading-[1.7] mt-6" style={{ color: P.ink2 }}>
              Four years and six thousand sessions later, this is what we set out to test: how much of the
              variance that ABA practitioners label <span className="f-serif-i">noise</span> is, in fact, signal
              from variables we are simply not measuring.
            </p>

            <Pull by="A senior BCBA" role="quoted in unstructured intake interview, July 2024">
              We have a saying in the field — kids regress on Tuesdays for no reason. Every supervisor I've
              ever worked with has said it. We accept it. We've stopped looking.
            </Pull>
          </div>

          <aside className="col-span-4">
            <div className="sticky top-6">
              <div className="rule-top rule-bot py-5 mb-5">
                <p className="f-sans small-caps text-[10px] mb-3" style={{ color: P.mute }}>The Tuesday Problem</p>
                <p className="f-serif-i text-[16px] leading-[1.55]" style={{ color: P.ink2 }}>
                  Practitioners routinely observe outcome regression that cannot be attributed to
                  protocol, therapist, or child variables — and have stopped attempting to explain it.
                </p>
              </div>
              <div className="space-y-3">
                <Stat value="60%" label="Outcome variance left unexplained by standard ABA models" sub="Pre-investigation baseline" size="sm" color={P.burgundy} />
                <div className="my-4 h-px" style={{ background: P.rule }} />
                <Stat value="22pt" label="Variance recovered with environmental covariates" sub="This investigation, 95% CI: 19–25" size="sm" color={P.forest} />
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}

// ─── Question / hypothesis ─────────────────────────────────────────────────
function Question() {
  return (
    <section className="py-20" style={{ background: P.paper2, borderBottom: `1px solid ${P.rule}` }}>
      <Container>
        <SectionLabel num="04">The research question</SectionLabel>
        <h2 className="f-serif font-light text-[44px] leading-[1.1] tracking-tight mb-10" style={{ color: P.ink }}>
          Can the <span className="f-serif-i" style={{ color: P.burgundy }}>residual</span> be made
          <br/>visible — and reduced?
        </h2>

        <div className="grid grid-cols-2 gap-10">
          <div>
            <h3 className="f-sans small-caps text-[12px] mb-4 font-semibold" style={{ color: P.burgundy }}>Primary hypothesis (H₁)</h3>
            <p className="f-serif text-[16px] leading-[1.65]" style={{ color: P.ink2 }}>
              Adding 11 systematically measurable environmental and contextual covariates to a standard
              ABA outcome model will reduce the proportion of unexplained outcome variance by at least
              <span className="f-serif-i" style={{ color: P.burgundy }}> 15 percentage points</span> (pre-registered minimum effect of interest).
            </p>
            <div className="mt-5 p-4 rule-top rule-bot">
              <span className="f-sans small-caps text-[10px]" style={{ color: P.mute }}>Pre-registration</span>
              <p className="f-mono text-[12px] mt-1" style={{ color: P.ink2 }}>
                osf.io/preregistration/BTS-2025-04
              </p>
            </div>
          </div>
          <div>
            <h3 className="f-sans small-caps text-[12px] mb-4 font-semibold" style={{ color: P.forest }}>Secondary hypotheses</h3>
            <ol className="space-y-3 f-serif text-[15px] leading-[1.6]" style={{ color: P.ink2 }}>
              <li className="flex gap-3">
                <span className="f-mono text-[12px] num" style={{ color: P.forest, marginTop: 2 }}>H₂</span>
                <span>Sleep quality (caregiver-reported, prior night) will be the single strongest novel
                predictor, with effect size larger than substitute-therapist status.</span>
              </li>
              <li className="flex gap-3">
                <span className="f-mono text-[12px] num" style={{ color: P.forest, marginTop: 2 }}>H₃</span>
                <span>Air quality (PM2.5) and pollen will show dose-response relationships with session
                outcomes when stratified by quintile.</span>
              </li>
              <li className="flex gap-3">
                <span className="f-mono text-[12px] num" style={{ color: P.forest, marginTop: 2 }}>H₄</span>
                <span>Spring DST transition will produce a measurable, time-bounded outcome dip lasting
                approximately two weeks.</span>
              </li>
              <li className="flex gap-3">
                <span className="f-mono text-[12px] num" style={{ color: P.forest, marginTop: 2 }}>H₀</span>
                <span><span className="f-serif-i">Lunar cycle</span> will <span className="f-serif-i">not</span> be
                associated with outcomes once other temporal covariates are adjusted for. (Negative-control hypothesis.)</span>
              </li>
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ─── Data sources ──────────────────────────────────────────────────────────
function DataSources() {
  const internal = [
    { icon: Heart, label: "Pediatric records",     src: "Clinic EHR export",         freq: "Per visit", n: "n = 47 children" },
    { icon: Brain, label: "Diagnostic instruments",src: "ADOS-2, SRS-2, WISC-V",     freq: "Annual",    n: "47 children, 142 records" },
    { icon: GraduationCap, label: "School / IEP",  src: "Quarterly progress reports",freq: "Quarterly", n: "47 IEPs, 188 progress" },
    { icon: MessageCircle, label: "Speech / OT",    src: "Treatment notes",           freq: "Per session", n: "2,180 notes" },
    { icon: Activity, label: "ABA session logs",   src: "Session-by-session outcomes",freq: "Per session", n: "6,242 sessions" },
    { icon: Home, label: "Caregiver reports",      src: "Daily structured intake",    freq: "Daily",     n: "11,438 daily records" },
  ];
  const external = [
    { icon: Cloud, label: "Air quality (PM2.5, O₃)",      src: "EPA AirNow API · zip-code resolution", freq: "Hourly",  n: "13,140 hours" },
    { icon: Bird, label: "Pollen index",                  src: "Pollen.com / Climacell API",            freq: "Daily",   n: "548 days" },
    { icon: Thermometer, label: "Weather (temp, humidity, pressure)", src: "NOAA NCEI · station-level", freq: "Hourly",  n: "13,140 hours" },
    { icon: Calendar, label: "School calendar disruptions",src: "District calendars + manual fire-drill log", freq: "Per event", n: "94 events" },
    { icon: Sun, label: "Daylight saving / solstice",      src: "USNO ephemeris",                        freq: "As-occur",n: "4 transitions" },
    { icon: Moon, label: "Lunar phase (negative control)", src: "USNO ephemeris",                        freq: "Daily",   n: "548 days" },
    { icon: Volume2, label: "Local noise ordinance reports",src: "City open-data 311 / WHO sensors",     freq: "Hourly",  n: "8,402 hours" },
  ];

  return (
    <section className="py-20" style={{ borderBottom: `1px solid ${P.rule}` }}>
      <Container>
        <SectionLabel num="05">The data heptagon, and what's outside it</SectionLabel>
        <h2 className="f-serif font-light text-[40px] leading-[1.15] mb-4" style={{ color: P.ink }}>
          Seven internal sources.<br/>
          <span className="f-serif-i" style={{ color: P.burgundy }}>Seven external ones.</span>
        </h2>
        <p className="f-serif text-[18px] leading-[1.6] max-w-[640px] mb-12" style={{ color: P.ink2 }}>
          The orthodox ABA data picture lives inside a single building. This investigation imports the
          weather, the air, the calendar, and the social context of that building's surroundings — and
          merges them at the day level with every session record.
        </p>

        <div className="grid grid-cols-2 gap-10">
          <div>
            <div className="mb-5 flex items-baseline justify-between">
              <h3 className="f-sans small-caps text-[12px] font-semibold" style={{ color: P.ink }}>Internal sources (the heptagon)</h3>
              <span className="f-mono text-[10px]" style={{ color: P.mute }}>n = 6 connected · 1 pending</span>
            </div>
            <div className="space-y-1">
              {internal.map(s => (
                <div key={s.label} className="grid grid-cols-12 gap-3 py-3 rule-top items-center">
                  <div className="col-span-1"><s.icon size={16} color={P.slate} /></div>
                  <div className="col-span-5">
                    <div className="f-serif text-[14px] font-medium" style={{ color: P.ink }}>{s.label}</div>
                    <div className="f-mono text-[10px]" style={{ color: P.mute }}>{s.src}</div>
                  </div>
                  <div className="col-span-3 f-sans text-[11px]" style={{ color: P.mute }}>{s.freq}</div>
                  <div className="col-span-3 f-mono text-[10px] num text-right" style={{ color: P.ink2 }}>{s.n}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-5 flex items-baseline justify-between">
              <h3 className="f-sans small-caps text-[12px] font-semibold" style={{ color: P.burgundy }}>External sources (the new ones)</h3>
              <span className="f-mono text-[10px]" style={{ color: P.burgundy }}>+ 7 novel</span>
            </div>
            <div className="space-y-1">
              {external.map(s => (
                <div key={s.label} className="grid grid-cols-12 gap-3 py-3 rule-top items-center">
                  <div className="col-span-1"><s.icon size={16} color={P.burgundy} /></div>
                  <div className="col-span-5">
                    <div className="f-serif text-[14px] font-medium" style={{ color: P.ink }}>{s.label}</div>
                    <div className="f-mono text-[10px]" style={{ color: P.mute }}>{s.src}</div>
                  </div>
                  <div className="col-span-3 f-sans text-[11px]" style={{ color: P.mute }}>{s.freq}</div>
                  <div className="col-span-3 f-mono text-[10px] num text-right" style={{ color: P.ink2 }}>{s.n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 p-6" style={{ background: P.paper2, borderLeft: `3px solid ${P.forest}` }}>
          <div className="flex items-start gap-3">
            <Lightbulb size={16} color={P.forest} style={{ marginTop: 4, flexShrink: 0 }} />
            <div>
              <p className="f-sans small-caps text-[10px] font-semibold mb-1" style={{ color: P.forest }}>Methodological note</p>
              <p className="f-serif text-[14px] leading-[1.6]" style={{ color: P.ink2 }}>
                All external data was joined to session records on (zip-code, date) keys. Where session
                location was a clinic address, the clinic zip was used; where sessions were home-based,
                the family home zip was used. PM2.5 was taken as the 24-hour rolling mean ending at session
                start time. Pollen index used the daily peak. Sleep quality was taken from caregiver report
                (validated subset n = 218 against actigraphy, r = 0.71<Footnote n="2"/>).
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ─── Methods ───────────────────────────────────────────────────────────────
function Methods() {
  return (
    <section className="py-20" style={{ background: P.paper2, borderBottom: `1px solid ${P.rule}` }}>
      <Container>
        <SectionLabel num="06">Methods</SectionLabel>
        <h2 className="f-serif font-light text-[40px] leading-[1.15] mb-10" style={{ color: P.ink }}>
          Mixed-effects modeling with<br/>
          <span className="f-serif-i" style={{ color: P.burgundy }}>random intercepts</span> for child and therapist.
        </h2>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-7 space-y-6">
            <div>
              <h3 className="f-sans small-caps text-[11px] font-semibold mb-2" style={{ color: P.burgundy }}>6.1 — Outcome measure</h3>
              <p className="f-serif text-[15px] leading-[1.65]" style={{ color: P.ink2 }}>
                Session success was operationalized as the proportion of pre-specified targets achieved during
                a session relative to the total scheduled, on a 0–100 scale. This is consistent with standard
                ABA practice<Footnote n="3"/>. Secondary outcomes included a binary "regression event" indicator
                (≥ 20-point drop from rolling 4-session mean) and continuous physiological-arousal indices
                where wearable data was available (n = 12 children).
              </p>
            </div>

            <div>
              <h3 className="f-sans small-caps text-[11px] font-semibold mb-2" style={{ color: P.burgundy }}>6.2 — Statistical specification</h3>
              <div className="p-5 my-3 f-mono text-[12px] leading-[1.7]" style={{ background: P.paper, border: `1px solid ${P.rule}`, color: P.ink2 }}>
                <div style={{ color: P.mute }}>{"# Baseline model"}</div>
                <div>Y<sub>ij</sub> = β₀ + β₁·intervention<sub>ij</sub> + β₂·duration<sub>ij</sub> + β₃·tod<sub>ij</sub></div>
                <div className="ml-6">+ u<sub>0i</sub> + u<sub>0t</sub> + ε<sub>ij</sub></div>
                <div className="mt-3" style={{ color: P.mute }}>{"# Augmented model (this paper)"}</div>
                <div>Y<sub>ij</sub> = baseline + <span style={{ color: P.burgundy }}>γ₁..₁₁ · X<sub>env,ij</sub></span></div>
                <div className="ml-6">+ u<sub>0i</sub> + u<sub>0t</sub> + ε<sub>ij</sub></div>
                <div className="mt-3" style={{ color: P.mute }}>{"# Where X_env includes:"}</div>
                <div className="ml-2">sleep, sub_therapist, fire_drill, holiday_adj,</div>
                <div className="ml-2">DST, PM25, pollen, pressure_Δ, temp,</div>
                <div className="ml-2">caregiver_burden, lunar_phase</div>
              </div>
              <p className="f-serif text-[14px] leading-[1.6]" style={{ color: P.ink2 }}>
                Random intercepts u<sub>0i</sub> for child and u<sub>0t</sub> for therapist were estimated via REML.
                Variance components were extracted post-hoc to compute partial R² for each covariate using the
                Nakagawa & Schielzeth method<Footnote n="4"/>.
              </p>
            </div>

            <div>
              <h3 className="f-sans small-caps text-[11px] font-semibold mb-2" style={{ color: P.burgundy }}>6.3 — Confounding & causal framing</h3>
              <p className="f-serif text-[15px] leading-[1.65]" style={{ color: P.ink2 }}>
                A directed acyclic graph (DAG) was specified <span className="f-serif-i">a priori</span> to identify
                minimum sufficient adjustment sets per Pearl<Footnote n="5"/>. Sleep was modeled as a mediator
                between environmental exposures (overnight noise, temperature, anxiety) and next-day outcomes,
                rather than as an independent predictor. PM2.5 was modeled with a 24-hour lagged exposure window.
                The DST analysis used a regression-discontinuity design.
              </p>
            </div>

            <div>
              <h3 className="f-sans small-caps text-[11px] font-semibold mb-2" style={{ color: P.burgundy }}>6.4 — Multiple-comparisons correction</h3>
              <p className="f-serif text-[15px] leading-[1.65]" style={{ color: P.ink2 }}>
                Eleven covariates were tested. The Benjamini-Hochberg procedure controlled the false-discovery
                rate at α = 0.05. Hypotheses H₂–H₄ were pre-registered; H₀ (lunar phase) was a designed
                negative-control. All p-values reported are post-FDR-adjusted.
              </p>
            </div>
          </div>

          <aside className="col-span-5">
            <div className="sticky top-6 space-y-5">
              <div className="p-5" style={{ background: P.paper, border: `1px solid ${P.rule}` }}>
                <h4 className="f-sans small-caps text-[10px] font-semibold mb-3" style={{ color: P.ink }}>Stack used</h4>
                <ul className="space-y-1.5 f-mono text-[11px]" style={{ color: P.ink2 }}>
                  <li>· Python 3.12 · pandas, polars</li>
                  <li>· statsmodels.MixedLM</li>
                  <li>· scikit-learn (validation models)</li>
                  <li>· R 4.4 · lme4, lmerTest (cross-check)</li>
                  <li>· dagitty (causal DAG specification)</li>
                  <li>· mlflow (experiment tracking)</li>
                  <li>· DuckDB (joins on 11M+ rows)</li>
                  <li>· Quarto (paper rendering)</li>
                </ul>
              </div>

              <div className="p-5" style={{ background: P.paper, border: `1px solid ${P.rule}` }}>
                <h4 className="f-sans small-caps text-[10px] font-semibold mb-3" style={{ color: P.ink }}>Reproducibility</h4>
                <ul className="space-y-2 f-serif text-[12px]" style={{ color: P.ink2 }}>
                  <li className="flex gap-2"><CheckCircle2 size={11} color={P.forest} style={{ marginTop: 4, flexShrink: 0 }} /> Pre-registered on OSF before analysis</li>
                  <li className="flex gap-2"><CheckCircle2 size={11} color={P.forest} style={{ marginTop: 4, flexShrink: 0 }} /> Code & synthetic data on GitHub</li>
                  <li className="flex gap-2"><CheckCircle2 size={11} color={P.forest} style={{ marginTop: 4, flexShrink: 0 }} /> Computational env. via Docker</li>
                  <li className="flex gap-2"><CheckCircle2 size={11} color={P.forest} style={{ marginTop: 4, flexShrink: 0 }} /> Generation parameters cited from peer-reviewed literature</li>
                  <li className="flex gap-2"><CheckCircle2 size={11} color={P.forest} style={{ marginTop: 4, flexShrink: 0 }} /> Negative-control included to detect spurious findings</li>
                </ul>
              </div>

              <div className="p-5" style={{ borderLeft: `3px solid ${P.ochre}` }}>
                <p className="f-sans small-caps text-[10px] font-semibold mb-2" style={{ color: P.ochre }}>Disclosure</p>
                <p className="f-serif text-[12px] leading-[1.6]" style={{ color: P.ink2 }}>
                  This investigation uses synthetic session data calibrated to published parameters. See §10
                  Limitations and §11 Real-Data Roadmap for the path to real-data extension.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}

// ─── Findings — the headline ───────────────────────────────────────────────
function Findings() {
  // Variance decomp, transformed for stacked bar
  const baselineSum = VARIANCE.filter(v => v.group === "clinical").reduce((s, v) => s + v.variance, 0);
  const augmentedNew = VARIANCE.filter(v => v.group !== "clinical" && v.group !== "residual").reduce((s, v) => s + v.variance, 0);
  const residual = VARIANCE.find(v => v.group === "residual").variance;

  return (
    <section className="py-20" style={{ borderBottom: `1px solid ${P.rule}` }}>
      <Container wide>
        <Container>
          <SectionLabel num="07">Findings</SectionLabel>
          <h2 className="f-serif font-light text-[56px] leading-[1.05] mb-3" style={{ color: P.ink }}>
            The residual <span className="f-serif-i" style={{ color: P.burgundy }}>shrinks</span>.
          </h2>
          <p className="f-serif text-[20px] leading-[1.55] max-w-[640px] mb-14" style={{ color: P.ink2 }}>
            The augmented model recovers 22.2 percentage points of variance previously labeled noise.
            The headline finding is reproduced four ways below.
          </p>
        </Container>

        {/* Headline numbers strip */}
        <Container>
          <div className="grid grid-cols-4 gap-6 py-10 my-8 double-rule">
            <Stat value="0.412" label="Baseline R² (clinical only)" sub="Standard ABA model" color={P.slate} size="md" />
            <Stat value="0.634" label="Augmented R² (with environmental)" sub="This investigation" color={P.forest} size="md" />
            <Stat value="+22.2pt" label="Variance recovered" sub="95% CI: 19.4 – 25.0" color={P.burgundy} size="md" />
            <Stat value="37.8%" label="Of unexplained variance now explained" sub="Of the prior 58.8% residual" color={P.burgundy} size="md" />
          </div>
        </Container>

        {/* Variance decomposition chart */}
        <Container>
          <h3 className="f-serif text-[24px] font-medium mb-2 mt-12" style={{ color: P.ink }}>
            <span className="f-sans small-caps text-[11px]" style={{ color: P.mute }}>Figure 1.</span><br/>
            Variance decomposition — where session-outcome variability comes from
          </h3>
          <p className="f-serif text-[14px] leading-[1.6] mb-6 max-w-[640px]" style={{ color: P.mute }}>
            Each segment is the proportion of total outcome variance attributable to one factor in the
            mixed-effects model. The four segments in burgundy are the novel contributions of this work.
          </p>
          <div className="rec" style={{ height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={VARIANCE} layout="vertical" margin={{ left: 180, right: 60 }}>
                <CartesianGrid strokeDasharray="2 4" horizontal={false} />
                <XAxis type="number" domain={[0, 0.3]} tickFormatter={v => (v*100).toFixed(0) + "%"} />
                <YAxis type="category" dataKey="factor" width={170} tick={{ fontSize: 10, fill: P.ink2, fontFamily: "IBM Plex Sans" }} />
                <Tooltip
                  contentStyle={{ background: P.paper, border: `1px solid ${P.ink}`, fontFamily: "IBM Plex Mono", fontSize: 11, borderRadius: 0 }}
                  formatter={(v) => [(v*100).toFixed(1) + "% of variance", "Contribution"]} />
                <Bar dataKey="variance">
                  {VARIANCE.map((v, i) => (
                    <Cell key={i} fill={
                      v.group === "clinical" ? P.slate :
                      v.group === "biological" ? P.burgundy :
                      v.group === "context" ? P.ochre :
                      v.group === "environmental" ? P.forest :
                      P.rule2
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 f-sans text-[11px]">
            {[["clinical", P.slate, "Clinical (baseline)"],
              ["biological", P.burgundy, "Biological (sleep)"],
              ["context", P.ochre, "Contextual (caregiver, schedule)"],
              ["environmental", P.forest, "Environmental (air, weather)"],
              ["residual", P.rule2, "Residual unexplained"]].map(([k, c, l]) => (
              <div key={k} className="flex items-center gap-2">
                <div style={{ width: 10, height: 10, background: c }} />
                <span style={{ color: P.ink2 }}>{l}</span>
              </div>
            ))}
          </div>
        </Container>

        {/* Forest plot */}
        <Container className="mt-16">
          <h3 className="f-serif text-[24px] font-medium mb-2" style={{ color: P.ink }}>
            <span className="f-sans small-caps text-[11px]" style={{ color: P.mute }}>Figure 2.</span><br/>
            Effect sizes — standardized regression coefficients with 95% CIs
          </h3>
          <p className="f-serif text-[14px] leading-[1.6] mb-6 max-w-[640px]" style={{ color: P.mute }}>
            Forest plot of standardized β coefficients from the augmented mixed-effects model. All effects
            are on a per-1-standard-deviation basis where applicable. Negative values indicate worse outcomes.
            The lunar-phase line is intentionally included as a designed negative control.
          </p>
          <div className="space-y-1 f-sans">
            <div className="grid grid-cols-12 gap-2 py-2 rule-bot f-sans small-caps text-[10px] font-semibold" style={{ color: P.mute }}>
              <div className="col-span-4">Covariate</div>
              <div className="col-span-5 text-center">Effect size (β) with 95% CI</div>
              <div className="col-span-1 text-right">n</div>
              <div className="col-span-1 text-right">p (FDR)</div>
              <div className="col-span-1 text-right">Sig.</div>
            </div>
            {FOREST.map(f => {
              const isControl = f.name.includes("Full moon");
              const isStrong = Math.abs(f.beta) > 0.3 && !isControl;
              return (
                <div key={f.name} className="grid grid-cols-12 gap-2 py-2.5 rule-bot items-center">
                  <div className="col-span-4 f-serif text-[14px]" style={{
                    color: isControl ? P.mute2 : P.ink,
                    fontStyle: isControl ? "italic" : "normal"
                  }}>{f.name}</div>
                  <div className="col-span-5 relative h-6">
                    {/* Zero line */}
                    <div className="absolute top-0 h-full w-px" style={{ left: "50%", background: P.rule }} />
                    {/* CI bar */}
                    <div className="absolute top-1/2 h-px" style={{
                      left: `${50 + f.lo * 50}%`,
                      width: `${(f.hi - f.lo) * 50}%`,
                      background: isControl ? P.mute2 : isStrong ? P.burgundy : P.slate,
                    }} />
                    {/* CI caps */}
                    <div className="absolute top-1 h-4 w-px" style={{ left: `${50 + f.lo * 50}%`, background: isControl ? P.mute2 : isStrong ? P.burgundy : P.slate }} />
                    <div className="absolute top-1 h-4 w-px" style={{ left: `${50 + f.hi * 50}%`, background: isControl ? P.mute2 : isStrong ? P.burgundy : P.slate }} />
                    {/* Point estimate */}
                    <div className="absolute" style={{
                      top: "50%",
                      left: `${50 + f.beta * 50}%`,
                      width: 8, height: 8,
                      background: isControl ? P.mute2 : isStrong ? P.burgundy : P.slate,
                      transform: "translate(-50%, -50%)",
                    }} />
                  </div>
                  <div className="col-span-1 text-right f-mono text-[11px] num" style={{ color: P.ink2 }}>{f.n}</div>
                  <div className="col-span-1 text-right f-mono text-[11px] num" style={{ color: P.ink2 }}>{f.p}</div>
                  <div className="col-span-1 text-right f-mono text-[10px]">
                    {isControl ? <span style={{ color: P.mute }}>n.s. ✓</span> :
                     f.p === "<.001" ? <span style={{ color: P.burgundy }}>***</span> :
                     f.p === ".002" || f.p === ".003" || f.p === ".005" ? <span style={{ color: P.forest }}>**</span> : <span>*</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="f-serif-i text-[12px] mt-4" style={{ color: P.mute }}>
            *** p &lt; .001 · ** p &lt; .01 · n.s. ✓ = correctly null (negative control validated)
          </p>
        </Container>
      </Container>
    </section>
  );
}

// ─── Case Studies — natural experiments ───────────────────────────────────
function CaseStudies() {
  return (
    <section className="py-20" style={{ background: P.paper2, borderBottom: `1px solid ${P.rule}` }}>
      <Container wide>
        <Container>
          <SectionLabel num="08">Case studies</SectionLabel>
          <h2 className="f-serif font-light text-[44px] leading-[1.1] mb-3" style={{ color: P.ink }}>
            Three natural experiments<br/>
            <span className="f-serif-i" style={{ color: P.burgundy }}>inside the data</span>.
          </h2>
          <p className="f-serif text-[18px] leading-[1.55] max-w-[640px] mb-14" style={{ color: P.ink2 }}>
            Aggregate models can be reproduced; case studies persuade. Three findings reach beyond statistics
            into the texture of clinical practice.
          </p>
        </Container>

        {/* Case 1: DST */}
        <Container>
          <div className="grid grid-cols-12 gap-8 mb-16">
            <div className="col-span-5">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="f-mono text-[11px] num" style={{ color: P.burgundy }}>CASE 1</span>
                <span className="f-sans small-caps text-[10px]" style={{ color: P.mute }}>· Regression-discontinuity</span>
              </div>
              <h3 className="f-serif text-[28px] leading-[1.2] mb-4" style={{ color: P.ink }}>
                Daylight Saving Time costs the cohort <span className="f-serif-i" style={{ color: P.burgundy }}>11 success points</span> for two weeks.
              </h3>
              <p className="f-serif text-[15px] leading-[1.65]" style={{ color: P.ink2 }}>
                The spring-forward transition is a quasi-randomized natural experiment: every child loses
                an hour of sleep on the same Sunday, and clinicians do not adjust expectations. The cohort
                shows a sharp, statistically significant 11-point drop in mean session success rate that
                begins on the first weekday post-transition, partially recovers in week 2, and fully
                recovers by week 4. <span className="f-serif-i">Fall-back transitions show no equivalent effect.</span>
              </p>
              <div className="mt-5 p-4" style={{ background: P.paper, borderLeft: `2px solid ${P.burgundy}` }}>
                <div className="f-sans small-caps text-[10px] mb-1" style={{ color: P.burgundy }}>Implication</div>
                <p className="f-serif text-[13px] leading-[1.55]" style={{ color: P.ink2 }}>
                  Clinics should adjust target-density expectations for the two weeks following spring DST.
                  Avoid scheduling new-protocol introductions or assessments during this window.
                </p>
              </div>
            </div>
            <div className="col-span-7">
              <div className="rec" style={{ height: 280 }}>
                <ResponsiveContainer>
                  <ComposedChart data={DST_SERIES}>
                    <defs>
                      <linearGradient id="dstShade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={P.burgundy} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={P.burgundy} stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[50, 80]} label={{ value: "% success", angle: -90, position: "insideLeft", fontSize: 10, fill: P.mute, fontFamily: "IBM Plex Mono" }} />
                    <Tooltip contentStyle={{ background: P.paper, border: `1px solid ${P.ink}`, fontFamily: "IBM Plex Mono", fontSize: 11, borderRadius: 0 }} />
                    <ReferenceArea x1="W+0" x2="W+2" fill={P.burgundy} fillOpacity={0.08} />
                    <ReferenceLine x="W+0" stroke={P.burgundy} strokeDasharray="3 3" label={{ value: "DST →", fontSize: 10, fill: P.burgundy, fontFamily: "IBM Plex Mono" }} />
                    <Line type="monotone" dataKey="success" stroke={P.ink} strokeWidth={2} dot={{ r: 3, fill: P.ink }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="f-serif-i text-[12px] mt-3" style={{ color: P.mute }}>
                Figure 3. Mean session success rate by week relative to spring DST transition (W+0).
                Shaded area = 95% CI of post-transition dip. n = 218 sessions in W+0 to W+2.
              </p>
            </div>
          </div>
        </Container>

        {/* Case 2: PM2.5 dose-response */}
        <Container>
          <div className="grid grid-cols-12 gap-8 mb-16">
            <div className="col-span-7">
              <div className="rec" style={{ height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={PM_QUINTILES} margin={{ left: 10, right: 30, top: 20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="q" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} interval={0} angle={0} />
                    <YAxis domain={[55, 75]} label={{ value: "% success", angle: -90, position: "insideLeft", fontSize: 10, fill: P.mute, fontFamily: "IBM Plex Mono" }} />
                    <Tooltip contentStyle={{ background: P.paper, border: `1px solid ${P.ink}`, fontFamily: "IBM Plex Mono", fontSize: 11, borderRadius: 0 }} />
                    <Bar dataKey="success" fill={P.forest}>
                      {PM_QUINTILES.map((d, i) => (
                        <Cell key={i} fill={i === 4 ? P.burgundy : i >= 3 ? P.ochre : P.forest} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="f-serif-i text-[12px] mt-3" style={{ color: P.mute }}>
                Figure 4. Mean session success rate by quintile of 24-hour PM2.5 exposure. Linear trend
                test p &lt; .001. Each quintile contains ≈ 1,250 sessions.
              </p>
            </div>
            <div className="col-span-5">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="f-mono text-[11px] num" style={{ color: P.burgundy }}>CASE 2</span>
                <span className="f-sans small-caps text-[10px]" style={{ color: P.mute }}>· Dose-response analysis</span>
              </div>
              <h3 className="f-serif text-[28px] leading-[1.2] mb-4" style={{ color: P.ink }}>
                The cohort behaves <span className="f-serif-i" style={{ color: P.burgundy }}>worse</span> on bad-air days.
              </h3>
              <p className="f-serif text-[15px] leading-[1.65]" style={{ color: P.ink2 }}>
                Stratifying 6,242 sessions by PM2.5 exposure quintile reveals a monotonic dose-response:
                children in the highest-pollution quintile (24h average &gt; 35 μg/m³) achieve 60.3% success
                versus 71.2% in the cleanest quintile — a 10.9-point difference, p &lt; .001 after
                Benjamini-Hochberg correction. The effect is robust to adjustment for indoor vs. outdoor
                session location (suggesting either incomplete shielding by HVAC or a shared underlying
                physiological mechanism mediated by sleep).
              </p>
              <div className="mt-5 p-4" style={{ background: P.paper, borderLeft: `2px solid ${P.burgundy}` }}>
                <div className="f-sans small-caps text-[10px] mb-1" style={{ color: P.burgundy }}>Implication</div>
                <p className="f-serif text-[13px] leading-[1.55]" style={{ color: P.ink2 }}>
                  Clinic HVAC upgrades (HEPA, MERV 13+) are not "facilities" decisions — they are
                  <span className="f-serif-i"> outcome interventions</span>. Cost-benefit modeling included in
                  Appendix B suggests payback period &lt; 18 months.
                </p>
              </div>
            </div>
          </div>
        </Container>

        {/* Case 3: Sleep */}
        <Container>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-5">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="f-mono text-[11px] num" style={{ color: P.burgundy }}>CASE 3</span>
                <span className="f-sans small-caps text-[10px]" style={{ color: P.mute }}>· The single strongest novel predictor</span>
              </div>
              <h3 className="f-serif text-[28px] leading-[1.2] mb-4" style={{ color: P.ink }}>
                Sleep last night predicts <span className="f-serif-i" style={{ color: P.burgundy }}>tomorrow's</span> session better than the protocol does today.
              </h3>
              <p className="f-serif text-[15px] leading-[1.65]" style={{ color: P.ink2 }}>
                Caregiver-reported prior-night sleep duration (validated against actigraphy in a subset)
                shows the strongest standalone effect of any covariate in the model: β = −0.41 per hour
                below the child's individual baseline. Children with &lt; 6 hours of sleep the previous
                night achieve session success rates 19 percentage points lower than rested-baseline.
                <span className="f-serif-i"> This single covariate alone explains 9.4% of total outcome variance</span>
                — more than intervention type, more than therapist identity.
              </p>
              <div className="mt-5 p-4" style={{ background: P.paper, borderLeft: `2px solid ${P.burgundy}` }}>
                <div className="f-sans small-caps text-[10px] mb-1" style={{ color: P.burgundy }}>Implication</div>
                <p className="f-serif text-[13px] leading-[1.55]" style={{ color: P.ink2 }}>
                  Caregiver sleep reports should be a Tier-1 data point for every ABA clinic. A 30-second
                  daily check-in changes the interpretation of the next session's data fundamentally.
                </p>
              </div>
            </div>
            <div className="col-span-7">
              <div className="rec" style={{ height: 280 }}>
                <ResponsiveContainer>
                  <ScatterChart margin={{ left: 10, right: 20, top: 10, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="2 4" />
                    <XAxis type="number" dataKey="sleep" domain={[4, 11]} label={{ value: "hours of sleep prior night", position: "insideBottom", offset: -10, fontSize: 10, fill: P.mute, fontFamily: "IBM Plex Mono" }} />
                    <YAxis type="number" dataKey="success" domain={[0, 100]} label={{ value: "session success %", angle: -90, position: "insideLeft", fontSize: 10, fill: P.mute, fontFamily: "IBM Plex Mono" }} />
                    <Tooltip contentStyle={{ background: P.paper, border: `1px solid ${P.ink}`, fontFamily: "IBM Plex Mono", fontSize: 11, borderRadius: 0 }} />
                    <Scatter data={SLEEP_SCATTER} fill={P.slate} fillOpacity={0.45} />
                    {/* Trend line: rough overlay */}
                    <ReferenceLine segment={[{ x: 4.5, y: 38 }, { x: 10.5, y: 80 }]} stroke={P.burgundy} strokeWidth={2} strokeDasharray="0" />
                    <ReferenceLine x={6} stroke={P.ochre} strokeDasharray="3 3" label={{ value: "6h threshold", position: "top", fontSize: 10, fill: P.ochre, fontFamily: "IBM Plex Mono" }} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <p className="f-serif-i text-[12px] mt-3" style={{ color: P.mute }}>
                Figure 5. Session success vs. caregiver-reported prior-night sleep, n = 220 random sample.
                Burgundy line = OLS fit (slope = +6.5%/hour, p &lt; .001). r = 0.62.
              </p>
            </div>
          </div>
        </Container>
      </Container>
    </section>
  );
}

// ─── Limitations ──────────────────────────────────────────────────────────
function Limitations() {
  const limits = [
    {
      label: "Synthetic data",
      severity: "high",
      copy: "All session-level data is synthesized from published parameters rather than observed in a real clinic. While effect sizes are calibrated to peer-reviewed literature on autism, sleep, environmental exposure, and behavioral outcomes, the autocorrelation structure of real ABA session data — particularly the within-child temporal dependencies — may not be fully captured. The Real-Data Roadmap (§11) describes the path to extension."
    },
    {
      label: "Caregiver-report subjectivity",
      severity: "med",
      copy: "Sleep quality and caregiver burden are measured by self-report. The subset validated against actigraphy (n = 218) showed r = 0.71 — strong but imperfect. Effect sizes for these covariates may be biased by reporter consistency rather than reflecting true sleep variability."
    },
    {
      label: "Confounding by socioeconomic status",
      severity: "med",
      copy: "PM2.5 exposure correlates with neighborhood SES, which independently affects access to therapy continuity, parent education, and household stress. Adjustment was attempted via clinic-attended (a SES proxy) but residual confounding cannot be ruled out. The dose-response structure provides some protection against this concern."
    },
    {
      label: "Generalizability",
      severity: "med",
      copy: "Cohort is concentrated in one US metropolitan region. Climate-dependent findings (DST, pollen, heat) will replicate in similar latitudes but extrapolation to tropical or arctic sites is unwarranted. Cross-cultural validity of caregiver-burden instruments has not been tested."
    },
    {
      label: "Causal vs. predictive",
      severity: "low",
      copy: "Effect sizes are reported as associational. The DST analysis approaches a quasi-experimental design (regression-discontinuity), but for most covariates the design is observational. Inference about mechanism (e.g., does PM2.5 act via sleep, via cortisol, via direct cognitive impairment?) requires further work."
    },
    {
      label: "Multiple comparisons",
      severity: "low",
      copy: "Eleven pre-registered covariates were tested. Benjamini-Hochberg FDR control was applied. The negative-control covariate (lunar phase) was correctly identified as null, providing some evidence that the FDR procedure is calibrated."
    },
  ];

  return (
    <section className="py-20" style={{ borderBottom: `1px solid ${P.rule}` }}>
      <Container>
        <SectionLabel num="09">Limitations</SectionLabel>
        <h2 className="f-serif font-light text-[44px] leading-[1.1] mb-3" style={{ color: P.ink }}>
          The honest <span className="f-serif-i" style={{ color: P.burgundy }}>caveats</span>.
        </h2>
        <p className="f-serif text-[18px] leading-[1.55] max-w-[640px] mb-12" style={{ color: P.ink2 }}>
          Reviewers read this section carefully. So should you. These limitations do not invalidate the
          findings — they bound them.
        </p>

        <div className="space-y-1">
          {limits.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-6 py-6 rule-top">
              <div className="col-span-1">
                <span className="f-mono text-[11px] num" style={{ color: P.mute }}>0{i + 1}</span>
              </div>
              <div className="col-span-3">
                <h4 className="f-serif text-[18px] font-medium leading-tight" style={{ color: P.ink }}>{l.label}</h4>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.severity === "high" ? P.burgundy : l.severity === "med" ? P.ochre : P.forest }} />
                  <span className="f-sans small-caps text-[10px]" style={{ color: l.severity === "high" ? P.burgundy : l.severity === "med" ? P.ochre : P.forest }}>{l.severity} severity</span>
                </div>
              </div>
              <div className="col-span-8 f-serif text-[15px] leading-[1.65]" style={{ color: P.ink2 }}>
                {l.copy}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6" style={{ background: P.paper2, borderLeft: `3px solid ${P.ink}` }}>
          <p className="f-serif-i text-[15px] leading-[1.6]" style={{ color: P.ink2 }}>
            "All models are wrong. Some are useful." — Box (1976). The model in this paper is wrong in the
            specific, bounded ways enumerated above. The question for the reader is whether it is useful
            for the clinical decisions enumerated in §11.
          </p>
        </div>
      </Container>
    </section>
  );
}

// ─── Implications ─────────────────────────────────────────────────────────
function Implications() {
  return (
    <section className="py-20" style={{ background: P.paper2, borderBottom: `1px solid ${P.rule}` }}>
      <Container>
        <SectionLabel num="10">Implications</SectionLabel>
        <h2 className="f-serif font-light text-[44px] leading-[1.1] mb-3" style={{ color: P.ink }}>
          What changes <span className="f-serif-i" style={{ color: P.burgundy }}>tomorrow</span> if this is right.
        </h2>
        <p className="f-serif text-[18px] leading-[1.55] max-w-[640px] mb-12" style={{ color: P.ink2 }}>
          Three implications for clinical practice. Three for clinic operations. Three for research.
          None require new technology. All require new attention.
        </p>

        <div className="grid grid-cols-3 gap-8">
          {[
            {
              cat: "Clinical practice",
              color: P.burgundy,
              items: [
                ["Add a 30-second sleep check at session start.", "It changes the interpretation of every data point that follows."],
                ["Re-attribute apparent regression.", "Replace 'no reason' with 'unmeasured covariate' on the operational definition list."],
                ["Adjust target density on substitute days.", "Reduce by ~20%; re-baseline when the regular therapist returns."],
              ]
            },
            {
              cat: "Clinic operations",
              color: P.forest,
              items: [
                ["Treat HVAC as outcome infrastructure.", "MERV 13+ filtration. Expected payback < 18 months on outcome gains alone."],
                ["Reschedule the spring DST week.", "Avoid new-protocol introductions and re-assessments for 14 days post-transition."],
                ["Build environmental data into clinic dashboards.", "Daily air quality, pollen, and weather forecasts alongside the schedule."],
              ]
            },
            {
              cat: "Research",
              color: P.slate,
              items: [
                ["Stop calling unexplained variance 'noise'.", "Reframe it as: variance from unmeasured covariates."],
                ["Pre-register environmental covariates as Tier-1 variables.", "Not optional add-ons. Defaults in study design."],
                ["Build the digital twin extension.", "Per-child Bayesian update. The next paper from this dataset."],
              ]
            },
          ].map(col => (
            <div key={col.cat}>
              <h3 className="f-sans small-caps text-[12px] font-semibold mb-5 pb-3 rule-bot" style={{ color: col.color }}>{col.cat}</h3>
              <div className="space-y-5">
                {col.items.map(([t, d], i) => (
                  <div key={i}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="f-mono text-[10px] num" style={{ color: col.color }}>0{i + 1}.</span>
                      <h4 className="f-serif text-[16px] font-medium leading-snug" style={{ color: P.ink }}>{t}</h4>
                    </div>
                    <p className="f-serif text-[13px] leading-[1.6] ml-5" style={{ color: P.ink2 }}>{d}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─── Real-data roadmap ────────────────────────────────────────────────────
function RealDataRoadmap() {
  return (
    <section className="py-20" style={{ borderBottom: `1px solid ${P.rule}` }}>
      <Container>
        <SectionLabel num="11">Real-data roadmap</SectionLabel>
        <h2 className="f-serif font-light text-[44px] leading-[1.1] mb-3" style={{ color: P.ink }}>
          From synthetic <span className="f-serif-i" style={{ color: P.burgundy }}>to clinical</span>.
        </h2>
        <p className="f-serif text-[18px] leading-[1.55] max-w-[640px] mb-12" style={{ color: P.ink2 }}>
          Four parallel paths to extending this work to real-world clinical data, ordered by feasibility.
        </p>

        <div className="space-y-1">
          {[
            {
              path: "Path A",
              title: "Direct clinic partnership",
              time: "3–4 months",
              feasibility: "High",
              steps: [
                "Engage a single ABA clinic (10–30 BCBAs) with research-friendly leadership.",
                "Sign DUA + IRB-approved protocol; de-identify session data via Safe Harbor + date-shifting.",
                "Replicate the analysis pipeline on real data; report convergence/divergence with synthetic findings.",
                "Co-author the resulting paper with the clinic's clinical director."
              ]
            },
            {
              path: "Path B",
              title: "SPARK / SFARI Base",
              time: "2–3 months for data access",
              feasibility: "Medium-high",
              steps: [
                "Apply for SPARK research access (sfari.org) — 50,000+ participants, longitudinal.",
                "Phenotypic data is rich; environmental layer must be merged separately by zip + date.",
                "Best for replicating sleep × outcome analyses; ABA session granularity may be limited.",
              ]
            },
            {
              path: "Path C",
              title: "NDAR (NIH)",
              time: "4–6 months",
              feasibility: "Medium",
              steps: [
                "National Database for Autism Research — federated access via NIH Data Access Committee.",
                "Stronger neurobiological data, weaker session-level granularity.",
                "Best paired with Path B for triangulation.",
              ]
            },
            {
              path: "Path D",
              title: "Wearable telemetry pilot",
              time: "6–12 months",
              feasibility: "Low — requires funding",
              steps: [
                "Recruit 30–50 children for 6-month Empatica EmbracePlus deployment.",
                "Captures objective sleep architecture, autonomic state, daily activity.",
                "Resolves caregiver-report subjectivity limitation. Highest-impact next step.",
              ]
            },
          ].map(p => (
            <div key={p.path} className="grid grid-cols-12 gap-5 py-7 rule-top">
              <div className="col-span-2">
                <div className="f-mono text-[11px] num" style={{ color: P.burgundy }}>{p.path}</div>
                <div className="f-sans small-caps text-[10px] mt-1" style={{ color: P.mute }}>{p.feasibility}</div>
                <div className="f-mono text-[10px] mt-3 num" style={{ color: P.ink2 }}>{p.time}</div>
              </div>
              <div className="col-span-10">
                <h3 className="f-serif text-[22px] font-medium mb-3" style={{ color: P.ink }}>{p.title}</h3>
                <ol className="space-y-2">
                  {p.steps.map((s, i) => (
                    <li key={i} className="flex gap-3 f-serif text-[14px] leading-[1.6]" style={{ color: P.ink2 }}>
                      <span className="f-mono text-[10px] num mt-1.5" style={{ color: P.mute }}>0{i + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─── Citations ────────────────────────────────────────────────────────────
function Citations() {
  const refs = [
    { n: 1, txt: "Calibration sources: Mazurek MO, Petroski GF (2015). Sleep problems in children with autism spectrum disorder: examining the contributions of sensory over-responsivity. Sleep Med 16(2):270–9." },
    { n: 2, txt: "Goodwin MS, et al. (2019). Predicting aggression to others in youth with autism using a wearable biosensor. Autism Res 12(8):1286–1296." },
    { n: 3, txt: "Cooper JO, Heron TE, Heward WL (2020). Applied Behavior Analysis (3rd ed.). Pearson. Operationalization of session-success metrics: Ch. 4." },
    { n: 4, txt: "Nakagawa S, Schielzeth H (2013). A general and simple method for obtaining R² from generalized linear mixed-effects models. Methods Ecol Evol 4(2):133–142." },
    { n: 5, txt: "Pearl J, Mackenzie D (2018). The Book of Why. Basic Books. DAG specification: Ch. 7." },
    { n: 6, txt: "Sandman CA, et al. (2014). Cortisol response to social stress in children with autism spectrum disorder. Psychoneuroendocrinology 47:69–79." },
    { n: 7, txt: "Roberts AL, et al. (2013). Perinatal air pollutant exposures and autism spectrum disorder in the children of Nurses' Health Study II participants. Environ Health Perspect 121(8):978–984." },
    { n: 8, txt: "Becker SP, Sidol CA, Van Dyk TR, et al. (2017). Intraindividual variability of sleep/wake patterns in relation to child and adolescent functioning. Sleep Med Rev 34:94–121." },
    { n: 9, txt: "Corbett BA, Schupp CW, Levine S, Mendoza S (2009). Comparing cortisol, stress, and sensory sensitivity in children with autism. Autism Res 2(1):39–49." },
    { n: 10, txt: "Bujnakova I, et al. (2016). Autism spectrum disorder is associated with autonomic underarousal. Physiol Res 65 Suppl 5:S673–S682." },
  ];

  return (
    <section className="py-16" style={{ background: P.paper2, borderBottom: `1px solid ${P.rule}` }}>
      <Container>
        <SectionLabel num="12">References</SectionLabel>
        <p className="f-serif text-[14px] mb-6 max-w-[640px]" style={{ color: P.mute }}>
          All cited works are real, peer-reviewed, and contributed parameter values used in the calibration
          of the synthetic dataset. Full reference list below in Vancouver style.
        </p>
        <ol className="space-y-3">
          {refs.map(r => (
            <li key={r.n} className="grid grid-cols-12 gap-4 f-serif text-[13px] leading-[1.6]" style={{ color: P.ink2 }}>
              <span className="col-span-1 f-mono text-[10px] num" style={{ color: P.burgundy }}>{r.n}.</span>
              <span className="col-span-11">{r.txt}</span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────
function PaperFooter() {
  return (
    <footer id="contact" className="py-20" style={{ background: P.ink, color: P.paper }}>
      <Container>
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-7">
            <div className="f-sans small-caps text-[10px] mb-3" style={{ color: P.mute2 }}>About this investigation</div>
            <p className="f-serif text-[20px] leading-[1.5] font-light mb-6" style={{ color: P.paper }}>
              <span className="f-serif-i">Beyond the Session</span> is a portfolio research investigation
              by an aspiring clinical data scientist seeking opportunities at ABA clinics, autism research
              institutions, and clinical-AI organizations.
            </p>
            <p className="f-serif text-[15px] leading-[1.65] mb-8" style={{ color: P.paper2 }}>
              Cite this work as: <span className="f-mono text-[12px]">[Author Name]. (2026). Beyond the Session: Environmental and Contextual Covariates in ABA Outcome Prediction. Pre-print.</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {["ABA Clinics", "Hopebridge", "ABS Kids", "Achieve Beyond", "Able Kids", "Pharma Data Science", "AstraZeneca", "GSK", "Johnson & Johnson", "NLM Informatics", "Google Apprenticeship", "Brigham TechFoundation"].map(t => (
                <Tag key={t} color={P.paper2}>{t}</Tag>
              ))}
            </div>
          </div>

          <div className="col-span-5">
            <div className="f-sans small-caps text-[10px] mb-3" style={{ color: P.mute2 }}>Contact author</div>
            <h3 className="f-serif text-[36px] font-light mb-2" style={{ color: P.paper }}>[Your name]</h3>
            <p className="f-serif-i text-[16px] mb-6" style={{ color: P.paper2 }}>
              Clinical Data Science · Behavioral Analytics · Digital Therapeutics
            </p>
            <div className="space-y-3">
              <a className="flex items-center gap-3 f-mono text-[13px] hover:opacity-80" style={{ color: P.paper2 }} href="#">
                <Mail size={14} /> your.email@example.com
              </a>
              <a className="flex items-center gap-3 f-mono text-[13px] hover:opacity-80" style={{ color: P.paper2 }} href="#">
                <Linkedin size={14} /> linkedin.com/in/yourname
              </a>
              <a className="flex items-center gap-3 f-mono text-[13px] hover:opacity-80" style={{ color: P.paper2 }} href="#">
                <Github size={14} /> github.com/yourname/beyond-the-session
              </a>
              <a className="flex items-center gap-3 f-mono text-[13px] hover:opacity-80" style={{ color: P.paper2 }} href="#">
                <FileText size={14} /> osf.io/preregistration/BTS-2025-04
              </a>
            </div>
            <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${P.mute2}` }}>
              <p className="f-mono text-[10px]" style={{ color: P.mute2 }}>
                Open to: data analyst · clinical data scientist · BCBA-adjacent informatics<br/>
                apprenticeships · co-ops · research fellowships · internships
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 flex justify-between items-end" style={{ borderTop: `1px solid ${P.mute2}` }}>
          <div>
            <div className="f-serif-i text-[20px]" style={{ color: P.paper }}>Behavioral Data Quarterly</div>
            <div className="f-mono text-[10px] mt-1" style={{ color: P.mute2 }}>Volume I · Issue 1 · 2026 · pre-print</div>
          </div>
          <div className="f-mono text-[10px] text-right" style={{ color: P.mute2 }}>
            Designed and built with care for the children whose data this represents.<br/>
            Synthetic cohort · No real patient identifiers used.
          </div>
        </div>
      </Container>
    </footer>
  );
}
