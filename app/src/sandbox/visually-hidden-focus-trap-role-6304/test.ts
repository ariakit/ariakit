import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6304
test("documented zero-argument Solid hooks return usable props", () => {
  expect(q.link.ensure(/Learn more\s+about the Solar System/)).toBeVisible();
  expect(q.region.ensure("Focus trap region")).toBeVisible();
  expect(q.text.ensure("Role rendered")).toBeVisible();
  expect(q.text.ensure(/about the Solar System/)).toHaveStyle({
    position: "absolute",
  });
});
