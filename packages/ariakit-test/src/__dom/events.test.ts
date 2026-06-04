import { expect, test } from "vitest";
import { createEvent, fireEvent } from "./events.ts";

test("the doubleClick alias exists on both createEvent and fireEvent", () => {
  // `dispatch` builds its methods by pairing every `fireEvent` key with the
  // matching `createEvent` method, so the `doubleClick` alias must exist on
  // both — otherwise `dispatch.doubleClick` would call an undefined
  // `createEvent.doubleClick`.
  expect("doubleClick" in fireEvent).toBe(true);
  expect("doubleClick" in createEvent).toBe(true);
});
