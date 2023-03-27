import { getByRole } from "@ariakit/test";

test("markup", () => {
  expect(getByRole("button")).toMatchInlineSnapshot(`
    <div
      class="button"
      data-command=""
      role="button"
      tabindex="0"
    >
      Button
    </div>
  `);
});
