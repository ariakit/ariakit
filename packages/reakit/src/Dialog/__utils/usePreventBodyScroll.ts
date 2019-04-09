import * as React from "react";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { unstable_DialogOptions } from "../Dialog";

export function usePreventBodyScroll(
  targetRef: React.RefObject<HTMLElement>,
  options: unstable_DialogOptions
) {
  const shouldPrevent = !options.unstable_modal
    ? false
    : Boolean(options.unstable_preventBodyScroll && options.visible);

  React.useEffect(() => {
    const element = targetRef.current;
    if (!element || !shouldPrevent) return undefined;
    disableBodyScroll(element);
    return () => enableBodyScroll(element);
  }, [targetRef, shouldPrevent]);
}
