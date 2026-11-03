import { click, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("copies the text at the moment of the click", async () => {
  await click(q.textbox("Release note"));
  await type(" Added the copy button.");
  // Without styles, the hidden feedback text is also in the name.
  await click(q.button(/^Copy note/));
  await expect
    .poll(() => navigator.clipboard.readText())
    .toBe(
      "Fixed the focus order of the settings dialog. Added the copy button.",
    );
});
