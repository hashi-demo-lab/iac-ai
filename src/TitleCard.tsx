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
const BLUE = "#4290F5";
const BG = "#0a0a0a";

// Agent logo flyover config
const AGENT_LOGOS = [
  {
    src: "coding_logo/cc.png",
    enterFrame: 415,
    fromLeft: true,
    yCenter: 720, // lower area
  },
  {
    src: "coding_logo/copilot2.png",
    enterFrame: 428,
    fromLeft: false,
    yCenter: 600, // mid-lower area
  },
  {
    src: "coding_logo/cursor.png",
    enterFrame: 441,
    fromLeft: true,
    yCenter: 480, // mid area
  },
  {
    src: "coding_logo/bob.jpg",
    enterFrame: 454,
    fromLeft: false,
    yCenter: 370, // mid-upper area
  },
  {
    src: "coding_logo/codex.png",
    enterFrame: 467,
    fromLeft: true,
    yCenter: 270, // upper area
  },
] as const;

const LOGO_TRAVERSE_FRAMES = 60; // 2s at 30fps

// Rapid approach + lazy drift — one continuous arc per logo
// Logos enter fast from edges, decelerate near center, then drift off
const RAPID_START = 530;
const RAPID_STAGGER = 4;
const RAPID_PATHS = [
  { fromLeft: true, yEnter: 340, pauseX: 800, approach: 26, driftAngle: -2.1, driftSpeed: 280, wobbleFreq: 0.09, wobbleAmp: 20, spin: 40 },
  { fromLeft: false, yEnter: 540, pauseX: 1100, approach: 24, driftAngle: 0.6, driftSpeed: 240, wobbleFreq: 0.11, wobbleAmp: 18, spin: -55 },
  { fromLeft: true, yEnter: 240, pauseX: 870, approach: 28, driftAngle: -0.7, driftSpeed: 300, wobbleFreq: 0.07, wobbleAmp: 24, spin: 30 },
  { fromLeft: false, yEnter: 650, pauseX: 1050, approach: 22, driftAngle: 2.3, driftSpeed: 250, wobbleFreq: 0.1, wobbleAmp: 20, spin: -35 },
  { fromLeft: true, yEnter: 440, pauseX: 920, approach: 26, driftAngle: 3.4, driftSpeed: 270, wobbleFreq: 0.08, wobbleAmp: 22, spin: 45 },
];
const DRIFT_FRAMES = 45;

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ════════════════════════════════════════════════════════════════════
  // FADE IN FROM BLACK (frames 0–45)
  // ════════════════════════════════════════════════════════════════════
  const masterFadeIn = interpolate(frame, [0, 45], [0, 1], CLAMP);

  // ════════════════════════════════════════════════════════════════════
  // BEAT 1: THE HOOK (frames 0–150)
  // ════════════════════════════════════════════════════════════════════

  // Background radial glow — subtle pulse via sine wave
  const beat1GlowOpacity = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0.03, 0.07],
  );

  // Scanner line — sweeps top to bottom over frames 15–100
  const scannerY = interpolate(frame, [15, 100], [-50, 1130], {
    ...CLAMP,
    easing: Easing.inOut(Easing.exp),
  });
  const scannerOpacity = interpolate(frame, [15, 25, 85, 100], [0, 1, 1, 0], CLAMP);

  // "WEEKS → HOURS" — spring scale + blur + tracking (starts frame 35)
  const hookTextSpring = spring({
    frame: Math.max(0, frame - 35),
    fps,
    config: { damping: 14, stiffness: 80, mass: 1.0 },
  });
  const hookScale = interpolate(hookTextSpring, [0, 1], [1.3, 1.0]);
  const hookBlur = interpolate(hookTextSpring, [0, 1], [8, 0]);
  const hookLetterSpacing = interpolate(hookTextSpring, [0, 1], [12, 4]);
  const hookOpacity = interpolate(frame, [35, 55], [0, 1], CLAMP);

  // Subtitle — spring entrance (starts frame 65)
  const subtitleSpring = spring({
    frame: Math.max(0, frame - 65),
    fps,
    config: { damping: 18, stiffness: 80, mass: 0.8 },
  });
  const subtitleY = interpolate(subtitleSpring, [0, 1], [20, 0]);
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 1]);

  // Beat 1 exit — fade out + scale down (frames 120–150)
  const beat1ExitOpacity = interpolate(frame, [120, 150], [1, 0], CLAMP);
  const beat1ExitScale = interpolate(frame, [120, 150], [1.0, 0.95], CLAMP);

  // Combined beat 1 visibility
  const showBeat1 = frame < 155;
  const beat1Opacity = Math.min(hookOpacity, beat1ExitOpacity);

  // ════════════════════════════════════════════════════════════════════
  // BEAT 2: TITLE REVEAL (frames 155–340)
  // ════════════════════════════════════════════════════════════════════

  // Background glow intensifies
  const beat2GlowOpacity = interpolate(frame, [155, 230], [0.05, 0.12], CLAMP);

  // Terraform logo — spring bounce entrance (starts frame 155)
  const logoSpring = spring({
    frame: Math.max(0, frame - 155),
    fps,
    config: { damping: 14, stiffness: 80, mass: 1.0 },
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.7, 1.0]);
  const logoOpacity = interpolate(frame, [155, 175], [0, 1], CLAMP);

  // Horizontal accent line — width expands (frames 185–240)
  const lineWidth = interpolate(frame, [185, 240], [0, 400], {
    ...CLAMP,
    easing: Easing.out(Easing.exp),
  });
  const lineOpacity = interpolate(frame, [185, 200], [0, 1], CLAMP);

  // "AI DRIVEN INFRASTRUCTURE" — clipPath reveal from left (frames 200–245)
  const titleRevealProgress = interpolate(frame, [200, 245], [0, 100], {
    ...CLAMP,
    easing: Easing.out(Easing.exp),
  });

  // "Leveraging Agentic Workflows" — fade in + letter spacing (frames 240–275)
  const subTitleOpacity = interpolate(frame, [240, 275], [0, 1], CLAMP);
  const subTitleLetterSpacing = interpolate(frame, [240, 275], [8, 2], {
    ...CLAMP,
    easing: Easing.out(Easing.exp),
  });

  // HashiCorp footer logo — fade in (frames 270–300)
  const hashiOpacity = interpolate(frame, [270, 300], [0, 0.7], CLAMP);

  // Beat 2 visibility
  const showBeat2 = frame >= 155;

  // ════════════════════════════════════════════════════════════════════
  // BEAT 2.5: HOLD (frames 340–410)
  // Title holds, background glow gently pulses
  // ════════════════════════════════════════════════════════════════════

  const holdGlowPulse = interpolate(
    Math.sin((frame - 340) * 0.06),
    [-1, 1],
    [0.10, 0.14],
  );

  // ════════════════════════════════════════════════════════════════════
  // BEAT 3: AGENT LOGO FLYOVERS (frames 410–510)
  // Title dims, agent logos fly across the screen
  // ════════════════════════════════════════════════════════════════════

  // Dim title content during flyovers + whirlwind
  const titleDimOpacity = interpolate(
    frame,
    [405, 420, 615, 630],
    [1.0, 0.35, 0.35, 1.0],
    CLAMP,
  );

  // "Powered by AI Coding Agents" text
  const poweredTextOpacity = interpolate(
    frame,
    [420, 440, 610, 625],
    [0, 0.8, 0.8, 0],
    CLAMP,
  );

  // ════════════════════════════════════════════════════════════════════
  // BEAT 4: EXIT (frames 510–545)
  // ════════════════════════════════════════════════════════════════════

  const exitScale = interpolate(frame, [630, 660], [1.0, 1.03], {
    ...CLAMP,
    easing: Easing.in(Easing.exp),
  });
  const exitOpacity = interpolate(frame, [630, 660], [1, 0], {
    ...CLAMP,
    easing: Easing.in(Easing.exp),
  });

  // (rapid approach + drift is computed inline in the JSX below)

  // Background glow — phase-aware
  let bgGlowOpacity: number;
  if (frame < 155) {
    bgGlowOpacity = beat1GlowOpacity;
  } else if (frame < 340) {
    bgGlowOpacity = beat2GlowOpacity;
  } else {
    // Hold + flyover phases: gentle pulse
    bgGlowOpacity = holdGlowPulse;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
        opacity: masterFadeIn * exitOpacity,
        transform: `scale(${exitScale})`,
        overflow: "hidden",
      }}
    >
      {/* ── Background radial glow ──────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(123, 66, 188, ${bgGlowOpacity}), transparent 70%)`,
        }}
      />

      {/* ── Ambient particle grid (subtle depth) ────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(rgba(123, 66, 188, 0.08) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          opacity: interpolate(frame, [0, 90], [0, 0.4], CLAMP),
        }}
      />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* BEAT 1: THE HOOK                                          */}
      {/* ══════════════════════════════════════════════════════════ */}
      {showBeat1 && (
        <>
          {/* Scanner / energy line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 2,
              transform: `translateY(${scannerY}px)`,
              opacity: scannerOpacity,
              background: `linear-gradient(90deg, transparent 0%, ${PURPLE} 20%, ${PURPLE} 80%, transparent 100%)`,
              boxShadow: `0 0 20px ${PURPLE}, 0 0 60px ${PURPLE}, 0 0 120px rgba(123, 66, 188, 0.4)`,
            }}
          />

          {/* Hook text group */}
          <div
            style={{
              position: "absolute",
              textAlign: "center",
              opacity: beat1Opacity,
              transform: `scale(${beat1ExitScale})`,
            }}
          >
            {/* "WEEKS → HOURS" */}
            <div
              style={{
                fontFamily: interFontFamily,
                fontSize: 100,
                fontWeight: 800,
                color: "#ffffff",
                textTransform: "uppercase" as const,
                letterSpacing: hookLetterSpacing,
                transform: `scale(${hookScale})`,
                filter: `blur(${hookBlur}px)`,
                textShadow: `0 0 30px rgba(123, 66, 188, 0.6), 0 0 80px rgba(123, 66, 188, 0.3)`,
                marginBottom: 24,
              }}
            >
              WEEKS → HOURS
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontFamily: interFontFamily,
                fontSize: 32,
                fontWeight: 300,
                color: "#999999",
                letterSpacing: 1,
                opacity: subtitleOpacity,
                transform: `translateY(${subtitleY}px)`,
              }}
            >
              reimagining the entire IaC workflow
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* BEAT 2 + 2.5: TITLE REVEAL & HOLD                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      {showBeat2 && (
        <>
          <div
            style={{
              position: "absolute",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: titleDimOpacity,
            }}
          >
            {/* Terraform logo */}
            <div
              style={{
                opacity: logoOpacity,
                transform: `scale(${logoScale})`,
                marginBottom: 40,
                padding: "12px 20px",
                borderRadius: 8,
                boxShadow: `0 0 40px rgba(123, 66, 188, 0.3), 0 0 80px rgba(123, 66, 188, 0.15)`,
              }}
            >
              <Img
                src={staticFile("terraform-logo.svg")}
                style={{ width: 380, display: "block" }}
              />
            </div>

            {/* Horizontal accent line */}
            <div
              style={{
                width: lineWidth,
                height: 1,
                opacity: lineOpacity,
                background: `linear-gradient(90deg, transparent, ${PURPLE}, transparent)`,
                boxShadow: `0 0 12px rgba(123, 66, 188, 0.5)`,
                marginBottom: 40,
              }}
            />

            {/* "AI DRIVEN INFRASTRUCTURE" — clipPath reveal */}
            <div
              style={{
                fontFamily: interFontFamily,
                fontSize: 88,
                fontWeight: 700,
                color: "#ffffff",
                textTransform: "uppercase" as const,
                letterSpacing: 3,
                clipPath: `inset(0 ${100 - titleRevealProgress}% 0 0)`,
                textShadow: `0 0 20px rgba(255, 255, 255, 0.15), 0 0 60px rgba(123, 66, 188, 0.2)`,
                marginBottom: 24,
                lineHeight: 1.1,
              }}
            >
              AI DRIVEN INFRASTRUCTURE
            </div>

            {/* "Leveraging Agentic Workflows" */}
            <div
              style={{
                fontFamily: interFontFamily,
                fontSize: 34,
                fontWeight: 300,
                color: PURPLE,
                letterSpacing: subTitleLetterSpacing,
                opacity: subTitleOpacity,
              }}
            >
              Leveraging Agentic Workflows
            </div>
          </div>

          {/* HashiCorp footer logo */}
          <Img
            src={staticFile("hashicorp-logo.svg")}
            style={{
              position: "absolute",
              bottom: 50,
              width: 260,
              opacity: hashiOpacity * titleDimOpacity,
            }}
          />
        </>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* BEAT 3: AGENT LOGO FLYOVERS (frames 330–420)              */}
      {/* ══════════════════════════════════════════════════════════ */}
      {frame >= 410 && frame <= 650 && (
        <>
          {AGENT_LOGOS.map((logo, i) => {
            const localFrame = frame - logo.enterFrame;
            if (localFrame < -5 || localFrame > LOGO_TRAVERSE_FRAMES + 5) {
              return null;
            }

            const progress = interpolate(
              localFrame,
              [0, LOGO_TRAVERSE_FRAMES],
              [0, 1],
              { ...CLAMP, easing: Easing.inOut(Easing.quad) },
            );

            // X position: traverse the full width
            const startX = logo.fromLeft ? -180 : 1920 + 180;
            const endX = logo.fromLeft ? 1920 + 180 : -180;
            const x = interpolate(progress, [0, 1], [startX, endX]);

            // Gentle sine-wave vertical float
            const yFloat = Math.sin(localFrame * 0.15) * 12;
            const y = logo.yCenter + yFloat;

            // Spring-driven scale entrance
            const scaleSpring = spring({
              frame: Math.max(0, localFrame),
              fps,
              config: { damping: 20, stiffness: 80, mass: 0.6 },
            });
            const scale = interpolate(scaleSpring, [0, 1], [0.6, 1.0]);

            // Slight rotation shift
            const rotation = interpolate(
              localFrame,
              [0, LOGO_TRAVERSE_FRAMES],
              [-8, 5],
              CLAMP,
            );

            // Fade in over first 15 frames, fade out over last 15
            const fadeIn = interpolate(localFrame, [0, 15], [0, 1], CLAMP);
            const fadeOut = interpolate(
              localFrame,
              [LOGO_TRAVERSE_FRAMES - 15, LOGO_TRAVERSE_FRAMES],
              [1, 0],
              CLAMP,
            );
            const opacity = Math.min(fadeIn, fadeOut);

            // Purple glow peaks at midpoint
            const glowIntensity = interpolate(
              localFrame,
              [0, LOGO_TRAVERSE_FRAMES / 2, LOGO_TRAVERSE_FRAMES],
              [0.2, 1.0, 0.2],
              CLAMP,
            );

            return (
              <Img
                key={i}
                src={staticFile(logo.src)}
                style={{
                  position: "absolute",
                  width: 120,
                  height: 120,
                  objectFit: "contain",
                  left: x,
                  top: y,
                  opacity,
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  filter: `drop-shadow(0 0 ${20 * glowIntensity}px rgba(123, 66, 188, ${0.6 * glowIntensity})) drop-shadow(0 0 ${40 * glowIntensity}px rgba(123, 66, 188, ${0.3 * glowIntensity}))`,
                }}
              />
            );
          })}

          {/* ── Continuous arc: rapid approach → lazy drift ─── */}
          {AGENT_LOGOS.map((logo, i) => {
            const path = RAPID_PATHS[i];
            const enterFrame = RAPID_START + i * RAPID_STAGGER;
            const totalFrames = path.approach + DRIFT_FRAMES;
            const localFrame = frame - enterFrame;
            if (localFrame < -3 || localFrame > totalFrames + 3) {
              return null;
            }

            // ── Phase 1: Approach — fast entry, decelerating ──
            const approachT = interpolate(
              localFrame,
              [0, path.approach],
              [0, 1],
              { ...CLAMP, easing: Easing.out(Easing.exp) },
            );

            const startX = path.fromLeft ? -160 : 2080;
            const approachX = interpolate(approachT, [0, 1], [startX, path.pauseX]);
            const approachY = path.yEnter + Math.sin(localFrame * 0.2) * 6;

            // ── Phase 2: Drift — lazy departure from pause ──
            const driftLocal = localFrame - path.approach;
            const driftT = interpolate(
              driftLocal,
              [0, DRIFT_FRAMES],
              [0, 1],
              { ...CLAMP, easing: Easing.out(Easing.quad) },
            );

            const driftDist = driftT * path.driftSpeed;
            const wobble =
              Math.sin(driftLocal * path.wobbleFreq) * path.wobbleAmp * driftT;
            const perpAngle = path.driftAngle + Math.PI / 2;
            const driftDx =
              Math.cos(path.driftAngle) * driftDist +
              Math.cos(perpAngle) * wobble;
            const driftDy =
              Math.sin(path.driftAngle) * driftDist +
              Math.sin(perpAngle) * wobble;

            // ── Combined position — seamless blend ──
            const inDrift = localFrame > path.approach;
            const x = inDrift ? path.pauseX + driftDx : approachX;
            const y = inDrift ? path.yEnter + driftDy : approachY;

            // Scale: spring entrance, gentle shrink during drift
            const scaleSpring = spring({
              frame: Math.max(0, localFrame),
              fps,
              config: { damping: 18, stiffness: 90, mass: 0.6 },
            });
            const aScale = interpolate(scaleSpring, [0, 1], [0.4, 1.0]);
            const dScale = inDrift
              ? interpolate(driftT, [0, 1], [1.0, 0.7], CLAMP)
              : 1.0;
            const logoScale = aScale * dScale;

            // Rotation: approach tilt → drift tumble
            const approachRot = interpolate(
              approachT,
              [0, 1],
              [path.fromLeft ? -15 : 15, 0],
              CLAMP,
            );
            const driftRot = inDrift ? driftT * path.spin : 0;
            const rotation = approachRot + driftRot;

            // Opacity: fade in → hold → fade out
            const fadeIn = interpolate(localFrame, [0, 10], [0, 1], CLAMP);
            const fadeOut = inDrift
              ? interpolate(driftT, [0, 0.15, 0.6, 1], [1, 1, 0.5, 0], CLAMP)
              : 1;
            const arcOpacity = fadeIn * fadeOut;

            // Glow: bright arrival, fading drift
            const glowIntensity = inDrift
              ? interpolate(driftT, [0, 0.4, 0.8], [0.8, 0.4, 0], CLAMP)
              : interpolate(approachT, [0, 0.5, 1], [0.3, 1.0, 0.8], CLAMP);

            return (
              <Img
                key={`arc-${i}`}
                src={staticFile(logo.src)}
                style={{
                  position: "absolute",
                  width: 125,
                  height: 125,
                  objectFit: "contain",
                  left: x - 62,
                  top: y - 62,
                  opacity: arcOpacity,
                  transform: `scale(${logoScale}) rotate(${rotation}deg)`,
                  filter: `drop-shadow(0 0 ${20 * glowIntensity}px rgba(123, 66, 188, ${0.6 * glowIntensity})) drop-shadow(0 0 ${45 * glowIntensity}px rgba(123, 66, 188, ${0.3 * glowIntensity}))`,
                }}
              />
            );
          })}

          {/* "Powered by AI Coding Agents" text */}
          <div
            style={{
              position: "absolute",
              bottom: 170,
              width: "100%",
              textAlign: "center",
              opacity: poweredTextOpacity,
            }}
          >
            <span
              style={{
                fontFamily: interFontFamily,
                fontSize: 26,
                fontWeight: 300,
                color: "rgba(255, 255, 255, 0.7)",
                letterSpacing: 3,
                textTransform: "uppercase" as const,
              }}
            >
              Powered by AI Coding Agents with Specification Driven Development
            </span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
