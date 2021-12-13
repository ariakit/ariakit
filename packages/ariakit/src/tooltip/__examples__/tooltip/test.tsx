import { getByRole, hover, render } from "ariakit-test-utils";
import Example from ".";

test("render tooltip", () => {
  render(<Example />);
  expect(getByRole("button")).toMatchInlineSnapshot(`
    <button
      aria-labelledby="r:0"
      tabindex="0"
    >
      Hover on me!
    </button>
  `);
});

test("hover tooltip", async () => {
  render(<Example />);
  await hover(getByRole("button"));
  expect(getByRole("tooltip")).toBeVisible();
});
