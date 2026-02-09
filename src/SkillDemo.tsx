import {
  AbsoluteFill,
  Freeze,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { Audio, Video } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  subsets: ["latin"],
  weights: ["400", "700"],
});

const TRANSITION_FRAMES = 25;
const SECTION_TITLE_DURATION = 3; // seconds

// ── Clip definitions ────────────────────────────────────────────────────────

interface ClipNote {
  text: string;
  appearAt: number; // seconds into the clip
  showFor: number; // seconds
}

interface ClipPause {
  text: string;
  at: number; // seconds into the clip where the video freezes
  holdDuration: number; // seconds the freeze lasts
}

interface Clip {
  start: number; // seconds into source video
  duration: number; // seconds
  note?: ClipNote;
  pause?: ClipPause;
}

const planClips: Clip[] = [
  { start: 0, duration: 13.5 },
  { start: 56, duration: 50.8 },
  {
    start: 263,
    duration: 37.5,
    pause: {
      text: '*I meant "Spec-Driven Development"',
      at: 16.5,
      holdDuration: 3,
    },
  },
  { start: 314, duration: 23 },
  { start: 442, duration: 79 },
  { start: 638, duration: 53 },
  { start: 690, duration: 68 },
  { start: 1031.5, duration: 53 },
  { start: 758, duration: 58 },
  { start: 958, duration: 74 },
  { start: 1132, duration: 56 },
];

const applyClips: Clip[] = [
  { start: 0, duration: 68 },
  { start: 139, duration: 220 },
  { start: 401, duration: 98 },
  { start: 538.5, duration: 29.5 },
  { start: 722, duration: 109 },
  { start: 1094, duration: 173 },
  { start: 1268, duration: 102 },
  { start: 1399, duration: 33 },
  { start: 1478, duration: 148.5 },
  { start: 1640, duration: 96.5 },
  { start: 1884, duration: 74 },
];

// ── Fade through black transition ───────────────────────────────────────────

const fadeThroughBlack = () => ({
  props: {},
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

    return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
  },
});

// ── Section title card ──────────────────────────────────────────────────────

const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 0.5 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: 72,
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontFamily,
            fontSize: 32,
            fontWeight: 400,
            color: "#7B42BC",
            marginTop: 16,
          }}
        >
          {subtitle}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── Correction note pop-up ──────────────────────────────────────────────────

const CorrectionNote: React.FC<{
  text: string;
  appearAtSeconds: number;
  showForSeconds: number;
}> = ({ text, appearAtSeconds, showForSeconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = Math.round(appearAtSeconds * fps);
  const endFrame = startFrame + Math.round(showForSeconds * fps);

  if (frame < startFrame || frame > endFrame) return null;

  const fadeIn = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [endFrame - 15, endFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);
  const slideUp = interpolate(frame, [startFrame, startFrame + 15], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 120,
          right: 60,
          opacity,
          transform: `translateY(${slideUp}px)`,
          fontFamily,
          fontSize: 28,
          fontWeight: 500,
          color: "#ffffff",
          backgroundColor: "rgba(123, 66, 188, 0.85)",
          padding: "14px 24px",
          borderRadius: 8,
          borderLeft: "4px solid #F59E0B",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ── Pause overlay (centered at bottom) ──────────────────────────────────────

const PauseOverlay: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);
  const slideUp = interpolate(frame, [0, 10], [20, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: "50%",
          transform: `translateX(-50%) translateY(${slideUp}px)`,
          opacity,
          fontFamily,
          fontSize: 28,
          fontWeight: 500,
          color: "#ffffff",
          backgroundColor: "rgba(123, 66, 188, 0.85)",
          padding: "14px 24px",
          borderRadius: 8,
          borderLeft: "4px solid #F59E0B",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ── Helper: render a series of clips ────────────────────────────────────────

const renderClips = (
  clips: Clip[],
  src: string,
  fps: number,
  keyPrefix: string,
  timing: ReturnType<typeof linearTiming>,
  presentation: ReturnType<typeof fadeThroughBlack>
) => {
  return clips.flatMap((clip, i) => {
    // ── Clip with pause: split into pre / freeze / post ──
    if (clip.pause) {
      const pauseAt = clip.pause.at;
      const holdFrames = Math.round(clip.pause.holdDuration * fps);

      const preFrames = Math.round(pauseAt * fps);
      const preTrimBefore = Math.round(clip.start * fps);
      const preTrimAfter = Math.round((clip.start + pauseAt) * fps);

      const postDuration = clip.duration - pauseAt;
      const postFrames = Math.round(postDuration * fps);
      const postTrimBefore = preTrimAfter;
      const postTrimAfter = Math.round((clip.start + clip.duration) * fps);

      return [
        // Transition from previous clip (normal)
        <TransitionSeries.Transition
          key={`${keyPrefix}-t-${i}`}
          timing={timing}
          presentation={presentation}
        />,
        // Pre-pause: video plays, fades in but cuts hard at end
        <TransitionSeries.Sequence
          key={`${keyPrefix}-c-${i}-pre`}
          durationInFrames={preFrames}
        >
          <Video
            src={src}

            trimBefore={preTrimBefore}
            trimAfter={preTrimAfter}
            style={{ width: "100%", height: "100%" }}
            volume={(f) =>
              interpolate(f, [0, fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
        </TransitionSeries.Sequence>,
        // Freeze: frozen frame + ping + text overlay (hard cut in & out)
        <TransitionSeries.Sequence
          key={`${keyPrefix}-c-${i}-pause`}
          durationInFrames={holdFrames}
        >
          <Freeze frame={0}>
            <Video
              src={src}
              trimBefore={preTrimAfter}
              trimAfter={preTrimAfter + holdFrames}
              style={{ width: "100%", height: "100%" }}
              volume={0}
            />
          </Freeze>
          <Audio src={staticFile("ping.wav")} volume={0.8} />
          <PauseOverlay text={clip.pause.text} />
        </TransitionSeries.Sequence>,
        // Post-pause: video resumes, no fade in, fades out at end
        <TransitionSeries.Sequence
          key={`${keyPrefix}-c-${i}-post`}
          durationInFrames={postFrames}
        >
          <Video
            src={src}

            trimBefore={postTrimBefore}
            trimAfter={postTrimAfter}
            style={{ width: "100%", height: "100%" }}
            volume={(f) =>
              interpolate(f, [postFrames - fps, postFrames], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
        </TransitionSeries.Sequence>,
      ];
    }

    // ── Normal clip ──
    const clipFrames = Math.round(clip.duration * fps);
    return [
      <TransitionSeries.Transition
        key={`${keyPrefix}-t-${i}`}
        timing={timing}
        presentation={presentation}
      />,
      <TransitionSeries.Sequence
        key={`${keyPrefix}-c-${i}`}
        durationInFrames={clipFrames}
      >
        <Video
          src={src}
          trimBefore={Math.round(clip.start * fps)}
          trimAfter={Math.round((clip.start + clip.duration) * fps)}
          style={{ width: "100%", height: "100%" }}
          volume={(f) => {
            const vIn = interpolate(f, [0, fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const vOut = interpolate(
              f,
              [clipFrames - fps, clipFrames],
              [1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return Math.min(vIn, vOut);
          }}
        />
        {clip.note && (
          <CorrectionNote
            text={clip.note.text}
            appearAtSeconds={clip.note.appearAt}
            showForSeconds={clip.note.showFor}
          />
        )}
      </TransitionSeries.Sequence>,
    ];
  });
};

// ── Main composition ────────────────────────────────────────────────────────

export const SkillDemo: React.FC = () => {
  const { fps } = useVideoConfig();
  const planSrc = staticFile("tf-plan-demo.mp4");
  const applySrc = staticFile("tf-apply skill demo.mp4");

  const sectionTitleFrames = SECTION_TITLE_DURATION * fps;
  const timing = linearTiming({ durationInFrames: TRANSITION_FRAMES });
  const presentation = fadeThroughBlack();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {/* ── Plan Phase title ── */}
        <TransitionSeries.Sequence durationInFrames={sectionTitleFrames}>
          <SectionTitle title="Plan Phase" subtitle="tf-plan skill demo" />
        </TransitionSeries.Sequence>

        {/* ── Plan clips ── */}
        {renderClips(planClips, planSrc, fps, "plan", timing, presentation)}

        {/* ── Apply Phase title ── */}
        <TransitionSeries.Transition
          timing={timing}
          presentation={presentation}
        />
        <TransitionSeries.Sequence durationInFrames={sectionTitleFrames}>
          <SectionTitle title="Apply Phase" subtitle="tf-apply skill demo" />
        </TransitionSeries.Sequence>

        {/* ── Apply clips ── */}
        {renderClips(applyClips, applySrc, fps, "apply", timing, presentation)}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

// ── Duration calculator ─────────────────────────────────────────────────────

export const getSkillDemoDuration = (fps: number) => {
  const sectionTitleFrames = 2 * SECTION_TITLE_DURATION * fps; // 2 title cards
  const planFrames = planClips.reduce(
    (acc, clip) => acc + Math.round(clip.duration * fps),
    0
  );
  const applyFrames = applyClips.reduce(
    (acc, clip) => acc + Math.round(clip.duration * fps),
    0
  );
  // Extra frames added by pause sequences
  const pauseFrames = [...planClips, ...applyClips].reduce(
    (acc, clip) =>
      acc + (clip.pause ? Math.round(clip.pause.holdDuration * fps) : 0),
    0
  );
  // Transitions: planTitle→clip1, between plan clips (9), lastPlan→applyTitle,
  // applyTitle→clip1, between apply clips (10)
  const transitionCount =
    planClips.length + 1 + applyClips.length;
  const transitionOverlap = transitionCount * TRANSITION_FRAMES;

  return sectionTitleFrames + planFrames + applyFrames + pauseFrames - transitionOverlap;
};
