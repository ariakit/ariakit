import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import type { ExpectStatic } from "vitest";

// Remove this bridge when jest-dom declares Vitest 5's Matchers interface.
// https://github.com/testing-library/jest-dom/issues/738
declare module "vitest" {
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > extends TestingLibraryMatchers<
    ReturnType<ExpectStatic["stringContaining"]>,
    R
  > {}
}
