import { blur, getByRole, hover, press, render } from "ariakit-test-utils";
import Example from ".";

test("render tooltip", () => {
  const { baseElement } = render(<Example />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          aria-labelledby=":r0:"
          class="button"
          data-command=""
          tabindex="0"
          type="button"
        >
          Hover or focus on me
        </button>
      </div>
      <div
        id=":r0:-portal"
      >
        <div
          role="presentation"
          style="position: absolute; left: 0px; top: 0px; margin: 0px;"
        >
          <div
            class="tooltip"
            hidden=""
            id=":r0:"
            role="tooltip"
            style="display: none;"
          >
            Tooltip
          </div>
        </div>
      </div>
    </body>
  `);
});

test("show tooltip on hover", async () => {
  const { baseElement } = render(<Example />);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  await hover(getByRole("button"));
  expect(getByRole("tooltip")).toBeVisible();
  await hover(baseElement);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
});

test("show tooltip on focus", async () => {
  render(<Example />);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  await press.Tab();
  expect(getByRole("tooltip")).toBeVisible();
  await blur();
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
});
