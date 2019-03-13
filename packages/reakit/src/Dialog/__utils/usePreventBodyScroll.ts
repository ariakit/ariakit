import * as React from "react";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";

export function usePreventBodyScroll(
  targetElementRef: React.RefObject<HTMLElement>,
  shouldPrevent?: boolean
) {
  React.useEffect(() => {
    const element = targetElementRef.current;

    if (!element || !shouldPrevent) return undefined;

    disableBodyScroll(element);
    return () => enableBodyScroll(element);
  }, [targetElementRef, shouldPrevent]);
}
