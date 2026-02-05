import { AbsoluteFill, Sequence, useVideoConfig, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { TitleCard } from "./TitleCard";
import { ClipLabel } from "./ClipLabel";

// Title card duration in seconds
const TITLE_DURATION = 4;

// Clips: { start: seconds, duration: seconds, label: string }
const clips = [
  { start: 83, duration: 98, label: "Collaborative Requirements Gathering with AI" },
  { start: 315, duration: 60, label: "Research and Planning" },
  { start: 1137, duration: 38, label: "Review the Specifications" },
];

export const SkillDemo: React.FC = () => {
  const { fps } = useVideoConfig();
  const src = staticFile("tf-plan-demo.mp4");

  // Calculate frame positions
  const titleFrames = TITLE_DURATION * fps;
  const clip1Frames = clips[0].duration * fps;
  const clip2Frames = clips[1].duration * fps;
  const clip3Frames = clips[2].duration * fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Title Card */}
      <Sequence from={0} durationInFrames={titleFrames}>
        <TitleCard />
      </Sequence>

      {/* Clip 1: 1:23 - 3:01 */}
      <Sequence from={titleFrames} durationInFrames={clip1Frames}>
        <Video
          src={src}
          trimBefore={clips[0].start * fps}
          style={{ width: "100%", height: "100%" }}
        />
        <ClipLabel label={clips[0].label} />
      </Sequence>

      {/* Clip 2: 5:15 - 6:15 */}
      <Sequence from={titleFrames + clip1Frames} durationInFrames={clip2Frames}>
        <Video
          src={src}
          trimBefore={clips[1].start * fps}
          style={{ width: "100%", height: "100%" }}
        />
        <ClipLabel label={clips[1].label} />
      </Sequence>

      {/* Clip 3: 18:57 - 19:35 */}
      <Sequence from={titleFrames + clip1Frames + clip2Frames} durationInFrames={clip3Frames}>
        <Video
          src={src}
          trimBefore={clips[2].start * fps}
          style={{ width: "100%", height: "100%" }}
        />
        <ClipLabel label={clips[2].label} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Total duration: title + clips
export const getSkillDemoDuration = (fps: number) => {
  const clipsDuration = clips.reduce((acc, clip) => acc + clip.duration * fps, 0);
  return TITLE_DURATION * fps + clipsDuration;
};
