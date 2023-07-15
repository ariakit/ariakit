import { useEffect } from "react";

const eventNames = [
  "abort",
  "animationcancel",
  "animationend",
  "animationiteration",
  "animationstart",
  "auxclick",
  "beforeinput",
  "blur",
  "cancel",
  "canplay",
  "canplaythrough",
  "change",
  "click",
  "close",
  "contextmenu",
  "cuechange",
  "dblclick",
  "drag",
  "dragend",
  "dragenter",
  "dragexit",
  "dragleave",
  "dragover",
  "dragstart",
  "drop",
  "durationchange",
  "emptied",
  "ended",
  "error",
  "focus",
  "focusin",
  "focusout",
  "gotpointercapture",
  "input",
  "invalid",
  "keydown",
  "keypress",
  "keyup",
  "load",
  "loadeddata",
  "loadedmetadata",
  "loadend",
  "loadstart",
  "lostpointercapture",
  "mousedown",
  "mouseenter",
  "mouseleave",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "pause",
  "play",
  "playing",
  "pointercancel",
  "pointerdown",
  "pointerenter",
  "pointerleave",
  "pointermove",
  "pointerout",
  "pointerover",
  "pointerup",
  "progress",
  "ratechange",
  "reset",
  "resize",
  "scroll",
  "securitypolicyviolation",
  "seeked",
  "seeking",
  "select",
  "selectionchange",
  "selectstart",
  "stalled",
  "submit",
  "suspend",
  "timeupdate",
  "toggle",
  "touchcancel",
  "touchend",
  "touchmove",
  "touchstart",
  "transitioncancel",
  "transitionend",
  "transitionrun",
  "transitionstart",
  "volumechange",
  "waiting",
  "wheel",
];

function getIdentifier(element: HTMLElement) {
  return (
    element.id ||
    element.getAttribute("aria-label") ||
    element.ownerDocument?.getElementById(
      element.getAttribute("aria-labelledby") || "",
    )?.textContent ||
    element.textContent
  );
}

export function useAllEvents(ref: React.RefObject<Element>, stack: string[]) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const handler = (event: Event) =>
      stack.push(`${event.type} ${getIdentifier(event.target as HTMLElement)}`);
    eventNames.forEach((event) => element.addEventListener(event, handler));
    return () => {
      eventNames.forEach((event) =>
        element.removeEventListener(event, handler),
      );
    };
  }, [ref]);
}
