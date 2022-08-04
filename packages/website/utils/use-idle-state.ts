import { useEffect, useState } from "react";

export default function useIdle(timeout?: number) {
  const [idle, setIdle] = useState(true);

  useEffect(() => {
    if (!window.requestIdleCallback) {
      setIdle(true);
      return;
    }
    const id = requestIdleCallback(() => setIdle(true), { timeout });
    return () => cancelIdleCallback(id);
  }, [timeout]);

  return idle;
}
