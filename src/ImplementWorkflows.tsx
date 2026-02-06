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

// Gradient line colors — inspired by the HCP brand rainbow
const LINE_COLORS = [
  "#E04E98", // pink
  "#C850C0", // magenta
  "#9B59B6", // purple
  "#7B42BC", // hcp purple
  "#6366F1", // indigo
  "#4F8CF5", // blue
  "#38BDF8", // sky
];

export const IMPLEMENT_DURATION_SECONDS = 20;

export const ImplementWorkflows: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ════════════════════════════════════════════════════════════════════
  // FADE IN (frames 0–40)
  // ════════════════════════════════════════════════════════════════════
  const masterFadeIn = interpolate(frame, [0, 40], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════
  // GRADIENT LINES — animate from top-right, curving down
  // Each line draws in with a staggered delay
  // ════════════════════════════════════════════════════════════════════
  const linesProgress = LINE_COLORS.map((_, i) => {
    const delay = 15 + i * 8;
    return interpolate(frame, [delay, delay + 60], [0, 1], {
      ...CLAMP,
      easing: Easing.out(Easing.exp),
    });
  });

  const linesOpacity = interpolate(frame, [15, 35], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════
  // "Demo — Terraform Implement" label — fades in above title (frame 25)
  // ════════════════════════════════════════════════════════════════════
  const demoSpring = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: { damping: 18, stiffness: 80, mass: 0.8 },
  });
  const demoY = interpolate(demoSpring, [0, 1], [40, 0]);
  const demoOpacity = interpolate(frame, [25, 50], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════
  // "AI Accelerated" — slides up after Demo (frame 32)
  // ════════════════════════════════════════════════════════════════════
  const accelSpring = spring({
    frame: Math.max(0, frame - 32),
    fps,
    config: { damping: 17, stiffness: 80, mass: 0.9 },
  });
  const accelY = interpolate(accelSpring, [0, 1], [50, 0]);
  const accelOpacity = interpolate(frame, [32, 58], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════
  // "Application Team" — slides up from bottom-left (frame 40)
  // ════════════════════════════════════════════════════════════════════
  const titleSpring = spring({
    frame: Math.max(0, frame - 40),
    fps,
    config: { damping: 16, stiffness: 80, mass: 1.0 },
  });
  const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
  const titleOpacity = interpolate(frame, [40, 70], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════
  // "Consumer Workflows" — slides up after title (frame 65)
  // ════════════════════════════════════════════════════════════════════
  const subtitleSpring = spring({
    frame: Math.max(0, frame - 65),
    fps,
    config: { damping: 16, stiffness: 80, mass: 1.0 },
  });
  const subtitleY = interpolate(subtitleSpring, [0, 1], [50, 0]);
  const subtitleOpacity = interpolate(frame, [65, 95], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════
  // Accent line beneath titles (frame 100)
  // ════════════════════════════════════════════════════════════════════
  const accentWidth = interpolate(frame, [100, 155], [0, 500], {
    ...CLAMP,
    easing: Easing.out(Easing.exp),
  });
  const accentOpacity = interpolate(frame, [100, 115], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════
  // Description points — staggered clipPath reveals
  // ════════════════════════════════════════════════════════════════════
  const points = [
    { text: "Automated Terraform code generation", enter: 120 },
    { text: "Pre-commit security validation (TFLint, Trivy, Vault Radar)", enter: 148 },
    { text: "Sandbox testing with HCP Terraform", enter: 176 },
    { text: "Enterprise compliance with Sentinel policies", enter: 204 },
  ];

  // ════════════════════════════════════════════════════════════════════
  // EXIT (last 60 frames)
  // ════════════════════════════════════════════════════════════════════
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 60, durationInFrames],
    [1, 0],
    CLAMP,
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity: masterFadeIn * exitOpacity,
        overflow: "hidden",
      }}
    >
      {/* ── Gradient lines — top-right curved decoration ─────────── */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, opacity: linesOpacity }}
      >
        {LINE_COLORS.map((color, i) => {
          const offset = i * 28;
          const progress = linesProgress[i];
          const startX = 1100 + offset;
          const startY = -50;
          const ctrlX = 1350 + offset;
          const ctrlY = 400;
          const endX = 1920 + 50;
          const endY = 750 + offset * 1.5;
          const path = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;

          return (
            <path
              key={i}
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - progress}
              opacity={0.7 + 0.3 * progress}
              style={{
                filter: `drop-shadow(0 0 8px ${color})`,
              }}
            />
          );
        })}
      </svg>

      {/* ── Content — bottom-left aligned ────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 100,
          bottom: 140,
          maxWidth: 900,
        }}
      >
        {/* "Demo — Terraform Implement" label */}
        <div
          style={{
            fontFamily: interFontFamily,
            fontSize: 38,
            fontWeight: 600,
            color: "#7B42BC",
            letterSpacing: 4,
            textTransform: "uppercase" as const,
            opacity: demoOpacity,
            transform: `translateY(${demoY}px)`,
            marginBottom: 12,
          }}
        >
          Demo &mdash; Terraform Implement
        </div>

        {/* "AI Accelerated" */}
        <div
          style={{
            fontFamily: interFontFamily,
            fontSize: 52,
            fontWeight: 700,
            color: "rgba(255, 255, 255, 0.9)",
            lineHeight: 1.1,
            opacity: accelOpacity,
            transform: `translateY(${accelY}px)`,
            marginBottom: 10,
          }}
        >
          AI Accelerated
        </div>

        {/* "Application Team" */}
        <div
          style={{
            fontFamily: interFontFamily,
            fontSize: 82,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.1,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          Application Team
        </div>

        {/* "Consumer Workflows" */}
        <div
          style={{
            fontFamily: interFontFamily,
            fontSize: 82,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.1,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            marginTop: 8,
          }}
        >
          Consumer Workflows
        </div>

        {/* Accent line */}
        <div
          style={{
            width: accentWidth,
            height: 3,
            opacity: accentOpacity,
            background: `linear-gradient(90deg, #7B42BC, #6366F1, #38BDF8, transparent)`,
            boxShadow: `0 0 14px rgba(123, 66, 188, 0.5)`,
            borderRadius: 2,
            marginTop: 30,
            marginBottom: 36,
          }}
        />

        {/* Description points */}
        {points.map((point, i) => {
          const reveal = interpolate(
            frame,
            [point.enter, point.enter + 35],
            [0, 100],
            { ...CLAMP, easing: Easing.out(Easing.exp) },
          );
          const pointOpacity = interpolate(
            frame,
            [point.enter, point.enter + 18],
            [0, 1],
            CLAMP,
          );
          const pointBlur = interpolate(
            frame,
            [point.enter, point.enter + 18],
            [6, 0],
            CLAMP,
          );

          return (
            <div
              key={i}
              style={{
                fontFamily: interFontFamily,
                fontSize: 30,
                fontWeight: 300,
                color: "rgba(255, 255, 255, 0.8)",
                lineHeight: 1.6,
                opacity: pointOpacity,
                clipPath: `inset(0 ${100 - reveal}% 0 0)`,
                filter: `blur(${pointBlur}px)`,
                marginBottom: 8,
              }}
            >
              {point.text}
            </div>
          );
        })}
      </div>

    </AbsoluteFill>
  );
};
