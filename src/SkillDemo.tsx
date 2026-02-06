import { AbsoluteFill, Sequence, interpolate, useVideoConfig, staticFile } from "remotion";
import { Audio, Video } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { TitleCard } from "./TitleCard";
import { ValueCards } from "./ValueCards";
import { ConsumerWorkflows, CONSUMER_DURATION_SECONDS } from "./ConsumerWorkflows";
import { ImplementWorkflows, IMPLEMENT_DURATION_SECONDS } from "./ImplementWorkflows";
import { ClipLabel } from "./ClipLabel";
import { NeedForEvolution } from "./NeedForEvolution";

const TITLE_DURATION = 22;
const VALUE_CARDS_DURATION = 12;
const EVOLUTION_DURATION = 14;
const CONSUMER_DURATION = CONSUMER_DURATION_SECONDS;
const IMPLEMENT_DURATION = IMPLEMENT_DURATION_SECONDS;
const TRANSITION_FRAMES = 25;

const clips = [
  { start: 83, duration: 97, label: "Discovery", phase: 1 },
  { start: 315, duration: 115, label: "Research", phase: 2 },
  { start: 948, duration: 88, label: "Analysis", phase: 3 },
  { start: 1136, duration: 59, label: "Delivery", phase: 4 },
];

const applyClips = [
  { start: 0, duration: 90, label: "Kick-off", phase: 1 },
  { start: 360, duration: 145, label: "Implementation", phase: 2 },
  { start: 643, duration: 112, label: "Review", phase: 3 },
  { start: 1050, duration: 130, label: "Deployment", phase: 4 },
  { start: 1700, duration: 100, label: "Reporting", phase: 5 },
];

// Fade through black — outgoing fades out, brief black, incoming fades in
const fadeThroughBlack = () => ({
  component: ({
    children,
    presentationDirection,
    presentationProgress,
  }: {
    children: React.ReactNode;
    presentationDirection: "entering" | "exiting";
    presentationProgress: number;
  }) => {
    const opacity =
      presentationDirection === "entering"
        ? interpolate(presentationProgress, [0.6, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        : interpolate(presentationProgress, [0, 0.4], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

    return (
      <AbsoluteFill style={{ opacity }}>
        {children}
      </AbsoluteFill>
    );
  },
});

export const SkillDemo: React.FC = () => {
  const { fps } = useVideoConfig();
  const src = staticFile("tf-plan-demo.mp4");
  const applySrc = staticFile("tf-apply skill demo.mp4");

  const titleFrames = TITLE_DURATION * fps;
  const evolutionFrames = EVOLUTION_DURATION * fps;
  const valueCardsFrames = VALUE_CARDS_DURATION * fps;
  const consumerFrames = CONSUMER_DURATION * fps;
  const implementFrames = IMPLEMENT_DURATION * fps;
  const timing = linearTiming({ durationInFrames: TRANSITION_FRAMES });
  const presentation = fade();
  const videoPresentation = fadeThroughBlack();

  // Audio spans TitleCard + NeedForEvolution + ValueCards + ConsumerWorkflows minus three transition overlaps
  const audioDuration = titleFrames + evolutionFrames + valueCardsFrames + consumerFrames - 3 * TRANSITION_FRAMES;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Music: spans TitleCard → ConsumerWorkflows continuously */}
      <Sequence from={0} durationInFrames={audioDuration}>
        <Audio
          src={staticFile("intro-music.mp3")}
          volume={(f) => {
            const fadeIn = interpolate(f, [0, 30], [0, 0.8], {
              extrapolateRight: "clamp",
            });
            const fadeOut = interpolate(
              f,
              [audioDuration - 150, audioDuration],
              [0.8, 0],
              { extrapolateLeft: "clamp" },
            );
            return Math.min(fadeIn, fadeOut);
          }}
        />
      </Sequence>

      <TransitionSeries>
        {/* Title Card */}
        <TransitionSeries.Sequence durationInFrames={titleFrames}>
          <TitleCard />
        </TransitionSeries.Sequence>

        {/* Fade transition into Need for Evolution */}
        <TransitionSeries.Transition
          timing={timing}
          presentation={presentation}
        />

        {/* Need for Evolution */}
        <TransitionSeries.Sequence durationInFrames={evolutionFrames}>
          <NeedForEvolution />
        </TransitionSeries.Sequence>

        {/* Fade transition into Value Cards */}
        <TransitionSeries.Transition
          timing={timing}
          presentation={presentation}
        />

        {/* Value Proposition Cards */}
        <TransitionSeries.Sequence durationInFrames={valueCardsFrames}>
          <ValueCards />
        </TransitionSeries.Sequence>

        {/* Fade transition into Consumer Workflows */}
        <TransitionSeries.Transition
          timing={timing}
          presentation={presentation}
        />

        {/* Application Team Consumer Workflows */}
        <TransitionSeries.Sequence durationInFrames={consumerFrames}>
          <ConsumerWorkflows />
        </TransitionSeries.Sequence>

        {clips.map((clip, i) => {
          const clipFrames = clip.duration * fps;
          return [
            <TransitionSeries.Transition
              key={`t-${i}`}
              timing={timing}
              presentation={videoPresentation}
            />,
            <TransitionSeries.Sequence
              key={`c-${i}`}
              durationInFrames={clipFrames}
            >
              <Video
                src={src}
                trimBefore={clip.start * fps}
                trimAfter={(clip.start + clip.duration) * fps}
                style={{ width: "100%", height: "100%" }}
              />
              <ClipLabel label={clip.label} phase={clip.phase} />
            </TransitionSeries.Sequence>,
          ];
        })}

        {/* Fade through black into Implement Workflows intro */}
        <TransitionSeries.Transition
          timing={timing}
          presentation={videoPresentation}
        />

        {/* Application Team Implement Workflows (Consumer) */}
        <TransitionSeries.Sequence durationInFrames={implementFrames}>
          <ImplementWorkflows />
        </TransitionSeries.Sequence>

        {applyClips.map((clip, i) => {
          const clipFrames = clip.duration * fps;
          return [
            <TransitionSeries.Transition
              key={`at-${i}`}
              timing={timing}
              presentation={videoPresentation}
            />,
            <TransitionSeries.Sequence
              key={`ac-${i}`}
              durationInFrames={clipFrames}
            >
              <Video
                src={applySrc}
                trimBefore={clip.start * fps}
                trimAfter={(clip.start + clip.duration) * fps}
                style={{ width: "100%", height: "100%" }}
              />
              <ClipLabel label={clip.label} phase={clip.phase} />
            </TransitionSeries.Sequence>,
          ];
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

// Total: title + evolution + valueCards + consumer + planClips + implement + applyClips - transition overlaps
export const getSkillDemoDuration = (fps: number) => {
  const titleFrames = TITLE_DURATION * fps;
  const evolutionFrames = EVOLUTION_DURATION * fps;
  const valueCardsFrames = VALUE_CARDS_DURATION * fps;
  const consumerFrames = CONSUMER_DURATION * fps;
  const implementFrames = IMPLEMENT_DURATION * fps;
  const clipsFrames = clips.reduce((acc, clip) => acc + clip.duration * fps, 0);
  const applyClipsFrames = applyClips.reduce((acc, clip) => acc + clip.duration * fps, 0);
  // transitions: title→evolution, evolution→valueCards, valueCards→consumer,
  // consumer→clip1..clip4, clip4→implement, implement→applyClip1..applyClip5
  const transitionCount = 3 + clips.length + 1 + applyClips.length;
  const transitionOverlap = transitionCount * TRANSITION_FRAMES;
  return titleFrames + evolutionFrames + valueCardsFrames + consumerFrames + implementFrames + clipsFrames + applyClipsFrames - transitionOverlap;
};
