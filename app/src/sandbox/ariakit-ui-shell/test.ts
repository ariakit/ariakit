import { click, dispatch, q } from "@ariakit/test";
import { expect, test } from "vitest";

async function selectScenario(value: string) {
  await dispatch.change(q.combobox("Scenario"), { target: { value } });
}

function getColumn(label: string) {
  const landmark = q.navigation.maybe(label) ?? q.complementary(label);
  const column = landmark.closest(".shell-sidebar");
  expect(column).not.toBeNull();
  return column as HTMLElement;
}

test("renders the docs page as one banner, one main, one contentinfo and labelled navigations", () => {
  expect(q.banner()).toBeInTheDocument();
  expect(q.main()).toBeInTheDocument();
  expect(q.contentinfo()).toBeInTheDocument();
  expect(q.navigation("Documentation")).toBeInTheDocument();
  expect(q.navigation("On this page")).toBeInTheDocument();
});

test("toggles the navigation sidebar from a disclosure linked to its column", async () => {
  const toggle = q.button("Toggle sidebar");
  const column = getColumn("Documentation");
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(toggle).toHaveAttribute("aria-controls", column.id);
  expect(column).toHaveAttribute("data-open", "true");
  await click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(column).not.toHaveAttribute("data-open");
  await click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(column).toHaveAttribute("data-open", "true");
});

test("opens the table of contents from its own toggle without touching the navigation", async () => {
  const contents = getColumn("On this page");
  expect(contents).not.toHaveAttribute("data-open");
  await click(q.button("Toggle table of contents"));
  expect(contents).toHaveAttribute("data-open", "true");
  expect(getColumn("Documentation")).toHaveAttribute("data-open", "true");
});

test("puts a bare element passed to a bar prop in its part cell", () => {
  // The docs footer passes a link, not a part element, as its end part.
  const cell = q.link("Back to top").closest(".shell-bar-end");
  expect(cell).not.toBeNull();
  expect(cell?.parentElement).toBe(q.contentinfo());
});

test("keeps the icon and the default name on a toggle whose children are false", async () => {
  await selectScenario("settings");
  // Open by default: the conditional label is false.
  const toggle = q.button("Toggle sidebar");
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(toggle.querySelector("svg")).not.toBeNull();
  await click(toggle);
  // Closed: the label is the content and the name.
  expect(q.button("Sections")).toHaveAttribute("aria-expanded", "false");
  expect(q.button.maybe("Toggle sidebar")).not.toBeInTheDocument();
});

test("keeps a panel without a store open, with no toggle", async () => {
  await selectScenario("static");
  expect(q.complementary("Sections")).toBeInTheDocument();
  expect(getColumn("Sections")).toHaveAttribute("data-open", "true");
  expect(q.button.maybe("Toggle sidebar")).not.toBeInTheDocument();
});
