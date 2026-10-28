import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("renders the tags inside the listbox and the input outside it", async ({
    q,
  }) => {
    await expect(q.listbox("Tags")).not.toHaveAttribute("aria-owns");
    const tagList = query(q.listbox("Tags"));
    await expect(tagList.option()).toHaveCount(2);
    // The listbox role accepts only options as children, so the input must be a
    // sibling of the tag list rather than a descendant of it.
    await expect(tagList.textbox()).toHaveCount(0);
    await expect(q.textbox("Tags")).toBeVisible();
  });
});
