import { AbsoluteFill, Sequence, interpolate, useVideoConfig, staticFile } from "remotion";
import { Audio, Video } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { TitleCard } from "./TitleCard";
import { ValueCards } from "./ValueCards";
import { ConsumerWorkflows, CONSUMER_DURATION_SECONDS } from "./ConsumerWorkflows";
import { ClipLabel } from "./ClipLabel";
import { NeedForEvolution } from "./NeedForEvolution";

const TITLE_DURATION = 19;
const VALUE_CARDS_DURATION = 12;
const EVOLUTION_DURATION = 14;
const CONSUMER_DURATION = CONSUMER_DURATION_SECONDS;
const TRANSITION_FRAMES = 15;

const clips = [
  { start: 83, duration: 97, label: "Discovery", phase: 1 },
  { start: 315, duration: 115, label: "Research", phase: 2 },
  { start: 948, duration: 88, label: "Analysis", phase: 3 },
  { start: 1136, duration: 59, label: "Delivery", phase: 4 },
];

export const SkillDemo: React.FC = () => {
  const { fps } = useVideoConfig();
  const src = staticFile("tf-plan-demo.mp4");

  const titleFrames = TITLE_DURATION * fps;
  const evolutionFrames = EVOLUTION_DURATION * fps;
  const valueCardsFrames = VALUE_CARDS_DURATION * fps;
  const consumerFrames = CONSUMER_DURATION * fps;
  const timing = linearTiming({ durationInFrames: TRANSITION_FRAMES });
  const presentation = fade();

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
              presentation={presentation}
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
      </TransitionSeries>
    </AbsoluteFill>
  );
};

// Total: title + evolution + valueCards + consumer + clips - transition overlaps
export const getSkillDemoDuration = (fps: number) => {
  const titleFrames = TITLE_DURATION * fps;
  const evolutionFrames = EVOLUTION_DURATION * fps;
  const valueCardsFrames = VALUE_CARDS_DURATION * fps;
  const consumerFrames = CONSUMER_DURATION * fps;
  const clipsFrames = clips.reduce((acc, clip) => acc + clip.duration * fps, 0);
  // transitions: title→evolution, evolution→valueCards, valueCards→consumer, consumer→clip1, clip1→2, 2→3, 3→4
  const transitionCount = 3 + clips.length;
  const transitionOverlap = transitionCount * TRANSITION_FRAMES;
  return titleFrames + evolutionFrames + valueCardsFrames + consumerFrames + clipsFrames - transitionOverlap;
};
