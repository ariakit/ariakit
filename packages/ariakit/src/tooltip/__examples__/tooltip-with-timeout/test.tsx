import {
  blur,
  getByRole,
  hover,
  press,
  render,
  waitFor,
} from "ariakit-test-utils";
import Example from ".";

test("render tooltip", () => {
  const { baseElement } = render(<Example />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          aria-labelledby="r:0"
          class="button"
          data-command=""
          tabindex="0"
          type="button"
        >
          Hover or focus on me and wait for 2 seconds
        </button>
      </div>
      <div
        id="r:0-portal"
      >
        <div>
          <div
            class="tooltip"
            hidden=""
            id="r:0"
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

test("show tooltip on hover after timeout", async () => {
  const { baseElement } = render(<Example />);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  await hover(getByRole("button"));
  await waitFor(() => expect(getByRole("tooltip")).toBeVisible(), {
    timeout: 2000,
  });
  await hover(baseElement);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
});

test("show tooltip on focus after timeout", async () => {
  render(<Example />);
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
  await press.Tab();
  await waitFor(() => expect(getByRole("tooltip")).toBeVisible(), {
    timeout: 2000,
  });
  await blur();
  expect(getByRole("tooltip", { hidden: true })).not.toBeVisible();
});
