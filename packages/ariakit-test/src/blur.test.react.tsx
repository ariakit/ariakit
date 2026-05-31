import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { expect, test } from "vitest";
import { blur } from "./blur.ts";
import { q, render } from "./react.tsx";

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

function useAllEvents(ref: RefObject<Element | null>, stack: string[]) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const handler = (event: Event) =>
      stack.push(`${event.type} ${getIdentifier(event.target as HTMLElement)}`);
    for (const event of eventNames) {
      element.addEventListener(event, handler);
    }
    return () => {
      for (const event of eventNames) {
        element.removeEventListener(event, handler);
      }
    };
  }, [ref, stack]);
}

test("blur", async () => {
  const stack: string[] = [];

  const Test = () => {
    const ref = useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return (
      <button ref={ref} autoFocus>
        button
      </button>
    );
  };

  await render(<Test />);

  expect(q.button()).toHaveFocus();
  await blur(q.button());
  expect(document.body).toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    [
      "blur button",
      "focusout button",
    ]
  `);
});
