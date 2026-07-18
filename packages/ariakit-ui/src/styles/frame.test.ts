import { expect, test } from "vitest";
import { controlSlot } from "./control.ts";
import { frame } from "./frame.ts";
import { glider } from "./glider.ts";

// Regression coverage: the map's "false" branch gave frame and every
// extender an implicit static $rounded: false default, which deadened
// downstream computed fallbacks and appended an inert ak-frame-none that
// each extender had to disarm.
test("leaves $rounded undefined by default so computed fallbacks stay live", () => {
  expect(frame.getVariants({}).$rounded).toBeUndefined();
  expect(frame.html({}).class).not.toContain("ak-frame-none");
  expect(glider.getVariants({}).$rounded).toBe("full");
  expect(glider.getVariants({ $kind: "bar" }).$rounded).toBe("none");
  expect(controlSlot.getVariants({ $kind: "shortcut" }).$rounded).toBe("auto");
});

test("renders square corners through the none value", () => {
  expect(frame.html({ $rounded: "none" }).class).toContain("ak-frame-none");
});
