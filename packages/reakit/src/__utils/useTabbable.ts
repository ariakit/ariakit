import * as React from "react";
import { selectTabbableIn } from "./tabbable";

export function useTabbable() {
  const ref = React.useRef<HTMLElement | null>(null);
  const [tabbable, setTabbable] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    setTabbable(selectTabbableIn(ref.current));
  }, []);

  return {
    ref,
    tabIndex: tabbable ? undefined : 0
  };
}
