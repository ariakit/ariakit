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
          View details
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
            aria-labelledby="r:2"
            class="dialog"
            data-dialog=""
            hidden=""
            id="r:0"
            role="dialog"
            style="display: none;"
            tabindex="-1"
          >
            <button
              class="dismiss"
              data-command=""
              data-dialog-dismiss=""
              type="button"
            >
              <svg
                aria-label="Dismiss popup"
                display="block"
                fill="none"
                height="1em"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5pt"
                viewBox="0 0 16 16"
                width="1em"
              >
                <line
                  x1="4"
                  x2="12"
                  y1="4"
                  y2="12"
                />
                <line
                  x1="4"
                  x2="12"
                  y1="12"
                  y2="4"
                />
              </svg>
            </button>
            <h1
              class="heading"
              id="r:2"
            >
              Apples
            </h1>
            <ul>
              <li>
                <strong>
                  Calories:
                </strong>
                 95
              </li>
              <li>
                <strong>
                  Carbs:
                </strong>
                 25 grams
              </li>
              <li>
                <strong>
                  Fibers:
                </strong>
                 4 grams
              </li>
              <li>
                <strong>
                  Vitamin C:
                </strong>
                 14% of the Reference Daily Intake (RDI)
              </li>
              <li>
                <strong>
                  Potassium:
                </strong>
                 6% of the RDI
              </li>
              <li>
                <strong>
                  Vitamin K:
                </strong>
                 5% of the RDI
              </li>
            </ul>
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
  expect(getByRole("dialog", { hidden: true })).not.toBeVisible();
});

test("esc", async () => {
  render(<Example />);
  await click(getByRole("button"));
  expect(getByRole("dialog")).toBeVisible();
  await press.Escape();
  expect(getByRole("dialog", { hidden: true })).not.toBeVisible();
});
