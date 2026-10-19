import { useEffect, useRef, useState } from "react";

export interface UsePerceptibleValueOptions<T> {
  /**
   * Milliseconds to wait before a new value appears. A change that reverts
   * within this time never appears.
   * @default 0
   */
  delay?: number;
  /**
   * Milliseconds that each value stays after it appears, so a quick change does
   * not flash on screen.
   * @default 350
   */
  minDuration?: number;
  /**
   * The value returned before the first change appears. Defaults to the initial
   * `value`. For example, pass `false` for a loading flag so that a fast load
   * on mount never shows a loading state.
   */
  initialValue?: T;
}

/**
 * Returns `value` after it stays the same for `delay` milliseconds, and keeps
 * each returned value for at least `minDuration` milliseconds.
 * @example
 * const showSpinner = usePerceptibleValue(loading, {
 *   delay: loading ? 300 : 0,
 *   minDuration: 200,
 *   initialValue: false,
 * });
 */
export function usePerceptibleValue<T>(
  value: T,
  options: UsePerceptibleValueOptions<T> = {},
) {
  const { delay = 0, minDuration = 350 } = options;
  const [perceptibleValue, setPerceptibleValue] = useState<T>(() => {
    if (!Object.hasOwn(options, "initialValue")) {
      return value;
    }
    // The key is present, so an undefined value is the caller's own T.
    return options.initialValue as T;
  });
  const nextThresholdRef = useRef(0);

  useEffect(() => {
    // An unchanged value must not start a timer or a new minimum window.
    if (Object.is(value, perceptibleValue)) return;
    const remaining = Math.max(0, nextThresholdRef.current - Date.now());
    // The delay and the minimum duration of the current value run at the same
    // time, so the new value waits only for the later of the two.
    const timer = setTimeout(
      () => {
        nextThresholdRef.current = Date.now() + minDuration;
        setPerceptibleValue(value);
      },
      Math.max(delay, remaining),
    );
    return () => clearTimeout(timer);
  }, [value, perceptibleValue, delay, minDuration]);

  return perceptibleValue;
}
