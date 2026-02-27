import * as React from "react";

export function useIsMobile(defaultState = false, maxWidth = 768) {
  const [isMobile, setIsMobile] = React.useState(defaultState);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${maxWidth - 1}px)`);
    const onChange = () => {
      setIsMobile(mql.matches);
    };
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [maxWidth]);

  return !!isMobile;
}
