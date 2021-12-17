import { click, getByRole, press, render } from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

function getTab(name: string) {
  return getByRole("tab", { name });
}

function getPanel(name: string) {
  return getByRole("tabpanel", { name });
}

test("markup", () => {
  const { container } = render(<Example />);
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="wrapper"
      >
        <div
          aria-label="Groceries"
          aria-orientation="horizontal"
          class="tab-list"
          role="tablist"
        >
          <a
            aria-controls="r:6"
            aria-selected="true"
            class="tab"
            data-command=""
            href="/fruits"
            id="/fruits"
            role="tab"
          >
            Fruits
          </a>
          <a
            aria-selected="false"
            class="tab"
            data-command=""
            href="/vegetables"
            id="/vegetables"
            role="tab"
            tabindex="-1"
          >
            Vegetables
          </a>
          <a
            aria-selected="false"
            class="tab"
            data-command=""
            href="/meat"
            id="/meat"
            role="tab"
            tabindex="-1"
          >
            Meat
          </a>
        </div>
        <div
          aria-labelledby="/fruits"
          id="r:6"
          role="tabpanel"
          tabindex="0"
        >
          <ul>
            <li>
              🍎 Apple
            </li>
            <li>
              🍇 Grape
            </li>
            <li>
              🍊 Orange
            </li>
          </ul>
        </div>
      </div>
    </div>
  `);
});

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("default selected tab", () => {
  render(<Example />);
  expect(getTab("Fruits")).toHaveAttribute("aria-selected", "true");
  expect(getPanel("Fruits")).toBeVisible();
});

test("select with keyboard", async () => {
  render(<Example />);
  await press.Tab();
  await press.ArrowRight();
  expect(getTab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(getTab("Vegetables")).toHaveFocus();
  expect(getPanel("Vegetables")).toBeVisible();
  await press.ArrowRight();
  expect(getTab("Meat")).toHaveAttribute("aria-selected", "true");
  expect(getTab("Meat")).toHaveFocus();
  expect(getPanel("Meat")).toBeVisible();
  await press.ArrowRight();
  expect(getTab("Fruits")).toHaveAttribute("aria-selected", "true");
  expect(getTab("Fruits")).toHaveFocus();
  expect(getPanel("Fruits")).toBeVisible();
  await press.ArrowLeft();
  expect(getTab("Meat")).toHaveAttribute("aria-selected", "true");
  expect(getTab("Meat")).toHaveFocus();
  expect(getPanel("Meat")).toBeVisible();
});

test("select with mouse", async () => {
  render(<Example />);
  await click(getTab("Vegetables"));
  expect(getTab("Vegetables")).toHaveAttribute("aria-selected", "true");
  expect(getTab("Vegetables")).toHaveFocus();
  expect(getPanel("Vegetables")).toBeVisible();
});
