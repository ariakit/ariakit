import { useEffect, useState } from "react";

export default function useDelayedValue<T>(value: T, delay = 250): T {
  const [delayedValue, setDelayedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDelayedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [delay, value]);

  return delayedValue;
}
