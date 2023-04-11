import { getByRole } from "@ariakit/test";

test("markup", () => {
  expect(getByRole("button")).toMatchInlineSnapshot(`
    <button
      class="button"
      data-command=""
      type="button"
    >
      Button
    </button>
  `);
});
