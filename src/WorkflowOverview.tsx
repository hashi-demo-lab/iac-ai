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
  weights: ["300", "400", "600", "700", "800"],
});

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BG = "#0a0a0a";

// ════════════════════════════════════════════════════════════════════════════════
// Color palette
// ════════════════════════════════════════════════════════════════════════════════
const PURPLE = "#7B42BC";
const INDIGO = "#6366F1";
const AMBER = "#F59E0B";
const SKY = "#38BDF8";

// ════════════════════════════════════════════════════════════════════════════════
// Pipeline data
// ════════════════════════════════════════════════════════════════════════════════
const PLAN_SUB_ITEMS = [
  { text: "Specification", enterFrame: 95 },
  { text: "Research + Planning", enterFrame: 115 },
  { text: "Tasks + Analysis", enterFrame: 135 },
  { text: "Summary + Approval", enterFrame: 155 },
];

const IMPLEMENT_SUB_ITEMS = [
  { text: "Implementation", enterFrame: 270 },
  { text: "Design Review", enterFrame: 290 },
  { text: "Sandbox Testing", enterFrame: 310 },
  { text: "Report", enterFrame: 330 },
];

// ════════════════════════════════════════════════════════════════════════════════
// Layout coordinates (1920x1080 viewport)
// Two-column: diagram left (0–1150), title text right (1220–1860)
// ════════════════════════════════════════════════════════════════════════════════
const PIPELINE_CY = 560; // main pipeline vertical center

// ── Top tier: Private Registry + Platform Team (right) ──────────────────────
const PLATFORM_CX = 950;
const PLATFORM_CY = 210;
const PLATFORM_R = 40;

const REGISTRY_W = 320;
const REGISTRY_H = 68;
const REGISTRY_X = 460;
const REGISTRY_Y = PLATFORM_CY - REGISTRY_H / 2;

// ── Bottom tier: Main pipeline ──────────────────────────────────────────────
const USER_CX = 90;
const USER_CY = PIPELINE_CY;
const USER_R = 44;

const PLAN_W = 320;
const PLAN_H = 260;
const PLAN_X = 210;
const PLAN_Y = PIPELINE_CY - PLAN_H / 2;

const REVIEW_W = 150;
const REVIEW_H = 130;
const REVIEW_X = 575;
const REVIEW_Y = PIPELINE_CY - REVIEW_H / 2;

const IMPL_W = 320;
const IMPL_H = 260;
const IMPL_X = 810;
const IMPL_Y = PIPELINE_CY - IMPL_H / 2;

// ── Target nodes below /tf-implement ────────────────────────────────────────
const TARGET_GAP = 24;
const HCP_W = 155;
const HCP_H = 52;
const VAULT_W = 155;
const VAULT_H = 52;
const TARGETS_TOTAL_W = HCP_W + TARGET_GAP + VAULT_W;
const TARGETS_START_X = IMPL_X + (IMPL_W - TARGETS_TOTAL_W) / 2;
const HCP_X = TARGETS_START_X;
const HCP_Y = IMPL_Y + IMPL_H + 36;
const VAULT_X = TARGETS_START_X + HCP_W + TARGET_GAP;
const VAULT_Y = HCP_Y;

// ════════════════════════════════════════════════════════════════════════════════
// Arrow geometry — main pipeline horizontal arrows
// ════════════════════════════════════════════════════════════════════════════════
const ARROW_GAP = 16;
const ARROW_Y = PIPELINE_CY;

const ARROW1_X1 = USER_CX + USER_R + ARROW_GAP;
const ARROW1_X2 = PLAN_X - ARROW_GAP;

const ARROW2_X1 = PLAN_X + PLAN_W + ARROW_GAP;
const ARROW2_X2 = REVIEW_X - ARROW_GAP;

const ARROW3_X1 = REVIEW_X + REVIEW_W + ARROW_GAP;
const ARROW3_X2 = IMPL_X - ARROW_GAP;

// Down arrows to target nodes
const DOWN1_X = HCP_X + HCP_W / 2;
const DOWN1_Y1 = IMPL_Y + IMPL_H + 4;
const DOWN1_Y2 = HCP_Y - 4;

const DOWN2_X = VAULT_X + VAULT_W / 2;
const DOWN2_Y1 = IMPL_Y + IMPL_H + 4;
const DOWN2_Y2 = VAULT_Y - 4;

// Platform Team → Registry arrow (Platform is right of Registry)
const PT_ARROW_X1 = PLATFORM_CX - PLATFORM_R - ARROW_GAP;
const PT_ARROW_X2 = REGISTRY_X + REGISTRY_W + ARROW_GAP;
const PT_ARROW_Y = PLATFORM_CY;

// Registry → /tf-plan dashed connection (bezier curve — "approved modules")
const REG_PLAN_X1 = REGISTRY_X + 50;                     // near left of Registry bottom
const REG_PLAN_Y1 = REGISTRY_Y + REGISTRY_H + 4;
const REG_PLAN_X2 = PLAN_X + PLAN_W - 20;                // near right of /tf-plan top
const REG_PLAN_Y2 = PLAN_Y - 4;

export const WORKFLOW_OVERVIEW_DURATION_SECONDS = 20;

// ════════════════════════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════════════════════════
export const WorkflowOverview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ── Helper: fade-in with translateY ──────────────────────────────────────
  const fadeIn = (enterFrame: number, duration = 20) => {
    const opacity = interpolate(frame, [enterFrame, enterFrame + duration], [0, 1], CLAMP);
    const y = interpolate(frame, [enterFrame, enterFrame + duration], [15, 0], CLAMP);
    return { opacity, y };
  };

  // ── Helper: SVG draw progress ────────────────────────────────────────────
  const drawProgress = (startFrame: number, duration = 15) => {
    return interpolate(frame, [startFrame, startFrame + duration], [0, 1], CLAMP);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // BACKGROUND FADE IN (frames 0–30)
  // ════════════════════════════════════════════════════════════════════════════
  const masterFadeIn = interpolate(frame, [0, 30], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════════════
  // BACKGROUND GLOW oscillation
  // ════════════════════════════════════════════════════════════════════════════
  const glowOpacity = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0.04, 0.1],
  );

  const gridOpacity = interpolate(frame, [0, 40], [0, 0.35], CLAMP);

  // ════════════════════════════════════════════════════════════════════════════
  // TITLE AREA (frames 10–40)
  // ════════════════════════════════════════════════════════════════════════════
  const titleLabelOpacity = interpolate(frame, [10, 30], [0, 1], CLAMP);
  const titleReveal = interpolate(frame, [15, 40], [0, 100], {
    ...CLAMP,
    easing: Easing.out(Easing.exp),
  });
  const titleSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 18, stiffness: 100, mass: 0.8 },
  });
  const titleScale = interpolate(titleSpring, [0, 1], [1.04, 1.0]);

  const accentWidth = interpolate(frame, [20, 50], [0, 360], {
    ...CLAMP,
    easing: Easing.out(Easing.exp),
  });
  const accentOpacity = interpolate(frame, [20, 32], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════════════
  // PRIVATE REGISTRY NODE (frames 40–60) — appears early as context
  // ════════════════════════════════════════════════════════════════════════════
  const regSpring = spring({
    frame: Math.max(0, frame - 40),
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.8 },
  });
  const regOpacity = interpolate(frame, [40, 60], [0, 1], CLAMP);
  const regY = interpolate(regSpring, [0, 1], [12, 0]);

  // ════════════════════════════════════════════════════════════════════════════
  // PLATFORM TEAM NODE (frames 45–65)
  // ════════════════════════════════════════════════════════════════════════════
  const platSpring = spring({
    frame: Math.max(0, frame - 45),
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.8 },
  });
  const platOpacity = interpolate(frame, [45, 65], [0, 1], CLAMP);
  const platY = interpolate(platSpring, [0, 1], [12, 0]);

  // ════════════════════════════════════════════════════════════════════════════
  // PLATFORM TEAM → REGISTRY ARROW (frames 65–80)
  // ════════════════════════════════════════════════════════════════════════════
  const ptArrowProgress = drawProgress(65, 15);
  const ptArrowOpacity = interpolate(frame, [65, 75], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════════════
  // REGISTRY → /tf-plan DASHED LINE (frames 85–100)
  // ════════════════════════════════════════════════════════════════════════════
  const regPlanProgress = drawProgress(85, 15);
  const regPlanOpacity = interpolate(frame, [85, 95], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════════════
  // USER NODE (frames 30–50)
  // ════════════════════════════════════════════════════════════════════════════
  const userSpring = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.8 },
  });
  const userOpacity = interpolate(frame, [30, 50], [0, 1], CLAMP);
  const userY = interpolate(userSpring, [0, 1], [15, 0]);

  // ════════════════════════════════════════════════════════════════════════════
  // ARROW 1: User → /tf-plan (frames 55–70)
  // ════════════════════════════════════════════════════════════════════════════
  const arrow1Progress = drawProgress(55, 15);
  const arrow1Opacity = interpolate(frame, [55, 65], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════════════
  // /tf-plan BOX (frames 70–85)
  // ════════════════════════════════════════════════════════════════════════════
  const planSpring = spring({
    frame: Math.max(0, frame - 70),
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.8 },
  });
  const planOpacity = interpolate(frame, [70, 85], [0, 1], CLAMP);
  const planY = interpolate(planSpring, [0, 1], [10, 0]);

  // ════════════════════════════════════════════════════════════════════════════
  // ARROW 2: /tf-plan → Review Specs (frames 175–190)
  // ════════════════════════════════════════════════════════════════════════════
  const arrow2Progress = drawProgress(175, 15);
  const arrow2Opacity = interpolate(frame, [175, 185], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════════════
  // REVIEW SPECS NODE (frames 195–215)
  // ════════════════════════════════════════════════════════════════════════════
  const reviewSpring = spring({
    frame: Math.max(0, frame - 195),
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.8 },
  });
  const reviewOpacity = interpolate(frame, [195, 215], [0, 1], CLAMP);
  const reviewY = interpolate(reviewSpring, [0, 1], [10, 0]);

  // ════════════════════════════════════════════════════════════════════════════
  // ARROW 3: Review Specs → /tf-implement (frames 225–240)
  // ════════════════════════════════════════════════════════════════════════════
  const arrow3Progress = drawProgress(225, 15);
  const arrow3Opacity = interpolate(frame, [225, 235], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════════════
  // /tf-implement BOX (frames 245–260)
  // ════════════════════════════════════════════════════════════════════════════
  const implSpring = spring({
    frame: Math.max(0, frame - 245),
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.8 },
  });
  const implOpacity = interpolate(frame, [245, 260], [0, 1], CLAMP);
  const implY = interpolate(implSpring, [0, 1], [10, 0]);

  // ════════════════════════════════════════════════════════════════════════════
  // DOWN ARROWS to HCP TF & Vault Radar (frames 355–370)
  // ════════════════════════════════════════════════════════════════════════════
  const arrowDownProgress = drawProgress(355, 15);
  const arrowDownOpacity = interpolate(frame, [355, 365], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════════════
  // HCP TERRAFORM & VAULT RADAR NODES (frames 375–395)
  // ════════════════════════════════════════════════════════════════════════════
  const targetOpacity = interpolate(frame, [375, 395], [0, 1], CLAMP);
  const targetSpring = spring({
    frame: Math.max(0, frame - 375),
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.8 },
  });
  const targetY = interpolate(targetSpring, [0, 1], [12, 0]);

  // ════════════════════════════════════════════════════════════════════════════
  // EXIT FADE (last 60 frames)
  // ════════════════════════════════════════════════════════════════════════════
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 60, durationInFrames],
    [1, 0],
    CLAMP,
  );

  // Shared style for monospace headers
  const monoHeaderStyle: React.CSSProperties = {
    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: 20,
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: 0.5,
  };

  // Shared style for sub-item text
  const subItemTextStyle: React.CSSProperties = {
    fontFamily: interFontFamily,
    fontSize: 17,
    fontWeight: 400,
    color: "rgba(255, 255, 255, 0.78)",
    lineHeight: 1.35,
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: masterFadeIn * exitOpacity,
        overflow: "hidden",
      }}
    >
      {/* ── Background radial glow ──────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 70% at 35% 55%, rgba(123, 66, 188, ${glowOpacity}), transparent 70%)`,
        }}
      />

      {/* ── Ambient dot grid ────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(rgba(123, 66, 188, 0.06) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          opacity: gridOpacity,
        }}
      />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* VERTICAL SEPARATOR                                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: 1170,
          top: 120,
          width: 1.5,
          height: 840,
          opacity: titleLabelOpacity * 0.3,
          background: `linear-gradient(180deg, transparent, ${PURPLE}, ${INDIGO}, transparent)`,
          borderRadius: 1,
        }}
      />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TITLE AREA — right column, vertically centered                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: 1220,
          top: 0,
          bottom: 0,
          width: 640,
          display: "flex",
          flexDirection: "column" as const,
          justifyContent: "center",
          paddingRight: 60,
        }}
      >
        <div
          style={{
            fontFamily: interFontFamily,
            fontSize: 14,
            fontWeight: 600,
            color: PURPLE,
            letterSpacing: 5,
            textTransform: "uppercase" as const,
            opacity: titleLabelOpacity,
            marginBottom: 14,
          }}
        >
          Demo Workflow Overview
        </div>
        <div
          style={{
            fontFamily: interFontFamily,
            fontSize: 42,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.15,
            clipPath: `inset(0 ${100 - titleReveal}% 0 0)`,
            transform: `scale(${titleScale})`,
            transformOrigin: "left center",
            textShadow: `0 0 20px rgba(255, 255, 255, 0.1), 0 0 60px rgba(123, 66, 188, 0.25)`,
          }}
        >
          Application Consumer Workflow
        </div>
        <div
          style={{
            width: accentWidth,
            height: 2.5,
            opacity: accentOpacity,
            background: `linear-gradient(90deg, ${PURPLE}, ${INDIGO}, ${SKY}, transparent)`,
            boxShadow: `0 0 14px rgba(123, 66, 188, 0.5)`,
            borderRadius: 2,
            marginTop: 18,
            marginBottom: 24,
          }}
        />
        <div
          style={{
            fontFamily: interFontFamily,
            fontSize: 18,
            fontWeight: 300,
            color: "rgba(255, 255, 255, 0.55)",
            lineHeight: 1.6,
            opacity: titleLabelOpacity,
            maxWidth: 520,
          }}
        >
          <span style={{ fontWeight: 600, color: "rgba(255, 255, 255, 0.75)" }}>
            Spec-Driven Development
          </span>
          <br />
          Define intent as specifications.
          AI agents handle research, planning,
          and implementation.
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SVG CONNECTOR ARROWS                                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        viewBox="0 0 1920 1080"
      >
        <defs>
          <marker
            id="wf-arrow"
            markerWidth="14"
            markerHeight="10"
            refX="12"
            refY="5"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M 0 0 L 14 5 L 0 10 Z" fill="rgba(255, 255, 255, 0.6)" />
          </marker>
        </defs>

        {/* ── Platform Team → Registry ─────────────────────────────────── */}
        <line
          x1={PT_ARROW_X1} y1={PT_ARROW_Y}
          x2={PT_ARROW_X2} y2={PT_ARROW_Y}
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth={2.5}
          markerEnd="url(#wf-arrow)"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - ptArrowProgress}
          opacity={ptArrowOpacity}
        />
        <line
          x1={PT_ARROW_X1} y1={PT_ARROW_Y}
          x2={PT_ARROW_X2} y2={PT_ARROW_Y}
          stroke="rgba(123, 66, 188, 0.35)"
          strokeWidth={7}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - ptArrowProgress}
          opacity={ptArrowOpacity * 0.4}
          strokeLinecap="round"
        />

        {/* ── Registry → /tf-plan (dashed bezier — "approved modules") ── */}
        <path
          d={`M ${REG_PLAN_X1} ${REG_PLAN_Y1} C ${REG_PLAN_X1} ${(REG_PLAN_Y1 + REG_PLAN_Y2) / 2}, ${REG_PLAN_X2} ${(REG_PLAN_Y1 + REG_PLAN_Y2) / 2}, ${REG_PLAN_X2} ${REG_PLAN_Y2}`}
          fill="none"
          stroke="rgba(123, 66, 188, 0.55)"
          strokeWidth={2}
          strokeDasharray="8 5"
          markerEnd="url(#wf-arrow)"
          pathLength={1}
          strokeDashoffset={(1 - regPlanProgress) * 1}
          opacity={regPlanOpacity}
        />
        {/* Label for dashed line */}
        {regPlanOpacity > 0 && (
          <text
            x={(REG_PLAN_X1 + REG_PLAN_X2) / 2 - 40}
            y={(REG_PLAN_Y1 + REG_PLAN_Y2) / 2 - 10}
            fill={`rgba(123, 66, 188, ${regPlanOpacity * 0.7})`}
            fontSize="12"
            fontFamily={interFontFamily}
            fontWeight="600"
            letterSpacing="0.5"
          >
            approved modules
          </text>
        )}

        {/* ── Arrow 1: User → /tf-plan ─────────────────────────────────── */}
        <line
          x1={ARROW1_X1} y1={ARROW_Y}
          x2={ARROW1_X2} y2={ARROW_Y}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth={3}
          markerEnd="url(#wf-arrow)"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - arrow1Progress}
          opacity={arrow1Opacity}
        />
        <line
          x1={ARROW1_X1} y1={ARROW_Y}
          x2={ARROW1_X2} y2={ARROW_Y}
          stroke="rgba(123, 66, 188, 0.4)"
          strokeWidth={8}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - arrow1Progress}
          opacity={arrow1Opacity * 0.5}
          strokeLinecap="round"
        />

        {/* ── Arrow 2: /tf-plan → Review Specs ─────────────────────────── */}
        <line
          x1={ARROW2_X1} y1={ARROW_Y}
          x2={ARROW2_X2} y2={ARROW_Y}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth={3}
          markerEnd="url(#wf-arrow)"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - arrow2Progress}
          opacity={arrow2Opacity}
        />
        <line
          x1={ARROW2_X1} y1={ARROW_Y}
          x2={ARROW2_X2} y2={ARROW_Y}
          stroke="rgba(123, 66, 188, 0.4)"
          strokeWidth={8}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - arrow2Progress}
          opacity={arrow2Opacity * 0.5}
          strokeLinecap="round"
        />

        {/* ── Arrow 3: Review Specs → /tf-implement ────────────────────── */}
        <line
          x1={ARROW3_X1} y1={ARROW_Y}
          x2={ARROW3_X2} y2={ARROW_Y}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth={3}
          markerEnd="url(#wf-arrow)"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - arrow3Progress}
          opacity={arrow3Opacity}
        />
        <line
          x1={ARROW3_X1} y1={ARROW_Y}
          x2={ARROW3_X2} y2={ARROW_Y}
          stroke="rgba(99, 102, 241, 0.4)"
          strokeWidth={8}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - arrow3Progress}
          opacity={arrow3Opacity * 0.5}
          strokeLinecap="round"
        />

        {/* ── Down arrow 1: /tf-implement → HCP Terraform ──────────────── */}
        <line
          x1={DOWN1_X} y1={DOWN1_Y1}
          x2={DOWN1_X} y2={DOWN1_Y2}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth={2.5}
          markerEnd="url(#wf-arrow)"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - arrowDownProgress}
          opacity={arrowDownOpacity}
        />
        <line
          x1={DOWN1_X} y1={DOWN1_Y1}
          x2={DOWN1_X} y2={DOWN1_Y2}
          stroke={`rgba(79, 140, 245, 0.4)`}
          strokeWidth={7}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - arrowDownProgress}
          opacity={arrowDownOpacity * 0.4}
          strokeLinecap="round"
        />

        {/* ── Down arrow 2: /tf-implement → Vault Radar ────────────────── */}
        <line
          x1={DOWN2_X} y1={DOWN2_Y1}
          x2={DOWN2_X} y2={DOWN2_Y2}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth={2.5}
          markerEnd="url(#wf-arrow)"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - arrowDownProgress}
          opacity={arrowDownOpacity}
        />
        <line
          x1={DOWN2_X} y1={DOWN2_Y1}
          x2={DOWN2_X} y2={DOWN2_Y2}
          stroke={`rgba(56, 189, 248, 0.4)`}
          strokeWidth={7}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - arrowDownProgress}
          opacity={arrowDownOpacity * 0.4}
          strokeLinecap="round"
        />
      </svg>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PLATFORM TEAM NODE                                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: PLATFORM_CX - PLATFORM_R,
          top: PLATFORM_CY - PLATFORM_R,
          width: PLATFORM_R * 2,
          opacity: platOpacity,
          transform: `translateY(${platY}px)`,
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: PLATFORM_R * 2,
            height: PLATFORM_R * 2,
            borderRadius: "50%",
            background: `linear-gradient(135deg, rgba(123, 66, 188, 0.18), rgba(99, 102, 241, 0.18))`,
            border: `2px solid rgba(123, 66, 188, 0.5)`,
            boxShadow: `0 0 20px rgba(123, 66, 188, 0.2), inset 0 0 12px rgba(123, 66, 188, 0.1)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
          }}
        >
          🛡️
        </div>
        <div
          style={{
            fontFamily: interFontFamily,
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.65)",
            marginTop: 8,
            letterSpacing: 0.5,
            whiteSpace: "nowrap" as const,
          }}
        >
          Platform Team
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* HCP TERRAFORM PRIVATE REGISTRY                                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: REGISTRY_X,
          top: REGISTRY_Y,
          width: REGISTRY_W,
          height: REGISTRY_H,
          opacity: regOpacity,
          transform: `translateY(${regY}px)`,
          borderRadius: 14,
          border: `1.5px solid rgba(123, 66, 188, 0.55)`,
          boxShadow: `0 0 28px rgba(123, 66, 188, 0.2), inset 0 0 14px rgba(123, 66, 188, 0.06)`,
          background: `linear-gradient(135deg, rgba(123, 66, 188, 0.12), rgba(15, 15, 20, 0.92))`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <span style={{ fontSize: 28 }}>📦</span>
        <div>
          <div
            style={{
              fontFamily: interFontFamily,
              fontSize: 17,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: 0.3,
              textShadow: `0 0 12px rgba(123, 66, 188, 0.5)`,
            }}
          >
            HCP Terraform
          </div>
          <div
            style={{
              fontFamily: interFontFamily,
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.55)",
              letterSpacing: 0.5,
              marginTop: 1,
            }}
          >
            Private Module Registry
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* USER NODE                                                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: USER_CX - USER_R,
          top: USER_CY - USER_R,
          width: USER_R * 2,
          opacity: userOpacity,
          transform: `translateY(${userY}px)`,
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: USER_R * 2,
            height: USER_R * 2,
            borderRadius: "50%",
            background: `linear-gradient(135deg, rgba(123, 66, 188, 0.18), rgba(99, 102, 241, 0.18))`,
            border: `2px solid rgba(123, 66, 188, 0.6)`,
            boxShadow: `0 0 24px rgba(123, 66, 188, 0.25), inset 0 0 14px rgba(123, 66, 188, 0.12)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 38,
          }}
        >
          👤
        </div>
        <div
          style={{
            fontFamily: interFontFamily,
            fontSize: 16,
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.75)",
            marginTop: 10,
            letterSpacing: 1,
          }}
        >
          User
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* /tf-plan BOX                                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: PLAN_X,
          top: PLAN_Y,
          width: PLAN_W,
          height: PLAN_H,
          opacity: planOpacity,
          transform: `translateY(${planY}px)`,
          borderRadius: 14,
          border: `1.5px solid rgba(123, 66, 188, 0.55)`,
          boxShadow: `0 0 30px rgba(123, 66, 188, 0.18), inset 0 0 14px rgba(123, 66, 188, 0.06)`,
          background: `rgba(15, 15, 20, 0.88)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 20px",
            background: `linear-gradient(135deg, rgba(123, 66, 188, 0.22), rgba(123, 66, 188, 0.08))`,
            borderBottom: `1px solid rgba(123, 66, 188, 0.35)`,
          }}
        >
          <span style={{ ...monoHeaderStyle, textShadow: `0 0 14px rgba(123, 66, 188, 0.6)` }}>
            /tf-plan (skill)
          </span>
        </div>
        <div style={{ padding: "16px 20px" }}>
          {PLAN_SUB_ITEMS.map((item, i) => {
            const { opacity: itemOpacity } = fadeIn(item.enterFrame, 20);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  marginBottom: 12,
                  opacity: itemOpacity,
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: PURPLE,
                    boxShadow: `0 0 8px rgba(123, 66, 188, 0.7)`,
                    flexShrink: 0,
                  }}
                />
                <span style={subItemTextStyle}>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* REVIEW SPECS GATE                                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: REVIEW_X,
          top: REVIEW_Y,
          width: REVIEW_W,
          height: REVIEW_H,
          opacity: reviewOpacity,
          transform: `translateY(${reviewY}px)`,
          borderRadius: 14,
          border: `1.5px solid rgba(245, 158, 11, 0.55)`,
          boxShadow: `0 0 28px rgba(245, 158, 11, 0.18), inset 0 0 12px rgba(245, 158, 11, 0.06)`,
          background: `rgba(15, 15, 20, 0.88)`,
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: interFontFamily,
            fontSize: 17,
            fontWeight: 700,
            color: AMBER,
            letterSpacing: 0.5,
            textShadow: `0 0 14px rgba(245, 158, 11, 0.6)`,
          }}
        >
          Review Specs
        </span>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: `2px solid rgba(245, 158, 11, 0.45)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `rgba(245, 158, 11, 0.1)`,
          }}
        >
          <span style={{ fontSize: 20, color: AMBER, fontWeight: 700 }}>✓</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* /tf-implement BOX                                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: IMPL_X,
          top: IMPL_Y,
          width: IMPL_W,
          height: IMPL_H,
          opacity: implOpacity,
          transform: `translateY(${implY}px)`,
          borderRadius: 14,
          border: `1.5px solid rgba(99, 102, 241, 0.55)`,
          boxShadow: `0 0 30px rgba(99, 102, 241, 0.18), inset 0 0 14px rgba(99, 102, 241, 0.06)`,
          background: `rgba(15, 15, 20, 0.88)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 20px",
            background: `linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(99, 102, 241, 0.08))`,
            borderBottom: `1px solid rgba(99, 102, 241, 0.35)`,
          }}
        >
          <span style={{ ...monoHeaderStyle, textShadow: `0 0 14px rgba(99, 102, 241, 0.6)` }}>
            /tf-implement (skill)
          </span>
        </div>
        <div style={{ padding: "16px 20px" }}>
          {IMPLEMENT_SUB_ITEMS.map((item, i) => {
            const { opacity: itemOpacity } = fadeIn(item.enterFrame, 20);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  marginBottom: 12,
                  opacity: itemOpacity,
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: INDIGO,
                    boxShadow: `0 0 8px rgba(99, 102, 241, 0.7)`,
                    flexShrink: 0,
                  }}
                />
                <span style={subItemTextStyle}>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* HCP TERRAFORM TARGET NODE                                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: HCP_X,
          top: HCP_Y,
          width: HCP_W,
          height: HCP_H,
          opacity: targetOpacity,
          transform: `translateY(${targetY}px)`,
          borderRadius: 10,
          border: `1px solid rgba(79, 140, 245, 0.45)`,
          boxShadow: `0 0 18px rgba(79, 140, 245, 0.15)`,
          background: `rgba(15, 15, 20, 0.88)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: interFontFamily,
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.85)",
            letterSpacing: 0.3,
          }}
        >
          HCP Terraform ☁
        </span>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* VAULT RADAR TARGET NODE                                            */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: VAULT_X,
          top: VAULT_Y,
          width: VAULT_W,
          height: VAULT_H,
          opacity: targetOpacity,
          transform: `translateY(${targetY}px)`,
          borderRadius: 10,
          border: `1px solid rgba(56, 189, 248, 0.45)`,
          boxShadow: `0 0 18px rgba(56, 189, 248, 0.15)`,
          background: `rgba(15, 15, 20, 0.88)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: interFontFamily,
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.85)",
            letterSpacing: 0.3,
          }}
        >
          Vault Radar 🔒
        </span>
      </div>
    </AbsoluteFill>
  );
};
