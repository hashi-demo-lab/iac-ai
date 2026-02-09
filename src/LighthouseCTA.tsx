import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: interFontFamily } = loadInter("normal", {
  subsets: ["latin"],
  weights: ["300", "400", "700", "800"],
});

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PURPLE = "#7B42BC";
const BG = "#0a0a0a";

export const LIGHTHOUSE_CTA_DURATION_SECONDS = 10;

export const LighthouseCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Master fade in / out ────────────────────────────────────────────
  const masterFadeIn = interpolate(frame, [0, 30], [0, 1], CLAMP);
  const exitOpacity = interpolate(frame, [270, 300], [1, 0], CLAMP);

  // ── Background glow pulse ──────────────────────────────────────────
  const glowOpacity = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0.04, 0.12],
  );
  const gridOpacity = interpolate(frame, [0, 40], [0, 0.35], CLAMP);

  // ── Lighthouse beam sweep — continuous rotation ────────────────────
  const beamAngle = interpolate(frame, [0, 300], [-30, 390], {
    ...CLAMP,
    easing: Easing.linear,
  });
  const beamPulse = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.5, 1.0],
  );

  // ── Lighthouse entrance ────────────────────────────────────────────
  const lighthouseSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 14, stiffness: 70, mass: 1.0 },
  });
  const lighthouseScale = interpolate(lighthouseSpring, [0, 1], [0.6, 1.0]);
  const lighthouseOpacity = interpolate(frame, [15, 40], [0, 1], CLAMP);

  // ── Title entrance ─────────────────────────────────────────────────
  const titleSpring = spring({
    frame: Math.max(0, frame - 50),
    fps,
    config: { damping: 16, stiffness: 80, mass: 0.8 },
  });
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // ── "Lighthouse Program" entrance ──────────────────────────────────
  const programSpring = spring({
    frame: Math.max(0, frame - 75),
    fps,
    config: { damping: 18, stiffness: 80, mass: 0.8 },
  });
  const programLetterSpacing = interpolate(programSpring, [0, 1], [12, 4]);
  const programOpacity = interpolate(programSpring, [0, 1], [0, 1]);

  // ── Accent line ────────────────────────────────────────────────────
  const lineWidth = interpolate(frame, [85, 130], [0, 500], {
    ...CLAMP,
    easing: Easing.out(Easing.exp),
  });

  // ── URL entrance ───────────────────────────────────────────────────
  const urlSpring = spring({
    frame: Math.max(0, frame - 110),
    fps,
    config: { damping: 18, stiffness: 80, mass: 0.8 },
  });
  const urlScale = interpolate(urlSpring, [0, 1], [0.9, 1.0]);
  const urlOpacity = interpolate(urlSpring, [0, 1], [0, 1]);

  // ── HashiCorp logo entrance ────────────────────────────────────────
  const hashiOpacity = interpolate(frame, [130, 160], [0, 0.7], CLAMP);

  // ── Lighthouse position ────────────────────────────────────────────
  const LH_X = 960;
  const LH_Y = 280;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
        opacity: masterFadeIn * exitOpacity,
        overflow: "hidden",
      }}
    >
      {/* ── Background radial glow ──────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% 30%, rgba(123, 66, 188, ${glowOpacity}), transparent 70%)`,
        }}
      />

      {/* ── Ambient dot grid ────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(rgba(123, 66, 188, 0.06) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          opacity: gridOpacity,
        }}
      />

      {/* ── Lighthouse beam (behind lighthouse) ─────────────────── */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0 }}
        viewBox="0 0 1920 1080"
      >
        <defs>
          <linearGradient id="beam-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={PURPLE} stopOpacity={0.6 * beamPulse} />
            <stop offset="100%" stopColor={PURPLE} stopOpacity={0} />
          </linearGradient>
          <clipPath id="beam-clip">
            <rect x="0" y="0" width="1920" height="1080" />
          </clipPath>
        </defs>
        <g
          clipPath="url(#beam-clip)"
          opacity={lighthouseOpacity * 0.7}
        >
          {/* Primary beam */}
          <polygon
            points={`${LH_X},${LH_Y - 50} ${LH_X - 120},${-200} ${LH_X + 120},${-200}`}
            fill="url(#beam-grad)"
            transform={`rotate(${beamAngle}, ${LH_X}, ${LH_Y - 50})`}
          />
          {/* Secondary beam (opposite) */}
          <polygon
            points={`${LH_X},${LH_Y - 50} ${LH_X - 80},${-200} ${LH_X + 80},${-200}`}
            fill="url(#beam-grad)"
            opacity={0.4}
            transform={`rotate(${beamAngle + 180}, ${LH_X}, ${LH_Y - 50})`}
          />
        </g>
      </svg>

      {/* ── Animated Lighthouse SVG ─────────────────────────────── */}
      <svg
        width={120}
        height={200}
        viewBox="0 0 120 200"
        style={{
          position: "absolute",
          left: LH_X - 60,
          top: LH_Y - 100,
          opacity: lighthouseOpacity,
          transform: `scale(${lighthouseScale})`,
          transformOrigin: "center bottom",
          filter: `drop-shadow(0 0 20px ${PURPLE}80) drop-shadow(0 0 50px ${PURPLE}40)`,
        }}
      >
        {/* Tower base (wider) */}
        <polygon
          points="35,195 85,195 78,80 42,80"
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1.5}
        />
        {/* Tower stripes */}
        <polygon
          points="40,170 80,170 79,150 41,150"
          fill={`${PURPLE}40`}
        />
        <polygon
          points="43,130 77,130 76,110 44,110"
          fill={`${PURPLE}40`}
        />

        {/* Lamp room */}
        <rect
          x={38}
          y={65}
          width={44}
          height={20}
          rx={3}
          fill="rgba(255,255,255,0.15)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1.5}
        />

        {/* Lamp glow */}
        <circle
          cx={60}
          cy={75}
          r={8}
          fill={PURPLE}
          opacity={beamPulse}
        >
        </circle>
        <circle
          cx={60}
          cy={75}
          r={14}
          fill="none"
          stroke={PURPLE}
          strokeWidth={1}
          opacity={beamPulse * 0.5}
        />

        {/* Gallery / railing */}
        <line x1={34} y1={65} x2={86} y2={65} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
        <line x1={36} y1={65} x2={36} y2={60} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
        <line x1={60} y1={65} x2={60} y2={60} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
        <line x1={84} y1={65} x2={84} y2={60} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
        <line x1={34} y1={60} x2={86} y2={60} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />

        {/* Dome / cap */}
        <path
          d="M 44,65 Q 60,40 76,65"
          fill="rgba(255,255,255,0.1)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1.5}
        />

        {/* Pinnacle */}
        <line x1={60} y1={43} x2={60} y2={32} stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
        <circle cx={60} cy={30} r={3} fill={PURPLE} opacity={0.8} />

        {/* Base platform */}
        <rect
          x={28}
          y={195}
          width={64}
          height={5}
          rx={2}
          fill="rgba(255,255,255,0.15)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={1}
        />
      </svg>

      {/* ── Title text ──────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: LH_Y + 130,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        {/* "AI DRIVEN INFRASTRUCTURE" */}
        <div
          style={{
            fontFamily: interFontFamily,
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            textTransform: "uppercase" as const,
            letterSpacing: 3,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textShadow: `0 0 30px rgba(123, 66, 188, 0.4), 0 0 80px rgba(123, 66, 188, 0.2)`,
            marginBottom: 16,
          }}
        >
          AI Driven Infrastructure
        </div>

        {/* "LIGHTHOUSE PROGRAM" */}
        <div
          style={{
            fontFamily: interFontFamily,
            fontSize: 38,
            fontWeight: 300,
            color: PURPLE,
            textTransform: "uppercase" as const,
            letterSpacing: programLetterSpacing,
            opacity: programOpacity,
            marginBottom: 32,
          }}
        >
          Lighthouse Program
        </div>

        {/* Accent line */}
        <div
          style={{
            width: lineWidth,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${PURPLE}, transparent)`,
            boxShadow: `0 0 12px rgba(123, 66, 188, 0.5)`,
            marginBottom: 40,
          }}
        />

        {/* URL CTA */}
        <div
          style={{
            opacity: urlOpacity,
            transform: `scale(${urlScale})`,
            padding: "16px 48px",
            borderRadius: 12,
            border: `1.5px solid ${PURPLE}60`,
            background: `linear-gradient(135deg, ${PURPLE}15, rgba(15, 15, 20, 0.9))`,
            boxShadow: `0 0 30px ${PURPLE}30, 0 0 60px ${PURPLE}15`,
          }}
        >
          <span
            style={{
              fontFamily: interFontFamily,
              fontSize: 36,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: 2,
            }}
          >
            go.hashi.co/tfai
          </span>
        </div>
      </div>

      {/* ── HashiCorp footer logo ───────────────────────────────── */}
      <Img
        src={staticFile("hashicorp-logo.svg")}
        style={{
          position: "absolute",
          bottom: 50,
          width: 260,
          opacity: hashiOpacity * exitOpacity,
        }}
      />
    </AbsoluteFill>
  );
};
