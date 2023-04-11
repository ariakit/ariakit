import { getByRole } from "@ariakit/test";

test("markup", () => {
  expect(getByRole("link")).toMatchInlineSnapshot(`
    <a
      class="button"
      data-command=""
      href="#"
    >
      Button
    </a>
  `);
});
