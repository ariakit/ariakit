import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7571
test("does not replay a consumed move when the provider remounts", async () => {
  await click(q.button("Focus italic"));
  expect(q.button("Italic")).toHaveFocus();
  await click(q.button("Hide toolbar"));
  expect(q.toolbar.maybe("Formatting")).not.toBeInTheDocument();
  await click(q.button("Show toolbar"));
  expect(q.button("Hide toolbar")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/7571
test("does not replay a cancelled move after its target returns", async () => {
  await click(q.button("Hide toolbar"));
  await click(q.button("Focus italic"));
  await click(q.button("Select bold"));
  await click(q.button("Select italic"));
  await click(q.button("Show toolbar"));
  expect(q.button("Hide toolbar")).toHaveFocus();
});

for (const target of ["italic", "toolbar"]) {
  test(`preserves a pending move to the ${target} while the provider is absent`, async () => {
    await click(q.button("Hide toolbar"));
    expect(q.toolbar.maybe("Formatting")).not.toBeInTheDocument();
    await click(q.button(`Focus ${target}`));
    await click(q.button("Show toolbar"));
    const element =
      target === "toolbar" ? q.toolbar("Formatting") : q.button("Italic");
    expect(element).toHaveFocus();
  });
}

test("keeps requests separate when the source store changes", async () => {
  await click(q.button("Focus italic"));
  expect(q.button("Italic")).toHaveFocus();
  await click(q.button("Focus bold in second document"));
  await click(q.button("Use second document"));
  expect(q.button("Bold")).toHaveFocus();
  await click(q.button("Use first document"));
  expect(q.button("Use second document")).toHaveFocus();
});

test("keeps move requests independent when only activeId is shared", async () => {
  await click(q.button("Focus first palette"));
  expect(q.toolbar("First palette")).toHaveFocus();
  await click(q.button("Focus second palette"));
  expect(q.toolbar("Second palette")).toHaveFocus();
});

// https://github.com/ariakit/ariakit/pull/7572#discussion_r4067003752
test("focuses an item after an explicit move with a moves-only source", async () => {
  await click(q.button("Focus green"));
  expect(q.button("Green")).toHaveFocus();
  expect(q.text("Moves: 1")).toBeVisible();
});
