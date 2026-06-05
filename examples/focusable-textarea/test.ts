import { expect, test, press, q } from "../../browser-test-utils.ts";

test("markup", () => {
  expect(q.textbox()).toMatchInlineSnapshot(`
    <textarea
      class="textarea"
      placeholder="Write your comment, be kind"
    />
  `);
});

test("sets data-focus-visible attribute", async () => {
  await press.Tab();
  expect(q.textbox()).toHaveAttribute("data-focus-visible", "true");
});
