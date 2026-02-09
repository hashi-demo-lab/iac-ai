import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Sequence,
} from "remotion";
import { Video } from "@remotion/media";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: interFontFamily } = loadInter("normal", {
  subsets: ["latin"],
  weights: ["300", "400", "600", "700", "800"],
});

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BG = "#0a0a0a";

// ════════════════════════════════════════════════════════════════════════════════
// Colors
// ════════════════════════════════════════════════════════════════════════════════
const PURPLE = "#7B42BC"; // Official Terraform software icon color
const INDIGO = "#6366F1";
const SKY = "#38BDF8";

// ════════════════════════════════════════════════════════════════════════════════
// Ring geometry
// ════════════════════════════════════════════════════════════════════════════════
const CX = 960;
const CY = 540;
const RADIUS = 380;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ════════════════════════════════════════════════════════════════════════════════
// Stage data — Developer Input is OUTSIDE the ring, 9 stages ON the ring
// ════════════════════════════════════════════════════════════════════════════════
interface StageClip {
  label: string;
  icon: string;
  source: string;
  phase: "plan" | "impl";
  playbackRate: number;
  sourceDuration: number; // seconds of source video
  zoomTarget: { x: number; y: number; scale: number };
}

// Developer Input — outside the ring as the human trigger
const DEVELOPER_INPUT: StageClip = {
  label: "Developer Input",
  icon: "👤",
  source: "clip-00-developer-input.mp4",
  phase: "plan",
  playbackRate: 2.5,
  sourceDuration: 30,
  zoomTarget: { x: 0.65, y: 0.2, scale: 1.7 }, // VS Code terminal: /tf-plan prompt area
};

// 9 stages on the ring in chronological order
const RING_STAGES: StageClip[] = [
  {
    label: "Plan",
    icon: "🔧",
    source: "clip-01-environment-setup.mp4",
    phase: "plan",
    playbackRate: 1.6,
    sourceDuration: 20,
    zoomTarget: { x: 0.65, y: 0.3, scale: 1.7 }, // VS Code terminal: validation script + MCP tools
  },
  {
    label: "Requirements",
    icon: "📝",
    source: "clip-02-requirements.mp4",
    phase: "plan",
    playbackRate: 3.0,
    sourceDuration: 40,
    zoomTarget: { x: 0.65, y: 0.65, scale: 1.7 }, // VS Code terminal: interview Q&A options
  },
  {
    label: "Specification",
    icon: "📋",
    source: "clip-03-specification.mp4",
    phase: "plan",
    playbackRate: 3.5,
    sourceDuration: 40,
    zoomTarget: { x: 0.35, y: 0.35, scale: 1.7 }, // Split: spec.md editor content (left pane)
  },
  {
    label: "Implementation",
    icon: "⚙️",
    source: "clip-04-implementation.mp4",
    phase: "impl",
    playbackRate: 2.0,
    sourceDuration: 25,
    zoomTarget: { x: 0.65, y: 0.6, scale: 2.2 }, // VS Code terminal: Phase 2 agent launch + phase list
  },
  {
    label: "Write & Validate TF",
    icon: "📦",
    source: "clip-05-write-validate-tf.mp4",
    phase: "impl",
    playbackRate: 3.5,
    sourceDuration: 40,
    zoomTarget: { x: 0.25, y: 0.4, scale: 2.0 }, // Split: main.tf HCL code — S3, CloudFront, encryption (left editor, tight zoom)
  },
  {
    label: "Security Review",
    icon: "⚖️",
    source: "clip-06-security-review.mp4",
    phase: "impl",
    playbackRate: 3.0,
    sourceDuration: 30,
    zoomTarget: { x: 0.3, y: 0.3, scale: 1.7 }, // Split: security-review.md findings (left editor)
  },
  {
    label: "Deploy to HCP TF",
    icon: "🚀",
    source: "clip-07-deploy-hcp-terraform.mp4",
    phase: "impl",
    playbackRate: 2.5,
    sourceDuration: 30,
    zoomTarget: { x: 0.5, y: 0.4, scale: 1.5 }, // Browser: TF Cloud workspace + "Applied" badge + run list
  },
  {
    label: "Policy as Code",
    icon: "🛡️",
    source: "clip-08-policy-as-code.mp4",
    phase: "impl",
    playbackRate: 2.0,
    sourceDuration: 30,
    zoomTarget: { x: 0.35, y: 0.65, scale: 1.7 }, // Browser: "Sentinel policies passed" heading + CIS/FSBP policy sets table
  },
  {
    label: "Report & PR",
    icon: "🔍",
    source: "clip-09-report-pr.mp4",
    phase: "impl",
    playbackRate: 3.0,
    sourceDuration: 35,
    zoomTarget: { x: 0.3, y: 0.3, scale: 1.7 }, // Split: deployment report metrics (left editor)
  },
];

// All clips for iteration (developer input + ring stages)
const ALL_CLIPS = [DEVELOPER_INPUT, ...RING_STAGES];

// Angle for each ring stage (starting from top, going clockwise)
const ringAngle = (i: number) =>
  (i / RING_STAGES.length) * Math.PI * 2 - Math.PI / 2;
const ringX = (i: number) => CX + RADIUS * Math.cos(ringAngle(i));
const ringY = (i: number) => CY + RADIUS * Math.sin(ringAngle(i));

// ════════════════════════════════════════════════════════════════════════════════
// Clip schedule — variable durations per clip
// Developer Input plays during entrance, ring stages follow
// ════════════════════════════════════════════════════════════════════════════════
const FPS = 30;
const CLIP_FADE = 10;

interface ClipScheduleEntry {
  startFrame: number;
  endFrame: number;
  durationFrames: number;
}

function buildClipSchedule(): ClipScheduleEntry[] {
  const schedule: ClipScheduleEntry[] = [];

  // Developer Input: frames 90–390 (10s at 30fps, after entrance)
  const devStart = 90;
  const devSceneSeconds = DEVELOPER_INPUT.sourceDuration / DEVELOPER_INPUT.playbackRate;
  const devFrames = Math.round(devSceneSeconds * FPS);
  schedule.push({
    startFrame: devStart,
    endFrame: devStart + devFrames,
    durationFrames: devFrames,
  });

  // Ring stages start after developer input + gap
  let cursor = devStart + devFrames + 30; // 30 frame gap

  // Plan stages (indices 0-2 in RING_STAGES): Environment, Requirements, Specification
  for (let i = 0; i < 3; i++) {
    const stage = RING_STAGES[i];
    const sceneSeconds = stage.sourceDuration / stage.playbackRate;
    const frames = Math.round(sceneSeconds * FPS);
    schedule.push({
      startFrame: cursor,
      endFrame: cursor + frames,
      durationFrames: frames,
    });
    cursor += frames + 10; // 10 frame gap between clips
  }

  // Gap between plan and impl phases
  cursor += 40;

  // Impl stages (indices 3-8 in RING_STAGES)
  for (let i = 3; i < RING_STAGES.length; i++) {
    const stage = RING_STAGES[i];
    const sceneSeconds = stage.sourceDuration / stage.playbackRate;
    const frames = Math.round(sceneSeconds * FPS);
    schedule.push({
      startFrame: cursor,
      endFrame: cursor + frames,
      durationFrames: frames,
    });
    cursor += frames + 10;
  }

  return schedule;
}

const CLIP_SCHEDULE = buildClipSchedule();

// Total scene duration: last clip end + exit animation
const LAST_CLIP_END = CLIP_SCHEDULE[CLIP_SCHEDULE.length - 1].endFrame;
const CELEBRATION_START = LAST_CLIP_END + 10;
const CELEBRATION_END = CELEBRATION_START + 80;
const EXIT_END = CELEBRATION_END + 120;

// ════════════════════════════════════════════════════════════════════════════════
// Video preview dimensions
// ════════════════════════════════════════════════════════════════════════════════
const PREVIEW_W = 680;
const PREVIEW_H = 383;
const PREVIEW_X = CX - PREVIEW_W / 2;
const PREVIEW_Y = CY - PREVIEW_H / 2 - 30;

export const AGENT_IN_ACTION_DURATION_SECONDS = Math.ceil(EXIT_END / FPS);

// ════════════════════════════════════════════════════════════════════════════════
// Developer Input position — outside ring, top-left with arrow
// ════════════════════════════════════════════════════════════════════════════════
const DEV_INPUT_X = 160;
const DEV_INPUT_Y = 120;

// ════════════════════════════════════════════════════════════════════════════════
// Clip descriptions
// ════════════════════════════════════════════════════════════════════════════════
const CLIP_DESCRIPTIONS = [
  "Defining infrastructure requirements",
  "Validating environment & MCP tools",
  "Gathering requirements & creating issues",
  "Generating specs & running checklists",
  "Launching task executors",
  "Writing & validating Terraform code",
  "Security advisor & code quality review",
  "Deploying to HCP Terraform",
  "Enforcing Sentinel policy checks",
  "Generating report & creating PR",
];

// ════════════════════════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════════════════════════
export const AgentInAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Entrance (0–90) ─────────────────────────────────────────────────────
  const masterFadeIn = interpolate(frame, [0, 30], [0, 1], CLAMP);

  // Ring draw-in animation
  const ringDraw = interpolate(frame, [10, 70], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });

  // AI icon spring at center
  const aiSpring = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.8 },
  });
  const aiScale = interpolate(aiSpring, [0, 1], [0, 1]);
  const aiGlowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.4, 0.8]);

  // Ring stage node stagger
  const stageEntrance = (i: number) => {
    const stagger = 30 + i * 6;
    const s = spring({
      frame: Math.max(0, frame - stagger),
      fps,
      config: { damping: 16, stiffness: 110, mass: 0.6 },
    });
    return interpolate(s, [0, 1], [0, 1]);
  };

  // Developer Input node entrance
  const devInputEntrance = (() => {
    const s = spring({
      frame: Math.max(0, frame - 25),
      fps,
      config: { damping: 14, stiffness: 100, mass: 0.7 },
    });
    return interpolate(s, [0, 1], [0, 1]);
  })();

  // Background glow oscillation
  const glowOpacity = interpolate(Math.sin(frame * 0.04), [-1, 1], [0.04, 0.1]);
  const gridOpacity = interpolate(frame, [0, 40], [0, 0.35], CLAMP);

  // ── Phase labels ────────────────────────────────────────────────────────
  // Plan: clips 1-3 (indices 1-3 in CLIP_SCHEDULE)
  const planStart = CLIP_SCHEDULE[1].startFrame;
  const planEnd = CLIP_SCHEDULE[3].endFrame;
  const planLabelOpacity = interpolate(
    frame,
    [planStart - 20, planStart, planEnd - 20, planEnd],
    [0, 1, 1, 0],
    CLAMP,
  );

  // Impl: clips 4-9 (indices 4-9 in CLIP_SCHEDULE)
  const implStart = CLIP_SCHEDULE[4].startFrame;
  const implEnd = CLIP_SCHEDULE[9].endFrame;
  const implLabelOpacity = interpolate(
    frame,
    [implStart - 20, implStart, implEnd - 20, implEnd],
    [0, 1, 1, 0],
    CLAMP,
  );

  // ── Active clip tracking ──────────────────────────────────────────────
  const getActiveClipIndex = (): number => {
    for (let i = CLIP_SCHEDULE.length - 1; i >= 0; i--) {
      if (frame >= CLIP_SCHEDULE[i].startFrame && frame < CLIP_SCHEDULE[i].endFrame) return i;
    }
    return -1;
  };
  const activeClipIdx = getActiveClipIndex();

  // Map clip index to ring stage index (-1 for developer input which is outside ring)
  const activeRingIdx = activeClipIdx > 0 ? activeClipIdx - 1 : -1;

  // ── Active arc — follows current ring stage ───────────────────────────
  const arcAngle = activeRingIdx >= 0 ? ringAngle(activeRingIdx) : -Math.PI / 2;

  // Energy dot position — smoothly travels between ring stages
  const getEnergyDotAngle = (): number => {
    if (activeRingIdx < 0) return -Math.PI / 2;
    const sched = CLIP_SCHEDULE[activeClipIdx];
    const progress = interpolate(frame, [sched.startFrame, sched.endFrame], [0, 1], CLAMP);
    const nextIdx = Math.min(activeRingIdx + 1, RING_STAGES.length - 1);
    const a1 = ringAngle(activeRingIdx);
    const a2 = ringAngle(nextIdx);
    let diff = a2 - a1;
    if (diff < 0) diff += Math.PI * 2;
    return a1 + diff * progress;
  };
  const energyAngle = getEnergyDotAngle();
  const energyX = CX + RADIUS * Math.cos(energyAngle);
  const energyY = CY + RADIUS * Math.sin(energyAngle);
  const energyVisible = activeRingIdx >= 0 ? 1 : 0;

  // ── Active clip color ──────────────────────────────────────────────────
  const getActiveColor = () => {
    if (activeClipIdx < 0) return PURPLE;
    if (activeClipIdx === 0) return PURPLE; // Developer Input
    const ringStage = RING_STAGES[activeRingIdx];
    if (activeRingIdx === 6) return SKY; // Deploy stage
    return ringStage.phase === "plan" ? PURPLE : INDIGO;
  };
  const activeColor = getActiveColor();

  // ── Celebration ──────────────────────────────────────────────────────
  const celebPulse =
    frame >= CELEBRATION_START && frame < CELEBRATION_END
      ? interpolate(Math.sin((frame - CELEBRATION_START) * 0.3), [-1, 1], [0.8, 1.2])
      : 1;

  // ── Exit ────────────────────────────────────────────────────────
  const exitOpacity = interpolate(frame, [CELEBRATION_END, EXIT_END], [1, 0], CLAMP);
  const exitScale = interpolate(frame, [CELEBRATION_END, EXIT_END], [1, 1.03], CLAMP);

  // ── SVG arc path for active highlight ─────────────────────────────────
  const arcLength = CIRCUMFERENCE * 0.15;
  const arcOffset =
    CIRCUMFERENCE - ((arcAngle + Math.PI / 2) / (Math.PI * 2)) * CIRCUMFERENCE;

  // ── Developer Input active state ──────────────────────────────────────
  const devInputActive = activeClipIdx === 0;
  const devInputGlow = devInputActive
    ? `0 0 20px ${PURPLE}80, 0 0 40px ${PURPLE}40`
    : "none";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: masterFadeIn * exitOpacity,
        overflow: "hidden",
        transform: `scale(${exitScale})`,
        transformOrigin: "center center",
      }}
    >
      {/* ── Background radial glow ──────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 70% at 50% 50%, rgba(123, 66, 188, ${glowOpacity}), transparent 70%)`,
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
      {/* DEVELOPER INPUT — outside ring, top-left trigger node              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: DEV_INPUT_X - 80,
          top: DEV_INPUT_Y - 22,
          width: 160,
          height: 44,
          opacity: devInputEntrance,
          transform: `scale(${devInputEntrance * (devInputActive ? 1.08 : 1)})`,
          transformOrigin: "center center",
          borderRadius: 22,
          border: `2px solid ${devInputActive ? PURPLE : `${PURPLE}50`}`,
          background: devInputActive
            ? `linear-gradient(135deg, ${PURPLE}30, rgba(15, 15, 20, 0.92))`
            : `rgba(15, 15, 20, 0.88)`,
          boxShadow: devInputGlow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>👤</span>
        <span
          style={{
            fontFamily: interFontFamily,
            fontSize: 12,
            fontWeight: 700,
            color: devInputActive ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
            letterSpacing: 0.4,
            whiteSpace: "nowrap",
          }}
        >
          Developer Input
        </span>
      </div>

      {/* Arrow from Developer Input to ring */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        viewBox="0 0 1920 1080"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={`${PURPLE}80`} />
          </marker>
        </defs>
        {/* Curved arrow from dev input node to the ring */}
        <path
          d={`M ${DEV_INPUT_X + 80} ${DEV_INPUT_Y} Q ${DEV_INPUT_X + 200} ${DEV_INPUT_Y + 60} ${ringX(0) - 60} ${ringY(0) - 10}`}
          fill="none"
          stroke={`${PURPLE}60`}
          strokeWidth={2}
          strokeDasharray="6 4"
          markerEnd="url(#arrowhead)"
          opacity={devInputEntrance * 0.7}
        />
      </svg>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SVG RING + ARC + ENERGY DOT                                        */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        viewBox="0 0 1920 1080"
      >
        <defs>
          <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={PURPLE} />
            <stop offset="100%" stopColor={INDIGO} />
          </linearGradient>
          <filter id="glow-ring">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="energy-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base glow ring (fat, blurred) */}
        <circle
          cx={CX}
          cy={CY}
          r={RADIUS}
          fill="none"
          stroke={`rgba(123, 66, 188, 0.08)`}
          strokeWidth={14}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - ringDraw)}
          filter="url(#glow-ring)"
        />

        {/* Base ring (thin, visible) */}
        <circle
          cx={CX}
          cy={CY}
          r={RADIUS}
          fill="none"
          stroke={`rgba(123, 66, 188, 0.25)`}
          strokeWidth={3}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - ringDraw)}
        />

        {/* Active arc highlight */}
        {activeRingIdx >= 0 && (
          <circle
            cx={CX}
            cy={CY}
            r={RADIUS}
            fill="none"
            stroke="url(#arc-gradient)"
            strokeWidth={5}
            strokeDasharray={`${arcLength} ${CIRCUMFERENCE - arcLength}`}
            strokeDashoffset={arcOffset}
            strokeLinecap="round"
            opacity={0.9}
            style={{
              transform: "rotate(0deg)",
              transformOrigin: `${CX}px ${CY}px`,
            }}
          />
        )}

        {/* Energy dot — official Terraform software icon */}
        {energyVisible > 0 && (
          <g
            transform={`translate(${energyX}, ${energyY}) scale(0.04) translate(-256, -256)`}
            opacity={0.95}
            filter="url(#energy-glow)"
          >
            <path d="M37.25 6V163.81l135.905 78.969V84.937L37.25 5.999zm286.717 166.999L188.03 94.093v157.812l135.937 78.968V173zm14.875 157.874V173l135.906-78.906v157.812l-135.906 78.968zm-14.906 175.125L188.03 427.061V269.249l135.906 78.906v157.843z" fill="white" fillRule="nonzero" />
          </g>
        )}
      </svg>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* RING STAGE NODES — 9 stages around the ring                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {RING_STAGES.map((stage, i) => {
        const progress = stageEntrance(i);
        const x = ringX(i);
        const y = ringY(i);
        const isActive = i === activeRingIdx;
        const isCelebrating = frame >= CELEBRATION_START && frame < CELEBRATION_END;
        const nodeColor = i === 6 ? SKY : stage.phase === "plan" ? PURPLE : INDIGO;
        const borderColor = isActive ? nodeColor : `rgba(123, 66, 188, 0.35)`;
        const glowStr = isActive
          ? `0 0 20px ${nodeColor}80, 0 0 40px ${nodeColor}40`
          : "none";

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 70,
              top: y - 18,
              width: 140,
              height: 36,
              opacity: progress,
              transform: `scale(${progress * (isCelebrating ? celebPulse : isActive ? 1.08 : 1)})`,
              transformOrigin: "center center",
              borderRadius: 18,
              border: `1.5px solid ${borderColor}`,
              background: isActive
                ? `linear-gradient(135deg, ${nodeColor}30, rgba(15, 15, 20, 0.92))`
                : `rgba(15, 15, 20, 0.88)`,
              boxShadow: glowStr,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 14 }}>{stage.icon}</span>
            <span
              style={{
                fontFamily: interFontFamily,
                fontSize: 11,
                fontWeight: 600,
                color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                letterSpacing: 0.3,
                whiteSpace: "nowrap",
              }}
            >
              {stage.label}
            </span>
          </div>
        );
      })}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* AI AGENT ICON — center                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: CX - 40,
          top: CY - PREVIEW_H / 2 - 90,
          width: 80,
          height: 80,
          opacity: aiScale,
          transform: `scale(${aiScale})`,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${PURPLE}40, ${INDIGO}40)`,
            border: `2px solid ${PURPLE}80`,
            boxShadow: `0 0 ${30 * aiGlowPulse}px ${PURPLE}60, 0 0 ${60 * aiGlowPulse}px ${PURPLE}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
          }}
        >
          🤖
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* VIDEO PREVIEW CONTAINER — centered inside ring                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: PREVIEW_X,
          top: PREVIEW_Y,
          width: PREVIEW_W,
          height: PREVIEW_H,
          borderRadius: 12,
          overflow: "hidden",
          border: `1.5px solid ${activeColor}80`,
          boxShadow: `0 0 30px ${activeColor}40, 0 0 60px ${activeColor}20`,
        }}
      >
        {ALL_CLIPS.map((clip, i) => {
          const sched = CLIP_SCHEDULE[i];
          const clipOpacity = interpolate(
            frame,
            [
              sched.startFrame,
              sched.startFrame + CLIP_FADE,
              sched.endFrame - CLIP_FADE,
              sched.endFrame,
            ],
            [0, 1, 1, 0],
            CLAMP,
          );

          // Smooth zoom effect: scale from 1.0 to zoomTarget.scale
          const clipProgress = interpolate(
            frame,
            [sched.startFrame, sched.endFrame],
            [0, 1],
            CLAMP,
          );
          const zoomScale = interpolate(clipProgress, [0, 1], [1.0, clip.zoomTarget.scale], {
            ...CLAMP,
            easing: Easing.inOut(Easing.cubic),
          });
          // Derive translate directly from current scale so target stays centered
          // Using translate() scale() order: result = scale(p - center) + center + translate
          // To center (nx,ny): tx = -scale * (nx - 0.5) * W
          const zoomTranslateX = -zoomScale * (clip.zoomTarget.x - 0.5) * PREVIEW_W;
          const zoomTranslateY = -zoomScale * (clip.zoomTarget.y - 0.5) * PREVIEW_H;

          if (frame < sched.startFrame - 5 || frame > sched.endFrame + 5) return null;

          return (
            <Sequence
              key={i}
              from={sched.startFrame}
              durationInFrames={sched.endFrame - sched.startFrame}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: clipOpacity,
                }}
              >
                <Video
                  src={staticFile(clip.source)}
                  playbackRate={clip.playbackRate}
                  muted
                  loop
                  style={{
                    width: PREVIEW_W,
                    height: PREVIEW_H,
                    objectFit: "cover",
                    transform: `translate(${zoomTranslateX}px, ${zoomTranslateY}px) scale(${zoomScale})`,
                    transformOrigin: "center center",
                  }}
                />
              </div>
            </Sequence>
          );
        })}

        {/* Clip label overlay at bottom */}
        {activeClipIdx >= 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "8px 16px",
              background: "linear-gradient(transparent, rgba(0, 0, 0, 0.8))",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 14 }}>{ALL_CLIPS[activeClipIdx].icon}</span>
            <span
              style={{
                fontFamily: interFontFamily,
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.9)",
                letterSpacing: 0.3,
              }}
            >
              {CLIP_DESCRIPTIONS[activeClipIdx]}
            </span>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PHASE LABELS                                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          left: CX - 100,
          top: CY + PREVIEW_H / 2 + 10,
          width: 200,
          textAlign: "center",
          opacity: planLabelOpacity,
        }}
      >
        <span
          style={{
            fontFamily: interFontFamily,
            fontSize: 14,
            fontWeight: 700,
            color: PURPLE,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Planning
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: CX - 120,
          top: CY + PREVIEW_H / 2 + 10,
          width: 240,
          textAlign: "center",
          opacity: implLabelOpacity,
        }}
      >
        <span
          style={{
            fontFamily: interFontFamily,
            fontSize: 14,
            fontWeight: 700,
            color: INDIGO,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Implementation
        </span>
      </div>
    </AbsoluteFill>
  );
};
