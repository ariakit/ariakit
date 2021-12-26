import { click, getByRole, press, render } from "ariakit-test-utils";
import Example from "./index";

test("render dialog", () => {
  const { baseElement } = render(<Example />);
  expect(baseElement).toMatchInlineSnapshot(`
    <body>
      <div>
        <button
          aria-controls="r:0"
          aria-expanded="false"
          aria-haspopup="dialog"
          class="button"
          data-command=""
          data-disclosure=""
          type="button"
        >
          Open dialog
        </button>
      </div>
      <div
        id="r:0-portal"
      >
        <div
          data-backdrop="r:0"
          hidden=""
          role="presentation"
          style="position: fixed; top: 0px; right: 0px; bottom: 0px; left: 0px; display: none;"
          tabindex="-1"
        >
          <div
            aria-label="Welcome"
            class="dialog"
            data-dialog=""
            hidden=""
            id="r:0"
            role="dialog"
            style="display: none;"
            tabindex="-1"
          >
            Welcome to Ariakit!
          </div>
        </div>
      </div>
    </body>
  `);
});

test("dialog should be visible on click", async () => {
  render(<Example />);
  expect(getByRole("dialog", { hidden: true })).not.toBeVisible();
  await click(getByRole("button"));
  expect(getByRole("dialog", { hidden: true })).toBeVisible();
});

test("enter", async () => {
  render(<Example />);
  expect(getByRole("dialog", { hidden: true })).not.toBeVisible();
  await click(getByRole("button"));
  await press.Tab();
  await press.Enter();
  expect(getByRole("dialog")).toBeVisible();
});

test("esc", async () => {
  render(<Example />);
  await click(getByRole("button"));
  expect(getByRole("dialog")).toBeVisible();
  await press.Escape();
  expect(getByRole("dialog", { hidden: true })).not.toBeVisible();
});
