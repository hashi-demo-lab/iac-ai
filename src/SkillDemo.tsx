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
import { loadFont as loadMonoFont } from "@remotion/google-fonts/GeistMono";

const { fontFamily } = loadFont("normal", {
  subsets: ["latin"],
  weights: ["400", "700"],
});

const { fontFamily: monoFont } = loadMonoFont("normal", {
  subsets: ["latin"],
  weights: ["400", "600"],
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
  title?: string;
  note?: ClipNote;
  pause?: ClipPause;
}

const planClips: Clip[] = [
  { start: 0, duration: 13.5 },
  { start: 56, duration: 50.8, title: "Introducing tf-plan" },
  {
    start: 263,
    duration: 37.5,
    title: "Subagent: sdd-specify",
    pause: {
      text: "*SDD = Spec-Driven Development",
      at: 16.5,
      holdDuration: 2,
    },
  },
  { start: 442, duration: 79, title: "Generating the spec.md" },
  { start: 314, duration: 23, title: "GitHub Issue Tracking" },
  { start: 638, duration: 52.5, title: "Subagents: sdd-checklist & sdd-clarify" },
  { start: 690, duration: 68, title: "Subagent: sdd-research" },
  { start: 1031.5, duration: 53 },
  { start: 758, duration: 58, title: "Subagent: sdd-plan-draft" },
  { start: 954, duration: 78, title: "Subagents: sdd-task & sdd-analyse" },
  { start: 1132, duration: 56, title: "tf-plan Summary" },
];

const applyClips: Clip[] = [
  { start: 0, duration: 68, title: "Introducing tf-implement" },
  { start: 139, duration: 220, title: "Subagent: tf-task-executor" },
  { start: 401, duration: 98, title: "Enforcing Compliance & Security" },
  { start: 538.5, duration: 29.5, title: "Generated Terraform Code" },
  { start: 722, duration: 109, title: "Subagent: Security Review" },
  { start: 1094, duration: 173, title: "Deploying to HCP Terraform" },
  { start: 1268, duration: 109.3, title: "Automatic Issue Remediation" },
  { start: 1399, duration: 33, title: "Testing the Static Site" },
  { start: 1478, duration: 148.5, title: "Enterprise Workflow Enforcement" },
  { start: 1640, duration: 96.5, title: "Subagent: tf-report-generator" },
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

// ── Clip title with typewriter animation ─────────────────────────────────────

const TYPEWRITER_FRAMES_PER_CHAR = 2;
const TYPEWRITER_HOLD_SECONDS = 3;
const TYPEWRITER_FADE_SECONDS = 0.5;
const TYPEWRITER_START_DELAY = 10; // frames before typing begins

const bannerStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 36,
  left: 0,
  display: "flex",
  alignItems: "center",
  fontFamily: monoFont,
  fontSize: 32,
  fontWeight: 600,
  color: "#fff",
  letterSpacing: 0.5,
  backgroundColor: "rgba(10, 10, 10, 0.72)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  padding: "14px 28px 14px 0",
  borderRadius: "0 8px 8px 0",
};

const accentBarStyle: React.CSSProperties = {
  width: 4,
  alignSelf: "stretch",
  backgroundColor: "#7B42BC",
  borderRadius: "0 2px 2px 0",
  marginRight: 20,
  boxShadow: "0 0 12px rgba(123, 66, 188, 0.5)",
};

const ClipTitle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typingFrames = text.length * TYPEWRITER_FRAMES_PER_CHAR;
  const holdFrames = Math.round(TYPEWRITER_HOLD_SECONDS * fps);
  const fadeFrames = Math.round(TYPEWRITER_FADE_SECONDS * fps);

  const typingFrame = Math.max(0, frame - TYPEWRITER_START_DELAY);
  const charsVisible = Math.min(
    Math.floor(typingFrame / TYPEWRITER_FRAMES_PER_CHAR),
    text.length
  );

  const isTyping = charsVisible < text.length && frame >= TYPEWRITER_START_DELAY;
  const doneTypingAt = TYPEWRITER_START_DELAY + typingFrames;
  const fadeOutStart = doneTypingAt + holdFrames;
  const fadeOutEnd = fadeOutStart + fadeFrames;

  if (frame > fadeOutEnd) return null;

  // Slide in from left
  const slideIn = interpolate(frame, [0, 8], [-60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < TYPEWRITER_START_DELAY && charsVisible === 0) {
    const cursorOn = Math.floor(frame / 10) % 2 === 0;
    return (
      <AbsoluteFill>
        <div
          style={{
            ...bannerStyle,
            transform: `translateX(${slideIn}px)`,
          }}
        >
          <div style={accentBarStyle} />
          <span style={{ opacity: cursorOn ? 1 : 0, color: "#7B42BC" }}>
            ▎
          </span>
        </div>
      </AbsoluteFill>
    );
  }

  const opacity =
    frame >= fadeOutStart
      ? interpolate(frame, [fadeOutStart, fadeOutEnd], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  let showCursor = false;
  if (isTyping) {
    showCursor = true;
  } else if (frame < doneTypingAt + Math.round(fps * 1)) {
    showCursor = Math.floor(frame / 10) % 2 === 0;
  }

  return (
    <AbsoluteFill>
      <div
        style={{
          ...bannerStyle,
          opacity,
          transform: `translateX(${slideIn}px)`,
        }}
      >
        <div style={accentBarStyle} />
        {text.slice(0, charsVisible)}
        <span style={{ opacity: showCursor ? 1 : 0, color: "#7B42BC" }}>
          ▎
        </span>
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
          {clip.title && <ClipTitle text={clip.title} />}
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
          <Audio src={staticFile("bell.wav")} volume={0.8} />
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
        {clip.title && <ClipTitle text={clip.title} />}
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
