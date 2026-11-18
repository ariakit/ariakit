/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  RadioCard,
  RadioCardLabel,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";
import { getWindow } from "@ariakit/utils";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { RefObject } from "react";
import { FigureSlider } from "./figure.react.tsx";

const SPEEDS = [1, 0.25, 0.1];

// Parts such as a glider turn off their motion in these modes and remove the
// elements that move, so the transitions of the last change can't run again.
const NO_MOTION_QUERY =
  "(prefers-reduced-motion: reduce), (forced-colors: active)";

// The scrubber goes from 0 to this value.
const SCRUB_STEPS = 100;

// A transition as it ran, so the controls can run it again.
interface Recording {
  target: Element;
  keyframes: Keyframe[];
  timing: EffectTiming;
}

// CSS transitions are the motion that a control starts in the subject. Other
// animations, such as a loading spinner, run on their own.
function isTransition(animation: Animation) {
  return "transitionProperty" in animation;
}

interface Transition {
  animation: Animation;
  recording: Recording;
}

// The transitions that run in the target, on the elements that the figure
// includes, with a recording of each.
function getTransitions(
  element: HTMLElement,
  include: (element: Element) => boolean,
) {
  // The animations come from elements of the target, in its window.
  const { KeyframeEffect } = getWindow(element);
  return element.getAnimations({ subtree: true }).flatMap((animation) => {
    if (!isTransition(animation)) return [];
    const { effect } = animation;
    if (!(effect instanceof KeyframeEffect)) return [];
    if (!effect.target) return [];
    if (!include(effect.target)) return [];
    const keyframes = effect.getKeyframes().map((keyframe) => {
      // The browser computes this offset, and a new animation can't take it.
      const { computedOffset: _, ...rest } = keyframe;
      return rest;
    });
    const recording: Recording = {
      target: effect.target,
      keyframes,
      timing: effect.getTiming(),
    };
    const transition: Transition = { animation, recording };
    return transition;
  });
}

// A replay runs the keyframes of each transition in an animation of its own.
// WebKit starts new transitions when a finished transition plays again, so the
// transitions themselves don't replay.
function createReplay(recording: Recording) {
  const { target, keyframes, timing } = recording;
  const animation = target.animate(keyframes, {
    delay: timing.delay,
    duration: timing.duration,
    easing: timing.easing,
    // A transition shows its start value during its delay.
    fill: timing.fill,
  });
  return animation;
}

function getEndTime(animation: Animation) {
  const endTime = animation.effect?.getComputedTiming().endTime;
  return typeof endTime === "number" ? endTime : 0;
}

function getCurrentTime(animation: Animation) {
  const currentTime = animation.currentTime;
  return typeof currentTime === "number" ? currentTime : 0;
}

// The transitions of one change start together, such as the move and the resize
// of a box. The longest one sets the end.
function getEnd(animations: Animation[]) {
  return Math.max(0, ...animations.map(getEndTime));
}

function getProgress(animations: Animation[]) {
  const end = getEnd(animations);
  if (!end) return 1;
  const time = Math.max(0, ...animations.map(getCurrentTime));
  return Math.min(1, time / end);
}

// Pauses an animation at a time, so it shows that frame.
function seek(animation: Animation, time: number) {
  animation.pause();
  animation.currentTime = Math.min(getEndTime(animation), time);
}

// Chromium plays a finished animation again when its rate changes, so only the
// animations that can still move take the speed.
function setSpeed(animations: Animation[], speed: number) {
  for (const animation of animations) {
    if (isFinished(animation)) continue;
    animation.updatePlaybackRate(speed);
  }
}

function isFinished(animation: Animation) {
  return animation.playState === "finished";
}

function isRunning(animation: Animation) {
  return animation.playState === "running";
}

function formatSpeed(speed: number) {
  return `${speed}×`;
}

export interface PlaybackProps {
  /** The element whose transitions the controls slow, replay, and scrub. */
  target: RefObject<HTMLElement | null>;
  /**
   * Whether the transitions of an element in the target are part of the motion
   * that the figure explains. Leave out the feedback of a control, such as the
   * scale of a pressed button, which would replace the motion when the control
   * is released. By default, every element is part of it.
   */
  include?: (element: Element) => boolean;
}

function includeAll() {
  return true;
}

/**
 * Controls the CSS transitions that run in the target, with the Web Animations
 * API: a speed that slows them, a button that replays the last ones, and a
 * scrubber that moves them to a point in time. The controls wait for the first
 * transition. A part that turns off its motion with reduced motion, such as a
 * glider, leaves them off, also when reduced motion or forced colors turn on
 * after a transition. A replay starts the transitions of one change together,
 * so it doesn't keep a stagger between them. A press or a key in the target
 * ends a scrub or a replay, and the target shows the end of its last change.
 * @example
 * <Figure controls={<Playback target={subjectRef} />}>...</Figure>
 */
export function Playback({ target, include = includeAll }: PlaybackProps) {
  const [speed, setSpeedState] = useState(1);
  const [progress, setProgress] = useState(1);
  const [ready, setReady] = useState(false);
  const speedRef = useRef(speed);
  // The transitions of the last change, which a replay runs again.
  const recordingsRef = useRef<Recording[]>([]);
  // The animations that the scrubber follows: the transitions of the last
  // change, or their replays.
  const animationsRef = useRef<Animation[]>([]);
  const replaysRef = useRef<Animation[]>([]);
  const frameRef = useRef(0);

  // The scrubber follows the animations while they play.
  const follow = () => {
    cancelAnimationFrame(frameRef.current);
    const step = () => {
      const animations = animationsRef.current;
      setProgress(getProgress(animations));
      if (!animations.some(isRunning)) return;
      frameRef.current = requestAnimationFrame(step);
    };
    step();
  };

  const finishTransitions = (element: HTMLElement) => {
    for (const { animation } of getTransitions(element, include)) {
      animation.finish();
    }
  };

  const cancelReplays = () => {
    for (const animation of replaysRef.current) {
      animation.cancel();
    }
    replaysRef.current = [];
  };

  // Replays start paused. The transitions under them can still run, so they
  // finish first. Otherwise, a replay that ends would show them again, still on
  // their way at their own speed.
  const startReplays = (element: HTMLElement) => {
    cancelReplays();
    finishTransitions(element);
    const replays = recordingsRef.current.map(createReplay);
    for (const animation of replays) {
      seek(animation, 0);
      animation.updatePlaybackRate(speedRef.current);
    }
    replaysRef.current = replays;
    animationsRef.current = replays;
    return replays;
  };

  // The speed applies to the animations that the scrubber follows: the
  // transitions of the last change, or their replays.
  useEffect(() => {
    speedRef.current = speed;
    setSpeed(animationsRef.current, speed);
  }, [speed]);

  // The transitions that run together are one change of the subject. A
  // transition that starts later belongs to a new change, which replaces the
  // transitions of the last one.
  const onTransitionRun = useEffectEvent(
    (element: HTMLElement, event: Event) => {
      if (!(event.target instanceof getWindow(element).Element)) return;
      if (!include(event.target)) return;
      // While a replay holds the subject, only a press or a key ends it. A
      // restyle under it, such as a hover, makes Firefox start the transitions
      // again from the frame that the replay shows, which are no new change.
      if (replaysRef.current.some((animation) => !isFinished(animation))) {
        return;
      }
      cancelReplays();
      const transitions = getTransitions(element, include);
      const animations = transitions.map(({ animation }) => animation);
      setSpeed(animations, speedRef.current);
      animationsRef.current = animations;
      recordingsRef.current = transitions.map(({ recording }) => recording);
      setReady(transitions.length > 0);
      follow();
    },
  );

  // A replay holds the values of the subject, also when a scrub paused it, so a
  // change of the subject would start no transition. A press or a key in the
  // subject ends the replay first, also when no change follows. The subject
  // then shows the end of its last change, which a new change starts from. The
  // transitions under the replay can still run, or Firefox can have started
  // them again, so they finish too.
  const onInteract = useEffectEvent((element: HTMLElement) => {
    if (!replaysRef.current.length) return;
    cancelReplays();
    finishTransitions(element);
    animationsRef.current = [];
    setProgress(1);
  });

  // When the motion turns off, the recordings point to elements that the
  // subject removed, so the controls turn off until the next transition.
  const onMotionChange = useEffectEvent((query: MediaQueryList) => {
    if (!query.matches) return;
    cancelReplays();
    animationsRef.current = [];
    recordingsRef.current = [];
    setReady(false);
    setProgress(1);
  });

  const onUnmount = useEffectEvent(() => {
    cancelAnimationFrame(frameRef.current);
    cancelReplays();
  });

  useEffect(() => {
    const element = target.current;
    if (!element) return;
    const listener = (event: Event) => onTransitionRun(element, event);
    const interact = () => onInteract(element);
    const query = getWindow(element).matchMedia(NO_MOTION_QUERY);
    const motionChange = () => onMotionChange(query);
    element.addEventListener("transitionrun", listener);
    element.addEventListener("pointerdown", interact, true);
    element.addEventListener("keydown", interact, true);
    query.addEventListener("change", motionChange);
    return () => {
      element.removeEventListener("transitionrun", listener);
      element.removeEventListener("pointerdown", interact, true);
      element.removeEventListener("keydown", interact, true);
      query.removeEventListener("change", motionChange);
      onUnmount();
    };
  }, [target]);

  const replay = () => {
    const element = target.current;
    if (!element) return;
    for (const animation of startReplays(element)) {
      animation.play();
    }
    follow();
  };

  const scrub = (value: number) => {
    const element = target.current;
    if (!element) return;
    if (!replaysRef.current.length) {
      startReplays(element);
    }
    const animations = replaysRef.current;
    const time = (value / SCRUB_STEPS) * getEnd(animations);
    for (const animation of animations) {
      seek(animation, time);
    }
    setProgress(value / SCRUB_STEPS);
  };

  return (
    <div className="flex flex-1 flex-wrap items-end gap-x-6 gap-y-3">
      <Button $kind="flat" disabled={!ready} onClick={replay}>
        Replay
      </Button>
      <RadioGroup
        label="Speed"
        $kind="segmented"
        value={String(speed)}
        setValue={(value) => setSpeedState(Number(value))}
      >
        {SPEEDS.map((item) => (
          <RadioCard key={item} value={String(item)} $kind="segmented">
            <RadioCardLabel>{formatSpeed(item)}</RadioCardLabel>
          </RadioCard>
        ))}
      </RadioGroup>
      <FigureSlider
        label="Time"
        min={0}
        max={SCRUB_STEPS}
        value={Math.round(progress * SCRUB_STEPS)}
        disabled={!ready}
        format={(value) => `${value}%`}
        onChange={scrub}
      />
    </div>
  );
}
