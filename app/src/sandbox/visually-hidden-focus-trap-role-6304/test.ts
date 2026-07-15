import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6304
test("documented zero-argument Solid hooks return usable props", () => {
  expect(q.link(/Learn more\s+about the Solar System/)).toBeVisible();
  expect(q.region("Focus trap region")).toBeVisible();
  expect(q.text("Role rendered")).toBeVisible();
  expect(q.text(/about the Solar System/)).toHaveStyle({
    position: "absolute",
  });
});
