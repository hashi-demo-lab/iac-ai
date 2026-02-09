import "./index.css";
import { Composition } from "remotion";
import { Overlay } from "./Overlay";
import { SkillDemo, getSkillDemoDuration } from "./SkillDemo";
import { TitleCard } from "./TitleCard";
import { ConsumerWorkflows, CONSUMER_DURATION_SECONDS } from "./ConsumerWorkflows";
import { ImplementWorkflows, IMPLEMENT_DURATION_SECONDS } from "./ImplementWorkflows";
import { NeedForEvolution } from "./NeedForEvolution";
import { ValueCards } from "./ValueCards";
import { WorkflowOverview, WORKFLOW_OVERVIEW_DURATION_SECONDS } from "./WorkflowOverview";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Overlay"
        component={Overlay}
        durationInFrames={75}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="SkillDemo"
        component={SkillDemo}
        durationInFrames={getSkillDemoDuration(FPS)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="TitleCard"
        component={TitleCard}
        durationInFrames={660}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="ConsumerWorkflows"
        component={ConsumerWorkflows}
        durationInFrames={CONSUMER_DURATION_SECONDS * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="ImplementWorkflows"
        component={ImplementWorkflows}
        durationInFrames={IMPLEMENT_DURATION_SECONDS * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="NeedForEvolution"
        component={NeedForEvolution}
        durationInFrames={300}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="ValueCards"
        component={ValueCards}
        durationInFrames={240}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="WorkflowOverview"
        component={WorkflowOverview}
        durationInFrames={WORKFLOW_OVERVIEW_DURATION_SECONDS * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
