import { useEffect, useState } from "react";
import whenIdle from "./when-idle";

export default function useIdle(timeout?: number) {
  const [idle, setIdle] = useState(true);

  useEffect(() => {
    return whenIdle(() => setIdle(true), timeout);
  }, [timeout]);

  return idle;
}
