import React, { useState, useMemo, useEffect } from "react";
import {
  Heart, Brain, GraduationCap, MessageCircle, Hand, Activity, Home,
  Upload, FileText, ChevronRight, ChevronLeft, Plus, Check, X, Clock,
  TrendingUp, AlertCircle, ShieldCheck, Sparkles, Calendar, Sun, Moon,
  Coffee, Volume2, Users, Target, BookOpen, Settings, ArrowRight,
  CheckCircle2, AlertTriangle, Info, Zap, RefreshCcw, Download,
  Lightbulb, GitBranch, Layers, Eye, Smile, Frown, Meh, ThumbsUp,
  ThumbsDown, MapPin, Compass, Wind, Stars
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

/* =========================================================================
   AURA — A Digital Twin Platform for Autism Therapy
   Family-first product. Heptagon data architecture. Either-way safety net.
   ========================================================================= */

// ─── Design tokens ────────────────────────────────────────────────────────
const T = {
  bg:       "#f5f1e8",   // warm cream
  surface:  "#fdfaf3",   // pure cream
  card:     "#ffffff",
  ink:      "#1a2332",   // deep navy
  ink2:     "#2d3a4f",
  mute:     "#7a7468",   // warm grey
  mute2:    "#a8a294",
  line:     "#e6dfd0",
  line2:    "#d5cdba",
  sage:     "#7a9b6e",   // growth, success
  sage2:    "#5e7d54",
  rose:     "#c47b85",   // alert, meltdown
  rose2:    "#a35e6a",
  terra:    "#c97a4a",   // warmth, attention
  terra2:   "#a3603a",
  indigo:   "#3a4f7a",   // trust, data
  indigo2:  "#2a3a5a",
  amber:    "#d4a04a",   // caution
};

// ─── Fonts ────────────────────────────────────────────────────────────────
const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..700;1,6..72,200..700&family=DM+Sans:opsz,wght@9..40,300..700&family=JetBrains+Mono:wght@400;500&display=swap');
    .f-display { font-family: 'Newsreader', 'Times New Roman', serif; font-optical-sizing: auto; letter-spacing: -0.01em; }
    .f-display-i { font-family: 'Newsreader', serif; font-style: italic; font-optical-sizing: auto; }
    .f-body { font-family: 'DM Sans', system-ui, sans-serif; font-optical-sizing: auto; }
    .f-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    .paper {
      background-image:
        radial-gradient(rgba(26,35,50,0.015) 1px, transparent 1px),
        radial-gradient(rgba(26,35,50,0.008) 1px, transparent 1px);
      background-size: 4px 4px, 11px 11px;
    }
    .pulse-ring { animation: pulse-ring 2.4s ease-out infinite; }
    @keyframes pulse-ring {
      0%   { transform: scale(0.95); opacity: 0.7; }
      70%  { transform: scale(1.4); opacity: 0; }
      100% { transform: scale(1.4); opacity: 0; }
    }
    .gentle-fade { animation: gentle-fade 0.5s ease-out; }
    @keyframes gentle-fade {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .breathe { animation: breathe 4s ease-in-out infinite; }
    @keyframes breathe {
      0%, 100% { opacity: 0.55; }
      50%      { opacity: 1; }
    }
    .draw-line { stroke-dasharray: 200; stroke-dashoffset: 200; animation: draw-line 1.5s ease-out forwards; }
    @keyframes draw-line { to { stroke-dashoffset: 0; } }
    .rec .recharts-cartesian-grid line { stroke: ${T.line}; }
    .rec .recharts-text { fill: ${T.mute}; font-family: 'JetBrains Mono', monospace; font-size: 10px; }
    .rec .recharts-tooltip-wrapper { outline: none; }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 16px; height: 16px; border-radius: 50%;
      background: ${T.ink}; cursor: pointer;
      border: 2px solid ${T.surface};
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    input[type="range"] {
      -webkit-appearance: none; appearance: none;
      height: 4px; background: ${T.line}; outline: none; border-radius: 2px;
    }
    .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: ${T.line2}; border-radius: 3px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
  `}</style>
);

// ─── The seven sources of the heptagon ────────────────────────────────────
const SOURCES = [
  { id: "pediatrician", label: "Pediatrician",        short: "Peds",     icon: Heart,         color: T.rose,   angle: -90 },
  { id: "psychologist", label: "Dev. Psychologist",   short: "Dev Psych", icon: Brain,         color: T.indigo, angle: -90 + 51.43 },
  { id: "school",       label: "School / IEP",        short: "School",   icon: GraduationCap, color: T.amber,  angle: -90 + 102.86 },
  { id: "speech",       label: "Speech Therapist",    short: "Speech",   icon: MessageCircle, color: T.terra,  angle: -90 + 154.29 },
  { id: "ot",           label: "Occupational Therapy",short: "OT",       icon: Hand,          color: T.sage,   angle: -90 + 205.71 },
  { id: "aba",          label: "ABA Clinic",          short: "ABA",      icon: Activity,      color: T.indigo2,angle: -90 + 257.14 },
  { id: "parent",       label: "Parents at Home",     short: "Parent",   icon: Home,          color: T.rose2,  angle: -90 + 308.57 },
];

// ─── A sample child to demonstrate the system ────────────────────────────
const CHILD = {
  name: "Aarav",
  age: 8,
  avatar: "🌟",
  diagnosed: "Sept 2023",
  pronouns: "he / him",
  specialInterest: "trains and subway maps",
  comfortFood: "rice with ghee",
  bestTime: "morning, after breakfast",
  hardestTime: "transitions before lunch",
  // Heptagon data state — what's been connected
  sources: {
    pediatrician: { connected: true,  freshness: 0.9, items: ["Growth chart", "Sleep history", "Med list (none)"] },
    psychologist: { connected: true,  freshness: 0.7, items: ["ADOS-2 (Sept '23)", "WISC-V cognitive", "ADI-R parent interview"] },
    school:       { connected: true,  freshness: 0.85, items: ["IEP 2024-25", "BIP", "Quarterly progress"] },
    speech:       { connected: true,  freshness: 0.9, items: ["Quarterly notes", "AAC device data", "Goals tracker"] },
    ot:           { connected: false, freshness: 0,    items: ["(awaiting referral release)"] },
    aba:          { connected: true,  freshness: 0.95, items: ["180 session logs", "Skill acquisition", "Behavior data"] },
    parent:       { connected: true,  freshness: 1.0, items: ["Daily check-ins", "Weekly reflection", "Trigger journal"] },
  },
  // Twin profile derived from data
  profile: {
    sensory: { auditory: 78, visual: 45, tactile: 62, proprio: 55, oral: 70, vestibular: 35 },
    behavior: {
      "Transition tolerance": 30,
      "Social initiation": 55,
      "Verbal communication": 70,
      "Routine attachment": 85,
      "Novelty tolerance": 25,
      "Self-regulation": 40,
    },
    triggers: [
      { name: "Unannounced schedule changes", freq: 12, severity: 0.85 },
      { name: "Cafeteria-level noise (>70 dB)", freq: 8, severity: 0.78 },
      { name: "Wet or unexpected tactile input", freq: 6, severity: 0.65 },
      { name: "New adult in familiar setting", freq: 4, severity: 0.55 },
      { name: "Hunger past 11:30am", freq: 9, severity: 0.50 },
    ],
    strengths: [
      "Exceptional pattern recognition with maps and timetables",
      "Calms reliably with rhythmic music or train videos",
      "Strong receptive language (understands more than he says)",
      "Affectionate with familiar people; offers hugs unprompted",
    ],
  },
  recentSessions: [
    { date: "Mon", type: "ABA",    outcome: "good",    note: "Used train rewards — engaged 38 min" },
    { date: "Tue", type: "Speech", outcome: "good",    note: "AAC: 14 spontaneous requests" },
    { date: "Wed", type: "School", outcome: "rough",   note: "Fire drill — needed 40 min recovery" },
    { date: "Thu", type: "ABA",    outcome: "okay",    note: "New tech — slow start, settled by min 20" },
    { date: "Fri", type: "OT",     outcome: "missed",  note: "Family chose to skip after Wed" },
  ],
};

// ─── Prediction engine (simplified for product demo) ──────────────────────
function predict(child, plan) {
  // Calculate stress load from plan parameters
  const noiseStress = (plan.noise / 100) * (child.profile.sensory.auditory / 100);
  const peerStress = (plan.peers / 5) * (1 - child.profile.behavior["Social initiation"] / 100);
  const novelStress = plan.familiar ? 0 : (1 - child.profile.behavior["Novelty tolerance"] / 100) * 0.7;
  const transitionStress = plan.warning < 5 ? (1 - child.profile.behavior["Transition tolerance"] / 100) * 0.6 : 0;
  const timeStress = plan.timeOfDay === "morning" ? 0 : plan.timeOfDay === "afternoon" ? 0.15 : 0.35;
  const durStress = (plan.duration / 60) * 0.3;
  const interestBoost = plan.usesInterest ? -0.25 : 0;

  const total = noiseStress * 1.3 + peerStress * 0.9 + novelStress + transitionStress +
                timeStress + durStress + interestBoost;

  const successProb = Math.max(0.05, Math.min(0.97, 0.85 - total * 0.5));
  const meltdownRisk = Math.max(0.02, Math.min(0.85, total * 0.45));

  return {
    successProb, meltdownRisk, totalStress: total,
    factors: [
      { name: "Noise level",          value: noiseStress * 1.3, max: 1.3 },
      { name: "Peer count",           value: peerStress * 0.9,  max: 0.9 },
      { name: "Novelty (new people)", value: novelStress,        max: 0.7 },
      { name: "Transition warning",   value: transitionStress,   max: 0.6 },
      { name: "Time of day",          value: timeStress,         max: 0.35 },
      { name: "Special interest used",value: interestBoost,      max: -0.25, positive: true },
    ],
  };
}

// ─── Shared UI primitives ─────────────────────────────────────────────────
const Card = ({ children, className = "", interactive = false, style = {} }) => (
  <div className={`relative ${className}`} style={{
    background: T.card,
    border: `1px solid ${T.line}`,
    borderRadius: 4,
    transition: "all 0.2s",
    ...(interactive && { cursor: "pointer" }),
    ...style,
  }}>
    {children}
  </div>
);

const Pill = ({ children, color = T.ink, bg = "transparent", border = T.line2 }) => (
  <span className="f-mono text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 inline-flex items-center gap-1"
        style={{ color, background: bg, border: `1px solid ${border}`, borderRadius: 999 }}>
    {children}
  </span>
);

const Button = ({ children, onClick, variant = "primary", size = "md", className = "", disabled = false, icon: Icon }) => {
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-sm",
  };
  const variants = {
    primary:   { background: T.ink,    color: T.surface, border: T.ink },
    secondary: { background: "transparent", color: T.ink, border: T.line2 },
    ghost:     { background: "transparent", color: T.ink, border: "transparent" },
    sage:      { background: T.sage,   color: T.surface, border: T.sage },
    rose:      { background: T.rose,   color: T.surface, border: T.rose },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      className={`f-body font-medium transition-all flex items-center gap-2 ${sizes[size]} ${className} ${disabled ? "opacity-40 cursor-not-allowed" : "hover:opacity-90"}`}
      style={{ background: v.background, color: v.color, border: `1px solid ${v.border}`, borderRadius: 3 }}>
      {Icon && <Icon size={size === "sm" ? 13 : 15} />}
      {children}
    </button>
  );
};

const Section = ({ eyebrow, title, subtitle, children, action }) => (
  <section className="mb-8 gentle-fade">
    <div className="flex items-end justify-between mb-4">
      <div>
        {eyebrow && <div className="f-mono text-[10px] uppercase tracking-[0.18em] mb-1.5" style={{ color: T.mute }}>{eyebrow}</div>}
        <h2 className="f-display text-3xl font-medium" style={{ color: T.ink }}>{title}</h2>
        {subtitle && <p className="f-body text-[14px] mt-1.5 max-w-2xl" style={{ color: T.mute }}>{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const Meter = ({ value, max = 100, color = T.ink, height = 4, bg = T.line }) => (
  <div className="w-full" style={{ height, background: bg, borderRadius: height / 2 }}>
    <div className="h-full transition-all duration-700"
      style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: height / 2 }} />
  </div>
);

// ─── The Heptagon — centerpiece visualization ─────────────────────────────
function Heptagon({ child, size = 460, onSourceClick, hoveredSource, setHoveredSource }) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.36;
  const innerR = size * 0.13;

  const points = SOURCES.map(s => {
    const rad = (s.angle * Math.PI) / 180;
    return { ...s, x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  });

  // Heptagon outline path
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="centerGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor={T.terra} stopOpacity="0.25" />
          <stop offset="60%" stopColor={T.terra} stopOpacity="0.05" />
          <stop offset="100%" stopColor={T.terra} stopOpacity="0" />
        </radialGradient>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset dx="0" dy="2" />
          <feComponentTransfer><feFuncA type="linear" slope="0.15" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background heptagon (faint) */}
      <path d={pathD} fill="none" stroke={T.line2} strokeWidth="1" strokeDasharray="2 4" />

      {/* Connection lines from center to each connected source */}
      {points.map(p => {
        const data = child.sources[p.id];
        const opacity = data.connected ? 0.3 + data.freshness * 0.5 : 0.08;
        const stroke = data.connected ? p.color : T.line2;
        const sw = data.connected ? 1.5 + data.freshness * 1 : 1;
        return (
          <line key={p.id} x1={cx} y1={cy} x2={p.x} y2={p.y}
            stroke={stroke} strokeWidth={sw} strokeOpacity={opacity}
            strokeDasharray={data.connected ? "0" : "3 3"} />
        );
      })}

      {/* Center glow */}
      <circle cx={cx} cy={cy} r={r * 0.8} fill="url(#centerGlow)" />

      {/* Center: the child's twin */}
      <g>
        <circle cx={cx} cy={cy} r={innerR + 8} fill="none" stroke={T.terra} strokeWidth="1" strokeOpacity="0.3" className="breathe" />
        <circle cx={cx} cy={cy} r={innerR} fill={T.surface} stroke={T.terra} strokeWidth="1.5" filter="url(#softShadow)" />
        <text x={cx} y={cy - 6} textAnchor="middle" className="f-display" fontSize="14" fontStyle="italic" fill={T.mute}>
          twin of
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="f-display" fontSize="22" fontWeight="500" fill={T.ink}>
          {child.name}
        </text>
        <text x={cx} y={cy + 30} textAnchor="middle" className="f-mono" fontSize="9" fill={T.mute}>
          {child.age}y · {child.pronouns}
        </text>
      </g>

      {/* Source nodes */}
      {points.map(p => {
        const data = child.sources[p.id];
        const isHover = hoveredSource === p.id;
        const nodeR = isHover ? 30 : 26;
        const Icon = p.icon;
        return (
          <g key={p.id} style={{ cursor: "pointer" }}
             onMouseEnter={() => setHoveredSource(p.id)}
             onMouseLeave={() => setHoveredSource(null)}
             onClick={() => onSourceClick && onSourceClick(p.id)}>
            {data.connected && (
              <circle cx={p.x} cy={p.y} r={nodeR + 3} fill={p.color} fillOpacity="0.1" className="breathe" />
            )}
            <circle cx={p.x} cy={p.y} r={nodeR}
              fill={data.connected ? p.color : T.surface}
              stroke={data.connected ? p.color : T.line2}
              strokeWidth={data.connected ? 0 : 1.5}
              strokeDasharray={data.connected ? "0" : "3 3"}
              style={{ transition: "all 0.2s" }} />
            <foreignObject x={p.x - 10} y={p.y - 10} width="20" height="20" style={{ pointerEvents: "none" }}>
              <div style={{ color: data.connected ? T.surface : T.mute, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <Icon size={16} />
              </div>
            </foreignObject>
            {/* Label */}
            <text
              x={p.x} y={p.y + (p.y > cy ? 48 : -36)}
              textAnchor="middle" className="f-mono" fontSize="10"
              fontWeight="500" fill={T.ink}>
              {p.short.toUpperCase()}
            </text>
            {data.connected && (
              <text x={p.x} y={p.y + (p.y > cy ? 60 : -24)}
                textAnchor="middle" className="f-mono" fontSize="8" fill={p.color}>
                {Math.round(data.freshness * 100)}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Main App shell with navigation ───────────────────────────────────────
export default function App() {
  const [view, setView] = useState("welcome");
  const [child, setChild] = useState(CHILD);
  const [hoveredSource, setHoveredSource] = useState(null);

  const navItems = [
    { id: "welcome",  label: "Welcome",        icon: Sun },
    { id: "intake",   label: "Intake",         icon: Upload },
    { id: "heptagon", label: "Data Heptagon",  icon: Stars },
    { id: "twin",     label: "Twin Profile",   icon: Compass },
    { id: "forecast", label: "Session Forecast", icon: Wind },
    { id: "flow",     label: "Treatment Flow", icon: GitBranch },
    { id: "safety",   label: "Safety Net",     icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen f-body" style={{ background: T.bg, color: T.ink }}>
      <Fonts />

      {/* Top bar */}
      <header className="border-b sticky top-0 z-20" style={{ background: T.bg, borderColor: T.line }}>
        <div className="max-w-[1400px] mx-auto px-7 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: T.ink }}>
                <Stars size={17} color={T.terra} strokeWidth={1.8} />
              </div>
            </div>
            <div>
              <div className="f-display text-2xl font-medium tracking-tight" style={{ color: T.ink }}>
                Aura
              </div>
              <div className="f-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: T.mute }}>
                A digital twin for autism therapy
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="f-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: T.mute }}>Active twin</div>
              <div className="f-display text-sm" style={{ color: T.ink }}>{child.name} <span style={{ color: T.mute }}>· {child.age}y</span></div>
            </div>
            <div className="w-9 h-9 flex items-center justify-center rounded-full text-base" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
              {child.avatar}
            </div>
          </div>
        </div>
        {/* Nav */}
        <div className="border-t" style={{ borderColor: T.line }}>
          <div className="max-w-[1400px] mx-auto px-7 flex gap-0 overflow-x-auto scrollbar-thin">
            {navItems.map(n => (
              <button key={n.id} onClick={() => setView(n.id)}
                className="f-body text-[12px] py-3 px-4 flex items-center gap-2 transition-all whitespace-nowrap"
                style={{
                  color: view === n.id ? T.ink : T.mute,
                  borderBottom: view === n.id ? `2px solid ${T.ink}` : "2px solid transparent",
                  fontWeight: view === n.id ? 600 : 400,
                }}>
                <n.icon size={13} /> {n.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-7 py-8">
        {view === "welcome"  && <WelcomeView setView={setView} child={child} />}
        {view === "intake"   && <IntakeView setView={setView} child={child} setChild={setChild} />}
        {view === "heptagon" && <HeptagonView child={child} hoveredSource={hoveredSource} setHoveredSource={setHoveredSource} setChild={setChild} />}
        {view === "twin"     && <TwinView child={child} />}
        {view === "forecast" && <ForecastView child={child} />}
        {view === "flow"     && <FlowView child={child} />}
        {view === "safety"   && <SafetyView child={child} />}
      </main>

      <footer className="border-t mt-12" style={{ borderColor: T.line }}>
        <div className="max-w-[1400px] mx-auto px-7 py-6 flex items-start justify-between gap-8">
          <div className="flex items-start gap-3 max-w-2xl">
            <ShieldCheck size={14} style={{ color: T.sage, marginTop: 2 }} />
            <div className="f-mono text-[10px] leading-relaxed" style={{ color: T.mute }}>
              Aura predictions are decision support, not clinical mandates. Every prediction comes with a Plan B safety net.
              The clinician and family are always the final authority. HIPAA-compliant · SOC 2 Type II · Data never sold.
            </div>
          </div>
          <div className="text-right">
            <div className="f-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: T.mute }}>v0.7 — Closed beta</div>
            <div className="f-mono text-[10px] mt-1" style={{ color: T.ink }}>Built with families, for families</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW — WELCOME (the hero / orientation)
// ═══════════════════════════════════════════════════════════════════════════
function WelcomeView({ setView, child }) {
  return (
    <div className="gentle-fade">
      {/* Hero */}
      <div className="grid grid-cols-12 gap-8 mb-12">
        <div className="col-span-7">
          <div className="f-mono text-[10px] uppercase tracking-[0.2em] mb-4" style={{ color: T.terra }}>
            ◆ A new way to plan therapy
          </div>
          <h1 className="f-display text-[72px] leading-[1.05] font-light tracking-tight mb-6" style={{ color: T.ink }}>
            Try the session<br/>
            <span className="f-display-i" style={{ color: T.terra }}>before</span> the session.
          </h1>
          <p className="f-display text-[20px] leading-relaxed font-light mb-7 max-w-xl" style={{ color: T.ink2 }}>
            Aura builds a living digital twin of your child from the seven places their data already lives.
            Then it forecasts how the next session will go — so you can adjust before, not regret after.
          </p>
          <div className="flex gap-3">
            <Button variant="primary" size="lg" icon={ArrowRight} onClick={() => setView("intake")}>
              Build {child.name}'s twin
            </Button>
            <Button variant="secondary" size="lg" icon={Stars} onClick={() => setView("heptagon")}>
              See the heptagon
            </Button>
          </div>
        </div>

        <div className="col-span-5 flex items-center justify-center">
          <div className="relative">
            <Heptagon child={child} size={420} hoveredSource={null} setHoveredSource={() => {}} />
          </div>
        </div>
      </div>

      {/* The three paths */}
      <Section eyebrow="How it works"
        title="Three paths to a twin"
        subtitle="Start with whatever you have. The twin gets sharper as more data flows in — but it's useful from minute one.">
        <div className="grid grid-cols-3 gap-5">
          {[
            {
              num: "01",
              time: "15 min",
              title: "The fast path",
              copy: "A structured intake form a parent or therapist fills out on their phone. No uploads needed. Aura builds a provisional twin immediately — it's a sketch, but it's accurate enough to make tomorrow's session better than yesterday's.",
              tag: "Available offline",
              tagColor: T.sage,
              icon: Sun,
            },
            {
              num: "02",
              time: "+30 min",
              title: "The richer path",
              copy: "Drop in any reports you have — ADOS-2 PDF, IEP from school, OT notes, ABA data exports. Aura reads them, pulls out the structured fields, shows you what it found. You correct anything wrong. The twin sharpens.",
              tag: "Most common",
              tagColor: T.terra,
              icon: Upload,
            },
            {
              num: "03",
              time: "Ongoing",
              title: "The deepest path",
              copy: "Add an optional wearable (Apple Watch is enough; Empatica EmbracePlus is best) plus a 60-second daily caregiver check-in. The twin becomes truly individualized and the predictions get genuinely sharp.",
              tag: "Research-grade",
              tagColor: T.indigo,
              icon: Activity,
            },
          ].map((path) => (
            <Card key={path.num} className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="f-mono text-[10px] tracking-[0.2em]" style={{ color: T.mute }}>{path.num}</div>
                <Pill color={path.tagColor} border={path.tagColor + "60"}>{path.tag}</Pill>
              </div>
              <path.icon size={22} style={{ color: path.tagColor, marginBottom: 16 }} />
              <h3 className="f-display text-2xl mb-3 font-medium" style={{ color: T.ink }}>{path.title}</h3>
              <div className="f-mono text-[10px] mb-3" style={{ color: T.mute }}>≈ {path.time}</div>
              <p className="f-body text-[13px] leading-relaxed" style={{ color: T.ink2 }}>{path.copy}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* The promise */}
      <Section eyebrow="Our promise to families"
        title="The either-way safety net"
        subtitle="Every prediction comes with a Plan A and a Plan B. If the forecast is right, you win. If a meltdown starts emerging anyway, the safety net was already prepared. You're never worse off for having used Aura.">
        <div className="grid grid-cols-2 gap-5">
          <Card className="p-7" style={{ background: T.surface }}>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} color={T.sage} />
              <Pill color={T.sage} border={T.sage + "60"}>Plan A — what we predict</Pill>
            </div>
            <h4 className="f-display text-[26px] leading-tight mb-3 font-medium" style={{ color: T.ink }}>
              "Tuesday's session will go well — 78% confidence. Use the train-themed materials."
            </h4>
            <p className="f-body text-[13px] leading-relaxed" style={{ color: T.mute }}>
              The forecast for the planned configuration, with the specific reasons it's likely to succeed and the levers
              that would push it even higher.
            </p>
          </Card>
          <Card className="p-7" style={{ background: T.surface }}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} color={T.terra} />
              <Pill color={T.terra} border={T.terra + "60"}>Plan B — if signs emerge</Pill>
            </div>
            <h4 className="f-display text-[26px] leading-tight mb-3 font-medium" style={{ color: T.ink }}>
              "If HRV drops 25% in the first 8 minutes, switch to the calm-down kit and end at 20 min."
            </h4>
            <p className="f-body text-[13px] leading-relaxed" style={{ color: T.mute }}>
              The pre-prepared response if early warning signs appear. Already loaded, already practiced. Liability is
              not a fear — it's a feature.
            </p>
          </Card>
        </div>
      </Section>

      {/* What makes us different */}
      <Section eyebrow="The talent gap"
        title="Why this hasn't been built before"
        subtitle="Building a real digital twin for a child requires four kinds of expertise that almost never live in the same room. Aura's team brings them together.">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Brain, label: "Clinical autism expertise", desc: "BCBAs, dev. peds, OTs, SLPs", color: T.indigo },
            { icon: Layers, label: "Machine learning", desc: "Bayesian + tree ensembles", color: T.terra },
            { icon: Activity, label: "Wearable engineering", desc: "Multi-modal sensor fusion", color: T.sage },
            { icon: Heart, label: "Family-centered design", desc: "Designed with caregivers", color: T.rose },
          ].map(g => (
            <Card key={g.label} className="p-5">
              <g.icon size={20} style={{ color: g.color, marginBottom: 12 }} />
              <h4 className="f-display text-base font-medium mb-1" style={{ color: T.ink }}>{g.label}</h4>
              <p className="f-mono text-[10px]" style={{ color: T.mute }}>{g.desc}</p>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW — INTAKE (the upload + form flow)
// ═══════════════════════════════════════════════════════════════════════════
function IntakeView({ setView, child, setChild }) {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([
    { name: "ADOS-2_Aarav_Sept2023.pdf", source: "psychologist", status: "parsed", fields: 14, time: "2.3s" },
    { name: "IEP_2024-25_Aarav.pdf",      source: "school",       status: "parsed", fields: 22, time: "3.1s" },
    { name: "ABA_session_logs_180.csv",   source: "aba",          status: "parsed", fields: 1080, time: "1.8s" },
    { name: "Speech_quarterly_Q3.pdf",    source: "speech",       status: "parsed", fields: 8, time: "1.4s" },
    { name: "Pediatric_growth.pdf",       source: "pediatrician", status: "parsed", fields: 11, time: "1.9s" },
  ]);

  return (
    <div className="gentle-fade">
      <Section eyebrow={`Step ${step} of 3`}
        title={step === 1 ? "Tell us about your child" : step === 2 ? "Upload what you have" : "Review and confirm"}
        subtitle={step === 1 ? "Fifteen minutes. No special preparation needed. Skip anything you don't know."
          : step === 2 ? "Drop in PDFs, photos of paper notes, or CSV exports. We read them and pull the data out."
          : "Here's what Aura learned about Aarav. Correct anything that looks off."}>
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-7">
          {[1,2,3].map(s => (
            <React.Fragment key={s}>
              <div onClick={() => setStep(s)}
                className="flex items-center gap-2 cursor-pointer"
                style={{ opacity: s <= step ? 1 : 0.4 }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center f-mono text-[11px]"
                  style={{
                    background: s < step ? T.sage : s === step ? T.ink : T.surface,
                    color: s <= step ? T.surface : T.mute,
                    border: `1px solid ${s <= step ? "transparent" : T.line2}`,
                  }}>
                  {s < step ? <Check size={13}/> : s}
                </div>
                <span className="f-body text-[12px] font-medium" style={{ color: s === step ? T.ink : T.mute }}>
                  {["Tell us","Upload","Review"][s-1]}
                </span>
              </div>
              {s < 3 && <div className="flex-1 h-px" style={{ background: T.line2 }} />}
            </React.Fragment>
          ))}
        </div>
      </Section>

      {step === 1 && <IntakeStep1 child={child} onNext={() => setStep(2)} />}
      {step === 2 && <IntakeStep2 files={files} setFiles={setFiles} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <IntakeStep3 child={child} files={files} onComplete={() => setView("heptagon")} onBack={() => setStep(2)} />}
    </div>
  );
}

function IntakeStep1({ child, onNext }) {
  const [answers, setAnswers] = useState({
    name: child.name, age: child.age,
    interest: child.specialInterest,
    bestTime: child.bestTime,
    hardest: child.hardestTime,
    triggers: "loud noises, schedule changes, wet clothes",
    calming: "train videos, weighted lap pad, deep pressure hugs",
    food: child.comfortFood,
    communication: "speaks 4-5 word sentences, uses AAC for harder requests",
  });

  const QField = ({ label, value, onChange, placeholder, type = "text", helper }) => (
    <Card className="p-5">
      <div className="f-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: T.mute }}>{label}</div>
      {type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full f-body text-[14px] outline-none resize-none"
          rows={2}
          style={{ background: "transparent", color: T.ink, border: "none" }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full f-body text-[14px] outline-none"
          style={{ background: "transparent", color: T.ink, border: "none" }} />
      )}
      {helper && <div className="f-mono text-[9px] mt-2" style={{ color: T.mute2 }}>{helper}</div>}
    </Card>
  );

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <QField label="Their name"              value={answers.name}     onChange={v => setAnswers({...answers, name: v})} />
      <QField label="Their age"               value={answers.age}      onChange={v => setAnswers({...answers, age: v})} />
      <QField label="Special interest"        value={answers.interest} onChange={v => setAnswers({...answers, interest: v})}
              helper="What they could talk about for hours. This is gold for treatment design." />
      <QField label="Comfort food"            value={answers.food}     onChange={v => setAnswers({...answers, food: v})}
              helper="Predictable food = predictable regulation strategy." />
      <QField label="Best time of day"        value={answers.bestTime} onChange={v => setAnswers({...answers, bestTime: v})} />
      <QField label="Hardest time"            value={answers.hardest}  onChange={v => setAnswers({...answers, hardest: v})} />
      <QField label="Known triggers"          value={answers.triggers} onChange={v => setAnswers({...answers, triggers: v})} type="textarea" />
      <QField label="What calms them"         value={answers.calming}  onChange={v => setAnswers({...answers, calming: v})} type="textarea" />
      <div className="col-span-2">
        <QField label="How they communicate"  value={answers.communication}  onChange={v => setAnswers({...answers, communication: v})} type="textarea"
                helper="Spoken words, AAC device, signs, gestures, scripts — whatever's true. We meet them where they are." />
      </div>
      <div className="col-span-2 flex justify-between items-center pt-3">
        <p className="f-mono text-[10px]" style={{ color: T.mute }}>You can edit any of this later. Skip anything you don't know.</p>
        <Button variant="primary" icon={ArrowRight} onClick={onNext}>Continue to uploads</Button>
      </div>
    </div>
  );
}

function IntakeStep2({ files, setFiles, onNext, onBack }) {
  return (
    <>
      {/* Drop zone */}
      <Card className="p-10 mb-5 flex flex-col items-center text-center" style={{
        background: T.surface,
        border: `2px dashed ${T.line2}`,
      }}>
        <Upload size={32} color={T.terra} strokeWidth={1.5} style={{ marginBottom: 14 }} />
        <h3 className="f-display text-2xl font-medium mb-2" style={{ color: T.ink }}>Drop reports here</h3>
        <p className="f-body text-[13px] mb-5 max-w-md" style={{ color: T.mute }}>
          PDFs, photos of paper notes, scanned faxes, CSV exports from your ABA software, screenshots of school portals.
          We handle them all. Aura matches each file to one of the seven heptagon sources automatically.
        </p>
        <div className="flex gap-2">
          <Button variant="primary" icon={Upload}>Choose files</Button>
          <Button variant="secondary">Connect via API</Button>
        </div>
        <div className="mt-6 flex flex-wrap gap-1.5 justify-center max-w-lg">
          {["ADOS-2", "ADI-R", "SRS-2", "Sensory Profile", "WISC-V", "M-CHAT", "IEP", "BIP", "ABA logs", "ABLLS-R", "VB-MAPP", "PECS data", "AAC logs"].map(t => (
            <Pill key={t} color={T.mute} border={T.line2}>{t}</Pill>
          ))}
        </div>
      </Card>

      {/* Parsed files */}
      <h3 className="f-display text-xl font-medium mb-4 flex items-center gap-2" style={{ color: T.ink }}>
        <Sparkles size={16} color={T.terra} /> Aura just read these for you
      </h3>
      <div className="space-y-2 mb-6">
        {files.map(f => {
          const src = SOURCES.find(s => s.id === f.source);
          const Icon = src.icon;
          return (
            <Card key={f.name} className="px-4 py-3 flex items-center gap-4">
              <FileText size={16} color={T.mute} />
              <div className="flex-1">
                <div className="f-mono text-[12px]" style={{ color: T.ink }}>{f.name}</div>
                <div className="f-mono text-[10px] flex items-center gap-1.5 mt-1" style={{ color: T.mute }}>
                  <Icon size={11} color={src.color} />
                  Routed to {src.label} · extracted {f.fields} fields in {f.time}
                </div>
              </div>
              <Pill color={T.sage} border={T.sage + "60"}><Check size={9} /> Parsed</Pill>
              <button className="f-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: T.mute }}>Review</button>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-3">
        <Button variant="ghost" icon={ChevronLeft} onClick={onBack}>Back</Button>
        <div className="flex items-center gap-3">
          <span className="f-mono text-[11px]" style={{ color: T.mute }}>{files.length} files · {files.reduce((s,f)=>s+f.fields,0)} fields extracted</span>
          <Button variant="primary" icon={ArrowRight} onClick={onNext}>Review the twin</Button>
        </div>
      </div>
    </>
  );
}

function IntakeStep3({ child, files, onComplete, onBack }) {
  return (
    <>
      <div className="grid grid-cols-12 gap-5 mb-7">
        <Card className="col-span-5 p-6">
          <div className="flex items-center gap-3 mb-5 pb-5 border-b" style={{ borderColor: T.line }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
              {child.avatar}
            </div>
            <div>
              <div className="f-display text-2xl font-medium">{child.name}</div>
              <div className="f-mono text-[10px]" style={{ color: T.mute }}>{child.age}y · {child.pronouns}</div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              ["Special interest", child.specialInterest],
              ["Best time of day", child.bestTime],
              ["Hardest time", child.hardestTime],
              ["Comfort food", child.comfortFood],
              ["Diagnosed", child.diagnosed],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between items-baseline gap-3">
                <span className="f-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: T.mute }}>{k}</span>
                <span className="f-body text-[13px] text-right" style={{ color: T.ink }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-7 p-6">
          <h4 className="f-display text-lg font-medium mb-4" style={{ color: T.ink }}>What Aura learned from your reports</h4>
          <div className="grid grid-cols-2 gap-x-5 gap-y-3 mb-5">
            {[
              ["ADOS-2 CALSS", "7", "Severity 2 (substantial)", T.indigo],
              ["SRS-2 T-score", "72", "Elevated social challenges", T.terra],
              ["Cognitive (WISC-V FSIQ)", "94", "Average range", T.sage],
              ["IEP Goals (active)", "12", "Across 5 domains", T.indigo],
              ["AAC Vocabulary", "340", "Words available, ~85 used/wk", T.terra],
              ["Med list", "None", "Multivitamin only", T.sage],
            ].map(([k, v, sub, color]) => (
              <div key={k}>
                <div className="f-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: T.mute }}>{k}</div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="f-display text-2xl font-medium tabular-nums" style={{ color }}>{v}</span>
                  <span className="f-body text-[11px]" style={{ color: T.mute }}>{sub}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t" style={{ borderColor: T.line }}>
            <div className="f-mono text-[10px] uppercase tracking-[0.14em] mb-2" style={{ color: T.mute }}>Confidence by source</div>
            <div className="grid grid-cols-7 gap-1">
              {SOURCES.map(s => {
                const data = child.sources[s.id];
                return (
                  <div key={s.id} className="text-center">
                    <Meter value={data.freshness * 100} color={data.connected ? s.color : T.line2} bg={T.surface} height={3} />
                    <div className="f-mono text-[8px] mt-1" style={{ color: T.mute }}>{s.short}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-6" style={{ background: T.surface }}>
        <div className="flex items-start gap-3">
          <Lightbulb size={18} color={T.terra} style={{ marginTop: 4 }} />
          <div className="flex-1">
            <h4 className="f-display text-base font-medium mb-1" style={{ color: T.ink }}>Aura's first observation about {child.name}</h4>
            <p className="f-body text-[13px] leading-relaxed" style={{ color: T.ink2 }}>
              Across his ABA logs and your intake, the strongest pattern is this: <span className="f-display-i" style={{ color: T.terra }}>train-themed materials lift his
              session success rate by 31 percentage points.</span> The school IEP doesn't currently leverage this. We'll surface it as
              a recommendation in the treatment flow.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <Button variant="ghost" icon={ChevronLeft} onClick={onBack}>Back</Button>
        <Button variant="primary" icon={Stars} onClick={onComplete}>Open the heptagon</Button>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW — HEPTAGON (the data architecture, featured)
// ═══════════════════════════════════════════════════════════════════════════
function HeptagonView({ child, hoveredSource, setHoveredSource, setChild }) {
  const [selected, setSelected] = useState(null);
  const connectedCount = Object.values(child.sources).filter(s => s.connected).length;
  const completeness = Math.round(
    Object.values(child.sources).reduce((s, src) => s + src.freshness, 0) / 7 * 100
  );

  return (
    <div className="gentle-fade">
      <div className="grid grid-cols-12 gap-7">
        {/* Heptagon viz */}
        <div className="col-span-7">
          <div className="mb-5">
            <div className="f-mono text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: T.terra }}>◆ Heptagon Data Architecture</div>
            <h2 className="f-display text-4xl font-medium mb-3" style={{ color: T.ink }}>
              Seven sources, <span className="f-display-i" style={{ color: T.terra }}>one child</span>.
            </h2>
            <p className="f-body text-[14px] leading-relaxed max-w-xl" style={{ color: T.ink2 }}>
              Each vertex of the heptagon is a place {child.name}'s data already lives — and currently doesn't talk to anything else.
              Aura connects them. Tap any source to see what it contributes to the twin.
            </p>
          </div>
          <Card className="p-4 flex items-center justify-center" style={{ background: T.surface }}>
            <Heptagon child={child} size={520}
              hoveredSource={hoveredSource} setHoveredSource={setHoveredSource}
              onSourceClick={setSelected} />
          </Card>
        </div>

        {/* Side panel */}
        <div className="col-span-5 space-y-5">
          {/* Stats */}
          <Card className="p-6">
            <div className="grid grid-cols-3 gap-5 mb-5 pb-5 border-b" style={{ borderColor: T.line }}>
              <div>
                <div className="f-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: T.mute }}>Connected</div>
                <div className="f-display text-3xl font-medium mt-1" style={{ color: T.sage }}>{connectedCount}<span className="f-mono text-base" style={{ color: T.mute }}>/7</span></div>
              </div>
              <div>
                <div className="f-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: T.mute }}>Twin completeness</div>
                <div className="f-display text-3xl font-medium mt-1" style={{ color: T.terra }}>{completeness}<span className="f-mono text-base" style={{ color: T.mute }}>%</span></div>
              </div>
              <div>
                <div className="f-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: T.mute }}>Forecast confidence</div>
                <div className="f-display text-3xl font-medium mt-1" style={{ color: T.indigo }}>78<span className="f-mono text-base" style={{ color: T.mute }}>%</span></div>
              </div>
            </div>
            <p className="f-body text-[12px] leading-relaxed" style={{ color: T.mute }}>
              Aura starts giving useful predictions at 40% completeness. {child.name}'s twin is already past that threshold —
              the missing OT data is the biggest remaining gap.
            </p>
          </Card>

          {/* Selected or hovered source detail */}
          {(() => {
            const id = selected || hoveredSource;
            if (!id) {
              return (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Info size={14} color={T.mute} />
                    <span className="f-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: T.mute }}>Hover or tap any source</span>
                  </div>
                  <p className="f-body text-[13px]" style={{ color: T.ink2 }}>
                    Each source contributes different signals. Some carry diagnostic weight (the psychologist's ADOS), some
                    carry frequency (parents' daily observations), some carry skill development (the speech therapist).
                    The twin gets sharper when all seven are flowing.
                  </p>
                </Card>
              );
            }
            const src = SOURCES.find(s => s.id === id);
            const data = child.sources[id];
            const Icon = src.icon;
            return (
              <Card className="p-6 gentle-fade" style={{ borderColor: src.color, borderWidth: 1 }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: src.color }}>
                      <Icon size={18} color={T.surface} />
                    </div>
                    <div>
                      <h4 className="f-display text-xl font-medium" style={{ color: T.ink }}>{src.label}</h4>
                      <Pill color={data.connected ? src.color : T.mute} border={data.connected ? src.color + "60" : T.line2}>
                        {data.connected ? "Connected" : "Pending connection"}
                      </Pill>
                    </div>
                  </div>
                  {data.connected && (
                    <div className="text-right">
                      <div className="f-mono text-[9px] uppercase" style={{ color: T.mute }}>Freshness</div>
                      <div className="f-display text-2xl font-medium" style={{ color: src.color }}>{Math.round(data.freshness*100)}%</div>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 mb-5">
                  {data.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 f-body text-[12px]" style={{ color: T.ink2 }}>
                      <Check size={11} color={data.connected ? src.color : T.mute} style={{ marginTop: 4 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t" style={{ borderColor: T.line }}>
                  <div className="f-mono text-[10px] uppercase tracking-[0.14em] mb-2" style={{ color: T.mute }}>What this source contributes to the twin</div>
                  <p className="f-body text-[12px] leading-relaxed" style={{ color: T.ink2 }}>
                    {SOURCE_DESCRIPTIONS[id]}
                  </p>
                </div>
                {!data.connected && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: T.line }}>
                    <Button variant="primary" size="sm" icon={Plus}>Connect this source</Button>
                  </div>
                )}
              </Card>
            );
          })()}
        </div>
      </div>

      {/* Source matrix */}
      <Section eyebrow="The full ledger" title="What's flowing into the twin"
        subtitle="Every report, every note, every observation — accounted for. This is what 'no data plumbing' actually solves.">
        <Card className="overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 border-b f-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ background: T.surface, borderColor: T.line, color: T.mute }}>
            <div className="col-span-3">Source</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Last update</div>
            <div className="col-span-1 text-center">Items</div>
            <div className="col-span-1 text-center">Weight</div>
            <div className="col-span-4">Contribution to twin</div>
          </div>
          {SOURCES.map(s => {
            const data = child.sources[s.id];
            const Icon = s.icon;
            const last = data.connected ? ["Today", "Yesterday", "3 days ago", "1 week ago", "2 weeks ago", "Last month"][Math.floor(Math.random() * 6)] : "—";
            const weight = ({ pediatrician: 0.8, psychologist: 1.0, school: 0.85, speech: 0.7, ot: 0.7, aba: 0.95, parent: 0.9 })[s.id];
            return (
              <div key={s.id} className="grid grid-cols-12 px-5 py-4 border-b items-center" style={{ borderColor: T.line }}>
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: data.connected ? s.color + "20" : T.surface, border: `1px solid ${data.connected ? s.color : T.line}` }}>
                    <Icon size={14} color={data.connected ? s.color : T.mute} />
                  </div>
                  <div>
                    <div className="f-body text-[13px] font-medium" style={{ color: T.ink }}>{s.label}</div>
                    <div className="f-mono text-[9px]" style={{ color: T.mute }}>{data.items.length} record types</div>
                  </div>
                </div>
                <div className="col-span-1">
                  {data.connected
                    ? <Pill color={T.sage} border={T.sage + "60"}>Live</Pill>
                    : <Pill color={T.mute} border={T.line2}>Pending</Pill>}
                </div>
                <div className="col-span-2 f-mono text-[11px]" style={{ color: T.ink2 }}>{last}</div>
                <div className="col-span-1 text-center f-display text-lg font-medium" style={{ color: T.ink }}>
                  {data.items.length}
                </div>
                <div className="col-span-1 text-center">
                  <Meter value={weight * 100} color={s.color} height={4} />
                  <div className="f-mono text-[9px] mt-1" style={{ color: T.mute }}>{weight.toFixed(2)}</div>
                </div>
                <div className="col-span-4 f-body text-[11px] leading-relaxed" style={{ color: T.mute }}>
                  {SOURCE_DESCRIPTIONS[s.id]}
                </div>
              </div>
            );
          })}
        </Card>
      </Section>
    </div>
  );
}

const SOURCE_DESCRIPTIONS = {
  pediatrician: "Growth, sleep patterns, medications, GI history. The medical baseline that makes everything else interpretable.",
  psychologist: "Diagnostic instruments — ADOS-2, ADI-R, cognitive testing. Highest-weight source for severity and phenotype calibration.",
  school: "How the child performs in their largest social environment. IEP goals, behavior incidents, classroom accommodations.",
  speech: "Receptive vs expressive language, AAC vocabulary, pragmatic skills. Critical for predicting communication-loaded sessions.",
  ot: "Sensory profile, motor planning, regulation strategies that work. Currently disconnected — the largest gap in the twin.",
  aba: "The richest behavioral data: hundreds of session logs, antecedent-behavior-consequence chains, reinforcer effectiveness.",
  parent: "Daily life, regulation outside therapy, real-world triggers and successes. The signal nobody else can capture.",
};

// ═══════════════════════════════════════════════════════════════════════════
// VIEW — TWIN PROFILE
// ═══════════════════════════════════════════════════════════════════════════
function TwinView({ child }) {
  const sensoryData = Object.entries(child.profile.sensory).map(([k,v]) => ({ axis: k, value: v }));
  const behaviorData = Object.entries(child.profile.behavior).map(([k,v]) => ({ axis: k, value: v }));

  return (
    <div className="gentle-fade">
      <Section eyebrow="Twin Profile" title={`Who ${child.name} is`}
        subtitle="A living portrait, drawn from every source. This is what the prediction engine consults before every forecast.">
        <div className="grid grid-cols-12 gap-5 mb-7">
          {/* Identity card */}
          <Card className="col-span-4 p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b" style={{ borderColor: T.line }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
                {child.avatar}
              </div>
              <div>
                <div className="f-display text-2xl font-medium" style={{ color: T.ink }}>{child.name}</div>
                <div className="f-mono text-[10px] mt-0.5" style={{ color: T.mute }}>{child.age}y · {child.pronouns} · diagnosed {child.diagnosed}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="f-mono text-[10px] uppercase tracking-[0.14em] mb-1" style={{ color: T.mute }}>Special interest</div>
                <div className="f-display text-lg italic" style={{ color: T.terra }}>{child.specialInterest}</div>
              </div>
              <div>
                <div className="f-mono text-[10px] uppercase tracking-[0.14em] mb-1" style={{ color: T.mute }}>Best window</div>
                <div className="f-body text-[13px]" style={{ color: T.ink }}>{child.bestTime}</div>
              </div>
              <div>
                <div className="f-mono text-[10px] uppercase tracking-[0.14em] mb-1" style={{ color: T.mute }}>Hardest window</div>
                <div className="f-body text-[13px]" style={{ color: T.ink }}>{child.hardestTime}</div>
              </div>
              <div className="pt-3 border-t" style={{ borderColor: T.line }}>
                <div className="f-mono text-[10px] uppercase tracking-[0.14em] mb-2" style={{ color: T.mute }}>Strengths</div>
                <ul className="space-y-1.5">
                  {child.profile.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 f-body text-[12px]" style={{ color: T.ink2 }}>
                      <Sparkles size={11} color={T.sage} style={{ marginTop: 4 }} />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Sensory radar */}
          <Card className="col-span-4 p-6">
            <h4 className="f-display text-lg font-medium mb-1" style={{ color: T.ink }}>Sensory landscape</h4>
            <p className="f-mono text-[10px] mb-3" style={{ color: T.mute }}>How {child.name}'s senses receive the world</p>
            <div className="rec" style={{ height: 240 }}>
              <ResponsiveContainer>
                <RadarChart data={sensoryData}>
                  <PolarGrid stroke={T.line} />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: T.ink2, fontSize: 10, fontFamily: "DM Sans" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: T.mute }} stroke={T.line} />
                  <Radar dataKey="value" stroke={T.terra} fill={T.terra} fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="f-body text-[11px] mt-2" style={{ color: T.mute }}>
              <span style={{ color: T.terra }}>Auditory hypersensitivity</span> is the dominant feature. Plan accordingly.
            </p>
          </Card>

          {/* Behavior */}
          <Card className="col-span-4 p-6">
            <h4 className="f-display text-lg font-medium mb-1" style={{ color: T.ink }}>Behavioral fingerprint</h4>
            <p className="f-mono text-[10px] mb-4" style={{ color: T.mute }}>Latent traits estimated from session history</p>
            <div className="space-y-3">
              {behaviorData.map(b => (
                <div key={b.axis}>
                  <div className="flex justify-between mb-1">
                    <span className="f-body text-[12px]" style={{ color: T.ink2 }}>{b.axis}</span>
                    <span className="f-mono text-[11px] tabular-nums" style={{ color: T.ink }}>{b.value}</span>
                  </div>
                  <Meter value={b.value} color={b.value < 35 ? T.rose : b.value < 60 ? T.terra : T.sage} height={4} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Triggers */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="f-display text-xl font-medium" style={{ color: T.ink }}>Trigger library</h4>
              <p className="f-body text-[12px] mt-0.5" style={{ color: T.mute }}>Ranked by frequency × severity. Surfaced from every source in the heptagon.</p>
            </div>
            <Pill color={T.terra} border={T.terra + "60"}>{child.profile.triggers.length} triggers tracked</Pill>
          </div>
          <div className="space-y-3">
            {child.profile.triggers.map((t, i) => (
              <div key={t.name} className="grid grid-cols-12 gap-4 items-center py-2.5 border-t" style={{ borderColor: T.line }}>
                <div className="col-span-1 f-mono text-[10px]" style={{ color: T.mute }}>#{(i+1).toString().padStart(2,"0")}</div>
                <div className="col-span-4 f-body text-[13px]" style={{ color: T.ink }}>{t.name}</div>
                <div className="col-span-2 f-mono text-[10px]" style={{ color: T.mute }}>{t.freq}× in last 30 days</div>
                <div className="col-span-3">
                  <Meter value={t.severity * 100} color={t.severity > 0.7 ? T.rose : t.severity > 0.5 ? T.terra : T.amber} height={4} />
                </div>
                <div className="col-span-2 f-mono text-[11px] text-right" style={{ color: t.severity > 0.7 ? T.rose : T.ink2 }}>
                  severity {Math.round(t.severity * 100)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* Recent sessions strip */}
      <Section eyebrow="Last 5 sessions" title="What we've actually seen"
        subtitle="The twin learns from every session, even the missed ones.">
        <div className="grid grid-cols-5 gap-3">
          {child.recentSessions.map((s, i) => {
            const colors = { good: T.sage, okay: T.amber, rough: T.rose, missed: T.mute };
            const icons = { good: ThumbsUp, okay: Meh, rough: ThumbsDown, missed: X };
            const Ico = icons[s.outcome];
            return (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="f-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: T.mute }}>{s.date}</span>
                  <Ico size={14} color={colors[s.outcome]} />
                </div>
                <div className="f-display text-base font-medium mb-1" style={{ color: T.ink }}>{s.type}</div>
                <div className="f-body text-[11px] leading-snug" style={{ color: T.mute }}>{s.note}</div>
              </Card>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW — SESSION FORECAST (the weather report)
// ═══════════════════════════════════════════════════════════════════════════
function ForecastView({ child }) {
  const [plan, setPlan] = useState({
    type: "ABA",
    duration: 45,
    noise: 55,
    peers: 1,
    familiar: true,
    timeOfDay: "morning",
    warning: 5,
    usesInterest: true,
  });
  const result = useMemo(() => predict(child, plan), [child, plan]);

  // Forecast as a "weather" presentation
  const weatherTier =
    result.successProb > 0.75 && result.meltdownRisk < 0.2 ? { label: "Clear skies", icon: Sun,   color: T.sage,  desc: "All systems suggest a calm, productive session." } :
    result.successProb > 0.55 && result.meltdownRisk < 0.4 ? { label: "Partly cloudy", icon: Sun,  color: T.amber, desc: "Generally favorable, but watch the listed factors." } :
    result.meltdownRisk > 0.5                              ? { label: "Storm warning", icon: AlertTriangle, color: T.rose, desc: "High meltdown risk. We strongly recommend adjusting before the session." } :
                                                              { label: "Rain expected", icon: AlertCircle,  color: T.terra,  desc: "Below-average outlook. Make at least one adjustment." };
  const WIcon = weatherTier.icon;

  return (
    <div className="gentle-fade">
      <Section eyebrow="Session forecast" title="Tomorrow's weather, for tomorrow's session"
        subtitle={`Adjust the planned session below. Aura recomputes the forecast in real time as you change inputs — so you can find the best version of the plan before ${child.name} ever walks in.`}>

        {/* Hero forecast */}
        <Card className="p-7 mb-5" style={{ background: `linear-gradient(135deg, ${T.surface} 0%, ${weatherTier.color}10 100%)`, borderColor: weatherTier.color + "30" }}>
          <div className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-7">
              <Pill color={weatherTier.color} border={weatherTier.color + "60"} bg={weatherTier.color + "15"}>
                <WIcon size={11} /> {weatherTier.label}
              </Pill>
              <h3 className="f-display text-5xl leading-none font-light mt-4 mb-3" style={{ color: T.ink }}>
                {Math.round(result.successProb * 100)}<span className="f-mono text-2xl" style={{ color: T.mute }}>% likely to go well</span>
              </h3>
              <p className="f-display text-lg font-light leading-relaxed max-w-md" style={{ color: T.ink2 }}>
                {weatherTier.desc}
              </p>
            </div>
            <div className="col-span-5 space-y-3">
              <div className="flex items-center justify-between p-3" style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 4 }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} color={T.sage} />
                  <span className="f-body text-[13px]" style={{ color: T.ink2 }}>Session success</span>
                </div>
                <span className="f-display text-2xl font-medium" style={{ color: T.sage }}>{Math.round(result.successProb*100)}%</span>
              </div>
              <div className="flex items-center justify-between p-3" style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 4 }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} color={T.rose} />
                  <span className="f-body text-[13px]" style={{ color: T.ink2 }}>Meltdown risk</span>
                </div>
                <span className="f-display text-2xl font-medium" style={{ color: T.rose }}>{Math.round(result.meltdownRisk*100)}%</span>
              </div>
              <div className="flex items-center justify-between p-3" style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 4 }}>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} color={T.terra} />
                  <span className="f-body text-[13px]" style={{ color: T.ink2 }}>Confidence in forecast</span>
                </div>
                <span className="f-display text-2xl font-medium" style={{ color: T.terra }}>78%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Controls + reasoning */}
        <div className="grid grid-cols-12 gap-5">
          {/* Plan controls */}
          <Card className="col-span-5 p-6">
            <h4 className="f-display text-lg font-medium mb-4" style={{ color: T.ink }}>Adjust the plan</h4>
            <div className="space-y-5">
              <div>
                <div className="f-mono text-[10px] uppercase tracking-[0.14em] mb-2" style={{ color: T.mute }}>Session type</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {["ABA", "Speech", "OT", "Sensory", "Group", "Music"].map(t => (
                    <button key={t} onClick={() => setPlan({...plan, type: t})}
                      className="f-body text-[12px] py-2 transition-all"
                      style={{
                        background: plan.type === t ? T.ink : "transparent",
                        color: plan.type === t ? T.surface : T.ink2,
                        border: `1px solid ${plan.type === t ? T.ink : T.line2}`,
                        borderRadius: 3,
                      }}>{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="f-mono text-[10px] uppercase tracking-[0.14em] mb-2" style={{ color: T.mute }}>Time of day</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[["morning", Sun], ["afternoon", Coffee], ["evening", Moon]].map(([t, Ico]) => (
                    <button key={t} onClick={() => setPlan({...plan, timeOfDay: t})}
                      className="f-body text-[12px] py-2 flex items-center justify-center gap-1.5 transition-all"
                      style={{
                        background: plan.timeOfDay === t ? T.ink : "transparent",
                        color: plan.timeOfDay === t ? T.surface : T.ink2,
                        border: `1px solid ${plan.timeOfDay === t ? T.ink : T.line2}`,
                        borderRadius: 3,
                      }}><Ico size={12} /> {t}</button>
                  ))}
                </div>
              </div>

              {[
                ["duration", "Duration",    "min", 15, 90, 5],
                ["noise",    "Ambient noise","dB", 25, 95, 5],
                ["peers",    "Other kids",   "",   0,  6,  1],
                ["warning",  "Warning before transition", "min", 0, 15, 1],
              ].map(([key, label, unit, min, max, step]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1.5">
                    <span className="f-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: T.mute }}>{label}</span>
                    <span className="f-mono text-[11px] tabular-nums" style={{ color: T.ink }}>{plan[key]}{unit && ` ${unit}`}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={plan[key]}
                    onChange={e => setPlan({...plan, [key]: parseInt(e.target.value)})} className="w-full" />
                </div>
              ))}

              <div className="space-y-2 pt-3 border-t" style={{ borderColor: T.line }}>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="f-body text-[12px]" style={{ color: T.ink2 }}>Familiar therapist</span>
                  <ToggleSwitch checked={plan.familiar} onChange={v => setPlan({...plan, familiar: v})} color={T.sage} />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="f-body text-[12px]" style={{ color: T.ink2 }}>Use {child.name}'s special interest as scaffolding</span>
                  <ToggleSwitch checked={plan.usesInterest} onChange={v => setPlan({...plan, usesInterest: v})} color={T.terra} />
                </label>
              </div>
            </div>
          </Card>

          {/* Why */}
          <Card className="col-span-7 p-6">
            <h4 className="f-display text-lg font-medium mb-1" style={{ color: T.ink }}>Why Aura predicts this</h4>
            <p className="f-mono text-[10px] mb-4" style={{ color: T.mute }}>Each factor either pushes the forecast up (good) or down (concerning).</p>
            <div className="space-y-3">
              {result.factors.sort((a,b) => Math.abs(b.value) - Math.abs(a.value)).map(f => (
                <div key={f.name} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-4 f-body text-[12px]" style={{ color: T.ink }}>{f.name}</div>
                  <div className="col-span-7 relative h-5 flex items-center" style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 3 }}>
                    <div className="absolute h-full top-0 transition-all" style={{
                      [f.positive || f.value < 0 ? "right" : "left"]: "50%",
                      width: `${Math.min(Math.abs(f.value) * 50, 50)}%`,
                      background: f.positive || f.value < 0 ? T.sage : f.value > 0.3 ? T.rose : T.terra,
                      borderRadius: 3,
                    }} />
                    <div className="absolute top-0 h-full w-px left-1/2" style={{ background: T.line2 }} />
                  </div>
                  <div className="col-span-1 f-mono text-[10px] text-right" style={{ color: f.positive || f.value < 0 ? T.sage : f.value > 0.3 ? T.rose : T.terra }}>
                    {f.value > 0 ? "+" : ""}{f.value.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t" style={{ borderColor: T.line }}>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={14} color={T.terra} />
                <span className="f-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: T.mute }}>Aura suggests</span>
              </div>
              <div className="space-y-2.5">
                {result.successProb < 0.7 && (
                  <Suggestion text={`Drop noise level to under 60 dB. ${child.name}'s auditory sensitivity is in the 78th percentile.`} delta="+12% success" />
                )}
                {!plan.usesInterest && (
                  <Suggestion text={`Build the session around trains. Historical data shows train-themed materials lift his engagement by 31 points.`} delta="+18% success" />
                )}
                {!plan.familiar && (
                  <Suggestion text={`Confirm a familiar therapist. New adults push his novelty stress hard.`} delta="+15% success" />
                )}
                {plan.warning < 5 && (
                  <Suggestion text={`Increase transition warning to 5+ minutes. His routine attachment is high.`} delta="+9% success" />
                )}
                {result.successProb > 0.75 && plan.usesInterest && plan.familiar && (
                  <Suggestion text="This plan looks well-calibrated for him. Send it." delta="ready" sage />
                )}
              </div>
            </div>
          </Card>
        </div>
      </Section>
    </div>
  );
}

const ToggleSwitch = ({ checked, onChange, color = T.ink }) => (
  <button onClick={() => onChange(!checked)}
    className="relative transition-all"
    style={{ width: 36, height: 20, background: checked ? color : T.line2, borderRadius: 999 }}>
    <span className="absolute top-0.5 transition-all" style={{
      left: checked ? 18 : 2, width: 16, height: 16, background: T.surface, borderRadius: 999,
    }} />
  </button>
);

const Suggestion = ({ text, delta, sage = false }) => (
  <div className="flex items-start gap-3 p-3" style={{ background: sage ? T.sage + "10" : T.surface, border: `1px solid ${sage ? T.sage + "40" : T.line}`, borderRadius: 3 }}>
    {sage ? <CheckCircle2 size={14} color={T.sage} style={{ marginTop: 2 }} /> : <ArrowRight size={14} color={T.terra} style={{ marginTop: 2 }} />}
    <div className="flex-1 f-body text-[12px] leading-relaxed" style={{ color: T.ink2 }}>{text}</div>
    <Pill color={sage ? T.sage : T.terra} border={(sage ? T.sage : T.terra) + "60"}>{delta}</Pill>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// VIEW — TREATMENT FLOW (monthly plan, menu of options)
// ═══════════════════════════════════════════════════════════════════════════
function FlowView({ child }) {
  // Synthetic 8-week trajectory
  const trajectory = Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    success: 50 + Math.sin(i / 2) * 10 + i * 2.2 + Math.random() * 6,
    meltdowns: Math.max(2, 8 - i * 0.4 + Math.random() * 2),
  }));

  return (
    <div className="gentle-fade">
      <Section eyebrow="Treatment flow" title={`Where ${child.name} is going`}
        subtitle="Twelve-week trajectory plus the recommendations Aura suggests for the next 30 days. Each option comes with a predicted outcome and tradeoff.">

        {/* Trajectory chart */}
        <Card className="p-6 mb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="f-display text-lg font-medium" style={{ color: T.ink }}>Twelve-week trajectory</h4>
              <p className="f-mono text-[10px] mt-1" style={{ color: T.mute }}>Session success rate vs. meltdown frequency, smoothed</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ background: T.sage }} />
                <span className="f-mono text-[10px]" style={{ color: T.mute }}>SUCCESS %</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ background: T.rose }} />
                <span className="f-mono text-[10px]" style={{ color: T.mute }}>MELTDOWNS / WK</span>
              </div>
            </div>
          </div>
          <div className="rec" style={{ height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={trajectory}>
                <defs>
                  <linearGradient id="sageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.sage} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={T.sage} stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" />
                <XAxis dataKey="week" />
                <YAxis yAxisId="s" domain={[0, 100]} />
                <YAxis yAxisId="m" orientation="right" domain={[0, 12]} />
                <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 3, fontFamily: "JetBrains Mono", fontSize: 11 }} />
                <Area yAxisId="s" type="monotone" dataKey="success" stroke={T.sage} strokeWidth={2.5} fill="url(#sageGrad)" />
                <Line yAxisId="m" type="monotone" dataKey="meltdowns" stroke={T.rose} strokeWidth={2} dot={{ r: 3, fill: T.rose }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Three options menu */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} color={T.terra} />
            <span className="f-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: T.mute }}>Aura suggests three paths for the next 30 days</span>
          </div>
          <h3 className="f-display text-2xl font-medium mb-1" style={{ color: T.ink }}>
            Choose with the family. Aura learns from what you choose.
          </h3>
          <p className="f-body text-[13px] max-w-2xl" style={{ color: T.mute }}>
            Each option is grounded in {child.name}'s data + similar children's outcomes + the evidence base + your stated values.
            None of them is "right" — they have different tradeoffs. The team picks together.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-7">
          {[
            {
              label: "Option A",
              title: "Lean into the special interest",
              tag: "Highest predicted gain",
              tagColor: T.sage,
              copy: "Restructure 60% of ABA + Speech sessions around train-themed content. Add a daily 10-min train-map activity at home.",
              outcomes: [
                ["Predicted session success", "+18 pts", T.sage],
                ["Engagement minutes", "+22 min/wk", T.sage],
                ["Cost change", "$0", T.mute],
                ["Effort for family", "Low", T.sage],
              ],
              tradeoff: "Generalization risk: skills may not transfer if all scaffolding is train-themed. We'll fade gradually.",
            },
            {
              label: "Option B",
              title: "Reduce group, double down on 1:1",
              tag: "Lowest meltdown risk",
              tagColor: T.terra,
              copy: "Drop the Friday group session for 30 days. Replace with two 1:1 sessions. Reassess in week 4.",
              outcomes: [
                ["Predicted meltdowns",     "−4 / mo", T.sage],
                ["Predicted session success", "+9 pts",  T.sage],
                ["Cost change",             "+$240/mo", T.terra],
                ["Effort for family",       "None",    T.sage],
              ],
              tradeoff: "Group skills won't progress this month. Worth it if Wednesday meltdowns are disrupting school.",
            },
            {
              label: "Option C",
              title: "The free, gentle path",
              tag: "Lowest cost, durable",
              tagColor: T.indigo,
              copy: "Add a 10-minute daily caregiver-led co-regulation routine after school. Music + weighted lap pad + 1:1 talk.",
              outcomes: [
                ["Predicted session success", "+6 pts",  T.sage],
                ["Predicted meltdowns",     "−2 / mo", T.sage],
                ["Cost change",             "$0",      T.mute],
                ["Effort for family",       "10 min/day", T.terra],
              ],
              tradeoff: "Smaller magnitude than A or B. But it's the most durable — it builds family capacity, not therapist dependency.",
            },
          ].map(opt => (
            <Card key={opt.label} className="p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <Pill color={opt.tagColor} border={opt.tagColor + "60"}>{opt.label}</Pill>
                <span className="f-mono text-[9px]" style={{ color: opt.tagColor }}>{opt.tag}</span>
              </div>
              <h4 className="f-display text-xl font-medium mb-2 leading-tight" style={{ color: T.ink }}>{opt.title}</h4>
              <p className="f-body text-[12px] mb-4 leading-relaxed" style={{ color: T.ink2 }}>{opt.copy}</p>
              <div className="flex-1 space-y-1.5 mb-4">
                {opt.outcomes.map(([k,v,c]) => (
                  <div key={k} className="flex justify-between items-baseline">
                    <span className="f-mono text-[10px]" style={{ color: T.mute }}>{k}</span>
                    <span className="f-display text-sm font-medium" style={{ color: c }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t mb-3" style={{ borderColor: T.line }}>
                <div className="f-mono text-[9px] uppercase tracking-[0.14em] mb-1" style={{ color: T.mute }}>Tradeoff</div>
                <p className="f-body text-[11px] leading-relaxed" style={{ color: T.ink2 }}>{opt.tradeoff}</p>
              </div>
              <Button variant="primary" size="sm" className="w-full justify-center" icon={Check}>Choose this path</Button>
            </Card>
          ))}
        </div>

        {/* Goals progress */}
        <Section eyebrow="What's progressing" title="Goal-by-goal" subtitle="Aura tracks IEP and clinical goals across all sources, surfaces what's progressing, plateauing, or ready to retire.">
          <div className="grid grid-cols-2 gap-4">
            {[
              { goal: "Spontaneously requests breaks using AAC", progress: 88, status: "ready to retire", color: T.sage, source: "Speech" },
              { goal: "Tolerates 10 minutes in cafeteria",       progress: 42, status: "progressing",      color: T.terra, source: "School" },
              { goal: "3-step transition with 5-min warning",    progress: 65, status: "progressing",      color: T.terra, source: "ABA" },
              { goal: "Independent toileting routine",           progress: 95, status: "achieved",         color: T.sage, source: "Parent" },
              { goal: "Plays cooperatively with 1 peer (5 min)", progress: 28, status: "plateaued — review", color: T.rose, source: "School" },
              { goal: "Names 5 emotions on flashcards",          progress: 71, status: "progressing",      color: T.terra, source: "Speech" },
            ].map(g => (
              <Card key={g.goal} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="f-body text-[13px] font-medium" style={{ color: T.ink }}>{g.goal}</p>
                    <p className="f-mono text-[9px] mt-0.5" style={{ color: T.mute }}>tracked via {g.source}</p>
                  </div>
                  <Pill color={g.color} border={g.color + "60"}>{g.status}</Pill>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <Meter value={g.progress} color={g.color} height={4} />
                  <span className="f-display text-base font-medium tabular-nums w-10 text-right" style={{ color: g.color }}>{g.progress}%</span>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW — SAFETY NET (the "either-way" Plan B system — your idea)
// ═══════════════════════════════════════════════════════════════════════════
function SafetyView({ child }) {
  return (
    <div className="gentle-fade">
      <Section eyebrow="The either-way safety net"
        title={`If the prediction is right, ${child.name} wins. If it's wrong, the safety net wins.`}
        subtitle="Every forecast Aura makes is paired with a pre-loaded Plan B. Liability is not a fear we manage — it's a feature we ship. This is what makes Aura safe to actually use in a clinic.">

        {/* The promise visual */}
        <Card className="p-7 mb-6" style={{ background: T.surface }}>
          <div className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-2 text-center">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: T.terra + "15", border: `2px solid ${T.terra}` }}>
                <ShieldCheck size={26} color={T.terra} />
              </div>
            </div>
            <div className="col-span-10">
              <h3 className="f-display text-3xl font-medium leading-tight mb-2" style={{ color: T.ink }}>
                Either way <span className="f-display-i" style={{ color: T.terra }}>— you're better off</span> than without Aura.
              </h3>
              <p className="f-body text-[14px] leading-relaxed max-w-3xl" style={{ color: T.ink2 }}>
                If our prediction is right and the session goes well, you saved time, stress, and a possible meltdown. If our
                prediction is wrong and trouble emerges anyway, the Plan B was already in your pocket — pre-prepared, pre-practiced,
                and ready to deploy in seconds. Without Aura, you'd have neither the forecast nor the safety net. With Aura, you
                always have both.
              </p>
            </div>
          </div>
        </Card>

        {/* Three branches */}
        <h3 className="f-display text-xl font-medium mb-3" style={{ color: T.ink }}>How the safety net works in practice</h3>
        <div className="grid grid-cols-3 gap-4 mb-7">
          {[
            {
              tier: "Plan A",
              tierColor: T.sage,
              when: "When the forecast is right",
              icon: CheckCircle2,
              title: "The session unfolds as predicted",
              copy: "Confidence held. Heart rate stayed in range. The intervention worked. Aura logs the success and updates the twin — next week's forecast gets sharper.",
              cta: "Log success, refine twin",
            },
            {
              tier: "Plan A→B",
              tierColor: T.amber,
              when: "When early warning signs emerge mid-session",
              icon: AlertTriangle,
              title: "Wearable detects HRV drop, EDA spike, or therapist flags concern",
              copy: "Aura whispers (haptic buzz, no alarm) — 'recommend 2-min break, deploy weighted lap pad'. The therapist already practiced this. The cascade is interrupted before it becomes a meltdown.",
              cta: "See live alerts demo",
            },
            {
              tier: "Plan B",
              tierColor: T.rose,
              when: "When a meltdown occurs anyway",
              icon: ShieldCheck,
              title: "We help you make it shorter and less harmful",
              copy: "Pre-loaded de-escalation kit appears on the therapist's screen. Calming sequence (specific to this child) is one tap away. Recovery protocol auto-logs. The twin learns from the event.",
              cta: "Review de-escalation kit",
            },
          ].map(b => {
            const Ico = b.icon;
            return (
              <Card key={b.tier} className="p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <Pill color={b.tierColor} border={b.tierColor + "60"} bg={b.tierColor + "10"}><Ico size={11} /> {b.tier}</Pill>
                </div>
                <div className="f-mono text-[10px] uppercase tracking-[0.14em] mb-2" style={{ color: T.mute }}>{b.when}</div>
                <h4 className="f-display text-lg font-medium mb-3 leading-tight" style={{ color: T.ink }}>{b.title}</h4>
                <p className="f-body text-[12px] leading-relaxed mb-4 flex-1" style={{ color: T.ink2 }}>{b.copy}</p>
                <Button variant="secondary" size="sm" icon={ArrowRight}>{b.cta}</Button>
              </Card>
            );
          })}
        </div>

        {/* The de-escalation kit (Aarav's specific) */}
        <Section eyebrow="Pre-loaded for this child" title={`${child.name}'s personalized calming kit`}
          subtitle="Built from his data. The therapist sees this on a single screen the moment Aura detects elevated stress. No fumbling, no guessing.">
          <Card className="p-6">
            <div className="grid grid-cols-4 gap-5">
              {[
                { icon: Volume2,    label: "Audio",        copy: "Train rhythm playlist (his preferred — 8 tracks queued)", priority: 1 },
                { icon: Hand,       label: "Tactile",      copy: "Weighted lap pad (5 lb, blue — the one he prefers)",      priority: 2 },
                { icon: BookOpen,   label: "Visual",       copy: "Subway map flip-book (laminated copy in OT room)",        priority: 3 },
                { icon: MessageCircle, label: "Communication", copy: "AAC: 'I need a break' phrase pinned to home screen",  priority: 4 },
                { icon: Coffee,     label: "Co-regulation", copy: "Mom's voice memo, 38 sec. Plays from therapist's phone.", priority: 5 },
                { icon: Target,     label: "Movement",     copy: "Pressure wall-pushes, 10 reps (proprioceptive input)",    priority: 6 },
                { icon: Clock,      label: "Timing",       copy: "End session by minute 22 if not recovered. No exceptions.", priority: 7 },
                { icon: Heart,      label: "Recovery",     copy: "20-min quiet space + favorite snack (rice w/ ghee)",      priority: 8 },
              ].map(item => (
                <div key={item.label} className="p-4" style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 3 }}>
                  <div className="flex items-center justify-between mb-2">
                    <item.icon size={15} color={T.terra} />
                    <span className="f-mono text-[9px]" style={{ color: T.mute }}>step {item.priority}</span>
                  </div>
                  <div className="f-display text-sm font-medium mb-1" style={{ color: T.ink }}>{item.label}</div>
                  <p className="f-body text-[11px] leading-snug" style={{ color: T.ink2 }}>{item.copy}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t flex items-start gap-3" style={{ borderColor: T.line }}>
              <Info size={14} color={T.indigo} style={{ marginTop: 3 }} />
              <p className="f-body text-[12px] leading-relaxed" style={{ color: T.ink2 }}>
                This kit is generated from {child.name}'s history and updated whenever something works (or doesn't). When his preferences
                change — say, weighted lap pad stops working — Aura notices in the data and revises the kit automatically.
              </p>
            </div>
          </Card>
        </Section>

        {/* Liability and trust */}
        <Section eyebrow="Trust framework" title="Why clinicians can actually deploy this">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Eye, title: "Clinician is always final authority",
                copy: "Aura recommends. The clinician decides. Every prediction shows its reasoning so the clinician can override with confidence." },
              { icon: ShieldCheck, title: "Every prediction is paired with a Plan B",
                copy: "The clinical workflow assumes Aura will sometimes be wrong. The Plan B is the differentiator from existing tools." },
              { icon: Heart, title: "Family is in the loop on every decision",
                copy: "Recommendations go through a parent review step. Nothing is deployed in opacity. The family co-owns the treatment." },
              { icon: BookOpen, title: "Decisions are logged, reviewable, defensible",
                copy: "If something goes wrong, there's a complete record of what Aura predicted, what the clinician chose, and why. Audit-ready." },
              { icon: GitBranch, title: "The model is calibrated honestly",
                copy: "Confidence intervals shown. Out-of-distribution warnings when the child's situation is unusual. We tell you when to trust us less." },
              { icon: Sparkles, title: "Improves with use — without compromising the child",
                copy: "Federated learning means {child.name}'s data trains a better model for other kids without ever leaving your clinic's servers." },
            ].map(t => (
              <Card key={t.title} className="p-5">
                <t.icon size={18} color={T.terra} style={{ marginBottom: 12 }} />
                <h4 className="f-display text-base font-medium mb-2 leading-tight" style={{ color: T.ink }}>{t.title}</h4>
                <p className="f-body text-[12px] leading-relaxed" style={{ color: T.ink2 }}>{t.copy}</p>
              </Card>
            ))}
          </div>
        </Section>
      </Section>
    </div>
  );
}
