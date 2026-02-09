import { AbsoluteFill, Sequence, interpolate, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { TitleCard } from "./TitleCard";
import { ValueCards } from "./ValueCards";
import { ConsumerWorkflows, CONSUMER_DURATION_SECONDS } from "./ConsumerWorkflows";
import { WorkflowOverview, WORKFLOW_OVERVIEW_DURATION_SECONDS } from "./WorkflowOverview";
import { NeedForEvolution } from "./NeedForEvolution";
import { AgentInAction, AGENT_IN_ACTION_DURATION_SECONDS } from "./AgentInAction";

const TITLE_DURATION = 22;
const VALUE_CARDS_DURATION = 12;
const EVOLUTION_DURATION = 14;
const CONSUMER_DURATION = CONSUMER_DURATION_SECONDS;
const WORKFLOW_OVERVIEW_DURATION = WORKFLOW_OVERVIEW_DURATION_SECONDS;
const AGENT_IN_ACTION_DURATION = AGENT_IN_ACTION_DURATION_SECONDS;
const TRANSITION_FRAMES = 25;

export const SkillDemo: React.FC = () => {
  const { fps } = useVideoConfig();
  const titleFrames = TITLE_DURATION * fps;
  const evolutionFrames = EVOLUTION_DURATION * fps;
  const valueCardsFrames = VALUE_CARDS_DURATION * fps;
  const consumerFrames = CONSUMER_DURATION * fps;
  const workflowOverviewFrames = WORKFLOW_OVERVIEW_DURATION * fps;
  const agentInActionFrames = AGENT_IN_ACTION_DURATION * fps;
  const timing = linearTiming({ durationInFrames: TRANSITION_FRAMES });
  const presentation = fade();

  // Audio spans 209s (crossfade-looped, fade out from 199s baked into file)
  const audioDuration = Math.round(209 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Music: 209s with crossfade loop, fade out from 199s baked into file */}
      <Sequence from={0} durationInFrames={audioDuration}>
        <Audio src={staticFile("intro-music.mp3")} volume={(f) =>
          interpolate(f, [0, 5], [0, 0.8], { extrapolateRight: "clamp" })
        } />
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

        {/* Fade transition into Workflow Overview */}
        <TransitionSeries.Transition
          timing={timing}
          presentation={presentation}
        />

        {/* Workflow Overview — pipeline build-out */}
        <TransitionSeries.Sequence durationInFrames={workflowOverviewFrames}>
          <WorkflowOverview />
        </TransitionSeries.Sequence>

        {/* Fade transition into Agent in Action */}
        <TransitionSeries.Transition
          timing={timing}
          presentation={presentation}
        />

        {/* Agent in Action — orbital ring with video previews */}
        <TransitionSeries.Sequence durationInFrames={agentInActionFrames}>
          <AgentInAction />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

// Total: title + evolution + valueCards + consumer + workflowOverview + agentInAction - transition overlaps
export const getSkillDemoDuration = (fps: number) => {
  const titleFrames = TITLE_DURATION * fps;
  const evolutionFrames = EVOLUTION_DURATION * fps;
  const valueCardsFrames = VALUE_CARDS_DURATION * fps;
  const consumerFrames = CONSUMER_DURATION * fps;
  const workflowOverviewFrames = WORKFLOW_OVERVIEW_DURATION * fps;
  const agentInActionFrames = AGENT_IN_ACTION_DURATION * fps;
  const transitionCount = 5; // title→evolution, evolution→valueCards, valueCards→consumer, consumer→workflowOverview, workflowOverview→agentInAction
  const transitionOverlap = transitionCount * TRANSITION_FRAMES;
  return titleFrames + evolutionFrames + valueCardsFrames + consumerFrames + workflowOverviewFrames + agentInActionFrames - transitionOverlap;
};
