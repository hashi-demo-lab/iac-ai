import "./index.css";
import { Composition } from "remotion";
import { Overlay } from "./Overlay";
import { SkillDemo, getSkillDemoDuration } from "./SkillDemo";

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
    </>
  );
};
