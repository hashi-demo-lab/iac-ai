import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  subsets: ["latin"],
  weights: ["500", "700"],
});

export const ClipLabel: React.FC<{ label: string; phase: number }> = ({
  label,
  phase,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Slide in from left over 0.5s
  const slideIn = interpolate(frame, [0, 0.5 * fps], [-300, 0], {
    extrapolateRight: "clamp",
  });

  // Fade in over 0.5s
  const fadeIn = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Fade out over last 1s of clip
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 60,
          transform: `translateX(${slideIn}px)`,
          opacity,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 18,
            fontWeight: 700,
            color: "#4290F5",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            padding: "6px 14px",
            borderRadius: 4,
            marginBottom: 8,
            display: "inline-block",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Phase {phase}
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 36,
            fontWeight: 500,
            color: "#ffffff",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "16px 28px",
            borderRadius: 8,
            borderLeft: "4px solid #4290F5",
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
