import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  subsets: ["latin"],
  weights: ["300", "700"],
});

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in over 1 second
  const fadeIn = interpolate(frame, [0, 1 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Fade out over last 0.5 seconds
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 0.5 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  // Subtle scale animation
  const scale = interpolate(frame, [0, 1.5 * fps], [0.95, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f0f",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 90,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-2px",
            marginBottom: 20,
          }}
        >
          AI driven
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 60,
            fontWeight: 300,
            color: "#4290F5",
            letterSpacing: "1px",
          }}
        >
          Infrastructure as Code
        </div>
      </div>
    </AbsoluteFill>
  );
};
