import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: interFontFamily } = loadInter("normal", {
  subsets: ["latin"],
  weights: ["300", "400", "600", "800"],
});

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PURPLE = "#7B42BC";
const AMBER = "#F59E0B";
const BG = "#0a0a0a";

// ── Left-side points data ────────────────────────────────────────────────────

interface PointData {
  label: string;
  text: string;
  color: string;
}

const POINTS: PointData[] = [
  {
    label: "What's Changed",
    text: "AI writes infrastructure code in seconds",
    color: PURPLE,
  },
  {
    label: "What Hasn't",
    text: "Governance, security reviews, and compliance gates still takes days",
    color: PURPLE,
  },
  {
    label: "The Shift",
    text: "Bottlenecks have moved from code creation to design, planning, validation and approval",
    color: PURPLE,
  },
  {
    label: "The Risk",
    text: "AI velocity amplifies security exposure without embedded controls",
    color: PURPLE,
  },
  {
    label: "The Opportunity",
    text: "Reimagine the entire IaC workflow, not just code generation",
    color: AMBER,
  },
];

const POINT_ENTER_FRAMES = [40, 65, 90, 115, 140];

// ── Pipeline data ────────────────────────────────────────────────────────────

interface StageData {
  label: string;
  x: number;
  y: number;
}

const COL_LEFT = 25;
const COL_RIGHT = 285;
const NODE_W = 190;
const NODE_H = 42;

const STAGES: StageData[] = [
  { label: "PLANNING", x: COL_LEFT, y: 25 },
  { label: "DESIGN", x: COL_RIGHT, y: 115 },
  { label: "COMPLIANCE", x: COL_LEFT, y: 205 },
  { label: "VALIDATION", x: COL_RIGHT, y: 295 },
  { label: "REVIEW", x: COL_LEFT, y: 385 },
  { label: "DEPLOYMENT", x: COL_RIGHT, y: 475 },
];

const STAGE_ENTER_FRAMES = [45, 68, 91, 114, 137, 160];

// Connector SVG paths between stages (right-angle S-curve)
const CONNECTORS = [
  { path: `M 215 46 H 250 V 136 H 285`, enterFrame: 50 },
  { path: `M 285 136 H 250 V 226 H 215`, enterFrame: 73 },
  { path: `M 215 226 H 250 V 316 H 285`, enterFrame: 96 },
  { path: `M 285 316 H 250 V 406 H 215`, enterFrame: 119 },
  { path: `M 215 406 H 250 V 496 H 285`, enterFrame: 142 },
];

// Decorative dot positions at right-angle turn points
const CORNER_DOTS = [
  { cx: 250, cy: 46 },
  { cx: 250, cy: 136 },
  { cx: 250, cy: 136 },
  { cx: 250, cy: 226 },
  { cx: 250, cy: 226 },
  { cx: 250, cy: 316 },
  { cx: 250, cy: 316 },
  { cx: 250, cy: 406 },
  { cx: 250, cy: 406 },
  { cx: 250, cy: 496 },
];

// Faint horizontal circuit traces for background depth
const CIRCUIT_TRACES = [
  { y: 70, x1: 10, x2: 160, opacity: 0.06 },
  { y: 160, x1: 320, x2: 480, opacity: 0.05 },
  { y: 250, x1: 50, x2: 220, opacity: 0.04 },
  { y: 340, x1: 300, x2: 460, opacity: 0.06 },
  { y: 430, x1: 20, x2: 200, opacity: 0.05 },
  { y: 510, x1: 280, x2: 440, opacity: 0.04 },
];

// ── Component ────────────────────────────────────────────────────────────────

export const NeedForEvolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ── Background ─────────────────────────────────────────────────────────
  const glowOpacity = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [0.04, 0.09],
  );

  const gridOpacity = interpolate(frame, [0, 40], [0, 0.4], CLAMP);

  // ── Subtitle: "AI Driven infrastructure..." ────────────────────────────
  const subtitleOpacity = interpolate(frame, [5, 25], [0, 1], CLAMP);

  // ── Title: "The need for evolution" ────────────────────────────────────
  const titleReveal = interpolate(frame, [12, 45], [0, 100], {
    ...CLAMP,
    easing: Easing.out(Easing.exp),
  });

  const titleSpring = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: { damping: 18, stiffness: 100, mass: 0.8 },
  });
  const titleScale = interpolate(titleSpring, [0, 1], [1.05, 1.0]);

  // ── Title accent line ──────────────────────────────────────────────────
  const accentWidth = interpolate(frame, [20, 55], [0, 480], {
    ...CLAMP,
    easing: Easing.out(Easing.exp),
  });
  const accentOpacity = interpolate(frame, [20, 32], [0, 1], CLAMP);

  // ── "THE OPPORTUNITY" pipeline header ──────────────────────────────────
  const headerSpring = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.7 },
  });
  const headerScale = interpolate(headerSpring, [0, 1], [0.7, 1.0]);
  const headerOpacity = interpolate(frame, [30, 48], [0, 1], CLAMP);

  // Lightbulb glow pulse — gentle sine oscillation
  const bulbPulse = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0, 1],
  );

  // ── Exit: last 30 frames ───────────────────────────────────────────────
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    CLAMP,
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        overflow: "hidden",
        opacity: exitOpacity,
      }}
    >
      {/* ── Background radial glow ──────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(123, 66, 188, ${glowOpacity}), transparent 70%)`,
        }}
      />

      {/* ── Ambient particle grid ───────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(rgba(123, 66, 188, 0.08) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          opacity: gridOpacity,
        }}
      />

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* LEFT SIDE: Text Content                                        */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 80,
          width: 820,
        }}
      >
        {/* Subtitle */}
        <div
          style={{
            fontFamily: interFontFamily,
            fontSize: 24,
            fontWeight: 400,
            color: "rgba(255, 255, 255, 0.5)",
            letterSpacing: 2,
            textTransform: "uppercase" as const,
            opacity: subtitleOpacity,
            marginBottom: 14,
          }}
        >
          AI Driven infrastructure requires a new workflow
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: interFontFamily,
            fontSize: 78,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.1,
            letterSpacing: 1,
            clipPath: `inset(0 ${100 - titleReveal}% 0 0)`,
            transform: `scale(${titleScale})`,
            transformOrigin: "left center",
            textShadow: `0 0 20px rgba(255, 255, 255, 0.1), 0 0 60px rgba(123, 66, 188, 0.25)`,
            marginBottom: 16,
          }}
        >
          The need for evolution
        </div>

        {/* Accent line */}
        <div
          style={{
            width: accentWidth,
            height: 3,
            opacity: accentOpacity,
            background: `linear-gradient(90deg, ${PURPLE}, rgba(123, 66, 188, 0.3), transparent)`,
            boxShadow: `0 0 14px rgba(123, 66, 188, 0.5)`,
            borderRadius: 2,
            marginBottom: 44,
          }}
        />

        {/* ── Staggered points ─────────────────────────────────────── */}
        {POINTS.map((point, i) => {
          const enterFrame = POINT_ENTER_FRAMES[i];
          const isAmber = point.color === AMBER;

          // Divider line — sweeps in with glow
          const dividerWidth = interpolate(
            frame,
            [enterFrame, enterFrame + 22],
            [0, 720],
            { ...CLAMP, easing: Easing.out(Easing.exp) },
          );
          const dividerOpacity = interpolate(
            frame,
            [enterFrame, enterFrame + 8],
            [0, 1],
            CLAMP,
          );

          // Label — springs in from the left with overshoot
          const labelSpring = spring({
            frame: Math.max(0, frame - enterFrame - 3),
            fps,
            config: { damping: 14, stiffness: 140, mass: 0.5 },
          });
          const labelX = interpolate(labelSpring, [0, 1], [-60, 0]);
          const labelOpacity = interpolate(
            frame,
            [enterFrame + 3, enterFrame + 12],
            [0, 1],
            CLAMP,
          );

          // Description — reveals with clipPath wipe + blur clearing
          const descReveal = interpolate(
            frame,
            [enterFrame + 8, enterFrame + 22],
            [0, 100],
            { ...CLAMP, easing: Easing.out(Easing.quad) },
          );
          const descBlur = interpolate(
            frame,
            [enterFrame + 8, enterFrame + 18],
            [6, 0],
            CLAMP,
          );
          const descOpacity = interpolate(
            frame,
            [enterFrame + 8, enterFrame + 14],
            [0, 1],
            CLAMP,
          );

          const dividerColor = isAmber
            ? `linear-gradient(90deg, ${AMBER}, rgba(245, 158, 11, 0.3), transparent)`
            : `linear-gradient(90deg, ${PURPLE}, rgba(123, 66, 188, 0.3), transparent)`;

          const dividerGlow = isAmber
            ? `0 0 10px rgba(245, 158, 11, 0.4)`
            : `0 0 10px rgba(123, 66, 188, 0.4)`;

          return (
            <div key={i} style={{ marginBottom: 22 }}>
              {/* Divider line */}
              <div
                style={{
                  width: dividerWidth,
                  height: 1,
                  opacity: dividerOpacity,
                  background: dividerColor,
                  boxShadow: dividerGlow,
                  marginBottom: 14,
                }}
              />

              {/* Label — slides in from left */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline" }}>
                <span
                  style={{
                    fontFamily: interFontFamily,
                    fontSize: 24,
                    fontWeight: 700,
                    color: isAmber ? AMBER : "#ffffff",
                    letterSpacing: 1,
                    opacity: labelOpacity,
                    transform: `translateX(${labelX}px)`,
                    textShadow: isAmber
                      ? `0 0 14px rgba(245, 158, 11, 0.5)`
                      : `0 0 14px rgba(123, 66, 188, 0.4)`,
                    marginRight: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  {point.label}
                </span>

                {/* Description — clipPath wipe + blur clear */}
                <span
                  style={{
                    fontFamily: interFontFamily,
                    fontSize: 22,
                    fontWeight: 300,
                    color: "rgba(255, 255, 255, 0.75)",
                    opacity: descOpacity,
                    clipPath: `inset(0 ${100 - descReveal}% 0 0)`,
                    filter: `blur(${descBlur}px)`,
                    lineHeight: 1.4,
                  }}
                >
                  – {point.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* RIGHT SIDE: Neon Pipeline Visualization                        */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 0,
          width: 520,
          height: "100%",
          display: "flex",
          flexDirection: "column" as const,
          justifyContent: "center",
        }}
      >
        {/* ── "THE OPPORTUNITY" header with glowing bulb ─────────── */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 24,
            opacity: headerOpacity,
            transform: `scale(${headerScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Glowing lightbulb */}
          <div
            style={{
              position: "relative",
              width: 80,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            {/* Outer pulsing glow */}
            <div
              style={{
                position: "absolute",
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(245, 158, 11, ${0.15 + 0.1 * bulbPulse}) 0%, rgba(245, 158, 11, 0.05) 50%, transparent 70%)`,
                transform: `scale(${1.0 + 0.15 * bulbPulse})`,
              }}
            />
            {/* Inner bright glow */}
            <div
              style={{
                position: "absolute",
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(245, 158, 11, ${0.25 + 0.15 * bulbPulse}) 0%, transparent 70%)`,
                filter: `blur(6px)`,
              }}
            />
            {/* Bulb rays */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, ri) => {
              const rayDelay = ri * 0.12;
              const rayPulse = Math.sin((frame * 0.08) + rayDelay);
              const rayLength = 28 + 6 * rayPulse;
              const rayOpacity = 0.15 + 0.1 * rayPulse;
              return (
                <div
                  key={ri}
                  style={{
                    position: "absolute",
                    width: 1.5,
                    height: rayLength,
                    background: `linear-gradient(to top, rgba(245, 158, 11, ${rayOpacity}), transparent)`,
                    transform: `rotate(${angle}deg) translateY(-22px)`,
                    transformOrigin: "center bottom",
                  }}
                />
              );
            })}
            {/* Emoji */}
            <span style={{ fontSize: 36, position: "relative", zIndex: 1 }}>💡</span>
          </div>
          <span
            style={{
              fontFamily: interFontFamily,
              fontSize: 24,
              fontWeight: 700,
              color: AMBER,
              letterSpacing: 3,
              textTransform: "uppercase" as const,
              textShadow: `0 0 16px rgba(245, 158, 11, ${0.4 + 0.2 * bulbPulse}), 0 0 40px rgba(245, 158, 11, ${0.15 + 0.1 * bulbPulse})`,
            }}
          >
            THE OPPORTUNITY
          </span>
        </div>

        {/* ── Pipeline container (relative for absolute children) ─ */}
        <div
          style={{
            position: "relative",
            width: 500,
            height: 520,
            margin: "0 auto",
          }}
        >
          {/* ── Background circuit traces ──────────────────────── */}
          <svg
            width={500}
            height={520}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            {CIRCUIT_TRACES.map((trace, i) => (
              <line
                key={`trace-${i}`}
                x1={trace.x1}
                y1={trace.y}
                x2={trace.x2}
                y2={trace.y}
                stroke={PURPLE}
                strokeWidth={1}
                opacity={trace.opacity}
                strokeDasharray="4 8"
              />
            ))}
          </svg>

          {/* ── SVG connectors + corner dots ───────────────────── */}
          <svg
            width={500}
            height={520}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            {/* Glow filter for connectors */}
            <defs>
              <filter id="connectorGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connector paths with draw-in animation */}
            {CONNECTORS.map((conn, i) => {
              const drawProgress = interpolate(
                frame,
                [conn.enterFrame, conn.enterFrame + 18],
                [1, 0],
                { ...CLAMP, easing: Easing.out(Easing.quad) },
              );
              const connOpacity = interpolate(
                frame,
                [conn.enterFrame, conn.enterFrame + 6],
                [0, 0.9],
                CLAMP,
              );

              return (
                <path
                  key={`conn-${i}`}
                  d={conn.path}
                  fill="none"
                  stroke={PURPLE}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={drawProgress}
                  opacity={connOpacity}
                  filter="url(#connectorGlow)"
                />
              );
            })}

            {/* Corner dots at turn points */}
            {CORNER_DOTS.map((dot, i) => {
              // Dots appear with their associated connector
              const connectorIndex = Math.floor(i / 2);
              const connEnter = CONNECTORS[connectorIndex].enterFrame;
              const dotOpacity = interpolate(
                frame,
                [connEnter + 4, connEnter + 12],
                [0, 0.7],
                CLAMP,
              );

              return (
                <circle
                  key={`dot-${i}`}
                  cx={dot.cx}
                  cy={dot.cy}
                  r={3}
                  fill={PURPLE}
                  opacity={dotOpacity}
                  filter="url(#dotGlow)"
                />
              );
            })}
          </svg>

          {/* ── Stage nodes ────────────────────────────────────── */}
          {STAGES.map((stage, i) => {
            const enterFrame = STAGE_ENTER_FRAMES[i];

            const nodeSpring = spring({
              frame: Math.max(0, frame - enterFrame),
              fps,
              config: { damping: 16, stiffness: 130, mass: 0.6 },
            });
            const nodeScale = interpolate(nodeSpring, [0, 1], [0.6, 1.0]);
            const nodeOpacity = interpolate(
              frame,
              [enterFrame, enterFrame + 10],
              [0, 1],
              CLAMP,
            );

            // Glow intensifies when lit
            const glowStrength = interpolate(nodeSpring, [0, 1], [0, 1]);

            const isLast = i === STAGES.length - 1;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: stage.x,
                  top: stage.y,
                  width: NODE_W,
                  height: NODE_H,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: nodeOpacity,
                  transform: `scale(${nodeScale})`,
                  background: `rgba(15, 15, 20, 0.85)`,
                  border: `1.5px solid ${isLast ? AMBER : PURPLE}`,
                  borderRadius: 8,
                  boxShadow: isLast
                    ? `0 0 ${8 + 14 * glowStrength}px rgba(245, 158, 11, ${0.15 + 0.35 * glowStrength}), inset 0 0 ${6 + 8 * glowStrength}px rgba(245, 158, 11, ${0.05 + 0.1 * glowStrength})`
                    : `0 0 ${8 + 14 * glowStrength}px rgba(123, 66, 188, ${0.15 + 0.35 * glowStrength}), inset 0 0 ${6 + 8 * glowStrength}px rgba(123, 66, 188, ${0.05 + 0.1 * glowStrength})`,
                }}
              >
                <span
                  style={{
                    fontFamily: interFontFamily,
                    fontSize: 15,
                    fontWeight: 700,
                    color: isLast ? AMBER : "#ffffff",
                    letterSpacing: 2,
                    textShadow: isLast
                      ? `0 0 10px rgba(245, 158, 11, ${0.3 + 0.4 * glowStrength})`
                      : `0 0 10px rgba(123, 66, 188, ${0.3 + 0.4 * glowStrength})`,
                  }}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
