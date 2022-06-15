import { act as reactAct } from "@testing-library/react";

export type DirtiableElement = Element & { dirty?: boolean };

export type TextField = HTMLInputElement | HTMLTextAreaElement;

export const isBrowser =
  typeof navigator !== "undefined" &&
  !navigator.userAgent.includes("jsdom") &&
  !("happyDOM" in window);

const noopAct = ((callback) => callback()) as typeof reactAct;

export const act = isBrowser ? noopAct : reactAct;

export function queuedMicrotasks(): Promise<void> {
  return act(() => Promise.resolve());
}

export function nextFrame(): Promise<void> {
  return act(
    () => new Promise((resolve) => requestAnimationFrame(() => resolve()))
  );
}
