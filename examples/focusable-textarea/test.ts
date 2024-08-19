import { q } from "@ariakit/test";

test("markup", () => {
  expect(q.textbox()).toMatchInlineSnapshot(`
    <textarea
      class="textarea"
      placeholder="Write your comment, be kind"
    />
  `);
});
