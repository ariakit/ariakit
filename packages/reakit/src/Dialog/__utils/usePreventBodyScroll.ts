import * as React from "react";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { DialogOptions } from "../Dialog";

export function usePreventBodyScroll(
  targetRef: React.RefObject<HTMLElement>,
  options: DialogOptions
) {
  const shouldPrevent = !options.modal
    ? false
    : Boolean(options.preventBodyScroll && options.visible);

  React.useEffect(() => {
    const element = targetRef.current;
    if (!element || !shouldPrevent) return undefined;
    disableBodyScroll(element, { reserveScrollBarGap: true });
    return () => enableBodyScroll(element);
  }, [targetRef, shouldPrevent]);
}
