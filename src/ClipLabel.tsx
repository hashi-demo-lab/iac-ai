import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  subsets: ["latin"],
  weights: ["500"],
});

export const ClipLabel: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide in from left over 0.5s
  const slideIn = interpolate(frame, [0, 0.5 * fps], [-300, 0], {
    extrapolateRight: "clamp",
  });

  // Fade in
  const opacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

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
