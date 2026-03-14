import { join } from "node:path";
import { getPreviewId } from "./preview.ts";

test("getPreviewId returns the preview id for example directories", () => {
  const dirname = join(import.meta.dirname, "../examples/disclosure");
  expect(getPreviewId(dirname)).toBe("disclosure");
});

test("getPreviewId returns nested preview ids", () => {
  const dirname = join(import.meta.dirname, "../examples/disclosure/group");
  expect(getPreviewId(dirname)).toBe("disclosure/group");
});

test("getPreviewId supports sandbox directories", () => {
  const dirname = join(import.meta.dirname, "../sandbox/5518");
  expect(getPreviewId(dirname)).toBe("5518");
});

test("getPreviewId returns null outside preview directories", () => {
  expect(getPreviewId(import.meta.dirname)).toBeNull();
});
