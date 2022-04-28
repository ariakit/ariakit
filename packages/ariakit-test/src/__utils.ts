import { act } from "./act";

export type DirtiableElement = Element & { dirty?: boolean };

export type TextField = HTMLInputElement | HTMLTextAreaElement;

export function queuedMicrotasks(): Promise<void> {
  return act(() => Promise.resolve());
}

export function nextFrame(): Promise<void> {
  return act(
    () => new Promise((resolve) => requestAnimationFrame(() => resolve()))
  );
}
