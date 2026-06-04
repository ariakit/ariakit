import { expect, test } from "vitest";
import { dispatch } from "../dispatch.ts";
import { createEvent, fireEvent } from "./events.ts";

test("the doubleClick alias is typed and present on createEvent, fireEvent, and dispatch", () => {
  // The `doubleClick` alias must stay part of the public type — it was typed
  // before `@ariakit/test` dropped its Testing Library dependency — and exist at
  // runtime, so `dispatch.doubleClick(...)` both type-checks and works. Each
  // property access below fails `tsc` if the alias is missing from the type, and
  // the `typeof` check fails the assertion if it's missing at runtime (e.g. if
  // `dispatch` didn't pair `fireEvent`'s keys with a `createEvent.doubleClick`).
  expect(typeof createEvent.doubleClick).toBe("function");
  expect(typeof fireEvent.doubleClick).toBe("function");
  expect(typeof dispatch.doubleClick).toBe("function");
});
