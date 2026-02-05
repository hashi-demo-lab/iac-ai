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
const BG = "#0a0a0a";

const TITLE_ENTER_FRAME = 10;

interface CardData {
  icon: string;
  workflow: string;
  headline: string;
  benefits: string[];
  tagline: string;
}

const CARDS: CardData[] = [
  {
    icon: "🚀",
    workflow: "PRODUCER WORKFLOW",
    headline: "Generate compliant, tested modules for Private Module Registry",
    benefits: [
      "Reduce module delivery from weeks to hours",
      "Eliminate misconfigurations that cause downtime",
    ],
    tagline: "Weeks → Hours",
  },
  {
    icon: "🚀",
    workflow: "CONSUMER WORKFLOW",
    headline: "Deploy and manage complex architectures using natural language",
    benefits: [
      "Minimize service risk through validated modules",
      "Auto-align infrastructure to security policies",
    ],
    tagline: "Hours → Minutes",
  },
  {
    icon: "🌐",
    workflow: "PROVIDER LIFECYCLE",
    headline:
      "Accelerate Terraform Provider development and release cycles",
    benefits: [
      "Deliver quality providers in days, not months",
      "Comprehensive test coverage minimizes UX issues",
    ],
    tagline: "Months → Weeks",
  },
];

const CARD_TITLES = ["Platform Team", "Application Team", "Ecosystem"];

const CARD_ENTER_FRAMES = [30, 60, 90];

export const ValueCards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Exit: all cards fade out over last 30 frames
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    CLAMP,
  );

  // Background glow — subtle pulse
  const glowOpacity = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [0.06, 0.12],
  );

  // ── Section title animation ──────────────────────────────────────
  const titleSpring = spring({
    frame: Math.max(0, frame - TITLE_ENTER_FRAME),
    fps,
    config: { damping: 20, stiffness: 110, mass: 0.7 },
  });
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);
  const titleOpacity = interpolate(
    frame,
    [TITLE_ENTER_FRAME, TITLE_ENTER_FRAME + 12],
    [0, 1],
    CLAMP,
  );

  // Accent line under title — expands outward
  const lineWidth = interpolate(frame, [TITLE_ENTER_FRAME + 8, TITLE_ENTER_FRAME + 30], [0, 320], {
    ...CLAMP,
    easing: Easing.out(Easing.exp),
  });
  const lineOpacity = interpolate(
    frame,
    [TITLE_ENTER_FRAME + 8, TITLE_ENTER_FRAME + 15],
    [0, 1],
    CLAMP,
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
        overflow: "hidden",
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(123, 66, 188, ${glowOpacity}), transparent 70%)`,
        }}
      />

      {/* Ambient particle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(rgba(123, 66, 188, 0.08) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          opacity: 0.4,
        }}
      />

      {/* Layout wrapper — title + cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          width: "100%",
        }}
      >
        {/* Section title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: interFontFamily,
              fontSize: 52,
              fontWeight: 800,
              color: "#ffffff",
              textTransform: "uppercase" as const,
              letterSpacing: 3,
              textShadow: `0 0 30px rgba(123, 66, 188, 0.5), 0 0 80px rgba(123, 66, 188, 0.2)`,
            }}
          >
            Agentic IaC Workflows
          </div>

          {/* Accent line */}
          <div
            style={{
              width: lineWidth,
              height: 2,
              opacity: lineOpacity,
              background: `linear-gradient(90deg, transparent, ${PURPLE}, transparent)`,
              boxShadow: `0 0 12px rgba(123, 66, 188, 0.5)`,
              marginTop: 16,
            }}
          />
        </div>

        {/* Cards container */}
        <div
          style={{
            display: "flex",
            gap: 32,
            padding: "0 80px",
            width: "100%",
            justifyContent: "center",
          }}
        >
        {CARDS.map((card, i) => {
          const enterFrame = CARD_ENTER_FRAMES[i];

          // Spring entrance — slide up + fade in
          const cardSpring = spring({
            frame: Math.max(0, frame - enterFrame),
            fps,
            config: { damping: 18, stiffness: 100, mass: 0.8 },
          });
          const cardY = interpolate(cardSpring, [0, 1], [60, 0]);
          const cardOpacity = interpolate(
            frame,
            [enterFrame, enterFrame + 15],
            [0, 1],
            CLAMP,
          );

          return (
            <div
              key={i}
              style={{
                flex: 1,
                maxWidth: 540,
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
                background: `linear-gradient(135deg, rgba(123, 66, 188, 0.08) 0%, rgba(20, 20, 20, 0.95) 50%, rgba(123, 66, 188, 0.05) 100%)`,
                border: `1px solid rgba(123, 66, 188, 0.25)`,
                borderRadius: 16,
                padding: "36px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                boxShadow: `0 0 30px rgba(123, 66, 188, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
              }}
            >
              {/* Icon + Title row */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 32 }}>{card.icon}</span>
                <span
                  style={{
                    fontFamily: interFontFamily,
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: 0.5,
                  }}
                >
                  {CARD_TITLES[i]}
                </span>
              </div>

              {/* Workflow label */}
              <div
                style={{
                  fontFamily: interFontFamily,
                  fontSize: 13,
                  fontWeight: 600,
                  color: PURPLE,
                  letterSpacing: 2,
                  textTransform: "uppercase" as const,
                }}
              >
                {card.workflow}
              </div>

              {/* Headline */}
              <div
                style={{
                  fontFamily: interFontFamily,
                  fontSize: 18,
                  fontWeight: 400,
                  color: "rgba(255, 255, 255, 0.85)",
                  lineHeight: 1.5,
                }}
              >
                {card.headline}
              </div>

              {/* Benefits section */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    fontFamily: interFontFamily,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.4)",
                    letterSpacing: 1.5,
                    textTransform: "uppercase" as const,
                    marginBottom: 2,
                  }}
                >
                  BENEFITS
                </div>
                {card.benefits.map((benefit, j) => (
                  <div
                    key={j}
                    style={{
                      fontFamily: interFontFamily,
                      fontSize: 15,
                      fontWeight: 300,
                      color: "rgba(255, 255, 255, 0.65)",
                      lineHeight: 1.4,
                      paddingLeft: 12,
                      borderLeft: `2px solid rgba(123, 66, 188, 0.3)`,
                    }}
                  >
                    {benefit}
                  </div>
                ))}
              </div>

              {/* Purple divider */}
              <div
                style={{
                  height: 1,
                  background: `linear-gradient(90deg, ${PURPLE}, rgba(123, 66, 188, 0.2))`,
                  marginTop: 4,
                }}
              />

              {/* Tagline */}
              <div
                style={{
                  fontFamily: interFontFamily,
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: 1,
                  textShadow: `0 0 20px rgba(123, 66, 188, 0.5)`,
                }}
              >
                {card.tagline}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
