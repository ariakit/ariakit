import { getByRole } from "@ariakit/test";

test("render horizontal separator", () => {
  expect(getByRole("separator")).toMatchInlineSnapshot(`
    <hr
      aria-orientation="horizontal"
      class="separator"
      role="separator"
    />
  `);
});
