import { useEffect, useRef, useState } from "react";

export function usePerceptibleValue<T>(
  value: T,
  { delay = 0, minDuration = 350 } = {},
) {
  const [perceptibleValue, setPerceptibleValue] = useState(value);
  const nextThresholdRef = useRef(0);

  useEffect(() => {
    const remaining = Math.max(0, nextThresholdRef.current - Date.now());

    const timer = setTimeout(() => {
      nextThresholdRef.current = Date.now() + minDuration;
      setPerceptibleValue(value);
    }, delay + remaining);

    return () => clearTimeout(timer);
  }, [value, delay, minDuration]);

  return perceptibleValue;
}
