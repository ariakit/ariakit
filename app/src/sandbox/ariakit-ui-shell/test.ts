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

// https://github.com/ariakit/ariakit/issues/7532
test("keeps a consumer toggle in step with the sidebar class and body id", async () => {
  const toggle = q.button("Toggle sidebar");
  const column = getColumn("Documentation");
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(toggle).toHaveAttribute(
    "aria-controls",
    q.navigation("Documentation").id,
  );
  expect(column).toHaveClass("shell-sidebar-open");
  await click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(column).not.toHaveClass("shell-sidebar-open");
  await click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(column).toHaveClass("shell-sidebar-open");
});

// https://github.com/ariakit/ariakit/issues/7532
test("opens the table of contents from its own toggle without touching the navigation", async () => {
  const contents = getColumn("On this page");
  expect(contents).not.toHaveClass("shell-sidebar-open");
  await click(q.button("Toggle table of contents"));
  expect(contents).toHaveClass("shell-sidebar-open");
  expect(getColumn("Documentation")).toHaveClass("shell-sidebar-open");
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

// https://github.com/ariakit/ariakit/issues/7532
test("keeps an uncontrolled panel open, with no toggle", async () => {
  await selectScenario("static");
  expect(q.complementary("Sections")).toBeInTheDocument();
  expect(getColumn("Sections")).toHaveClass("shell-sidebar-open");
  expect(q.button.maybe("Toggle sidebar")).not.toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/7532
test("forwards the public sidebar props and events to its landmark body", async () => {
  await selectScenario("geometry");
  const toggle = q.button("Toggle layout navigation");
  await click(toggle);
  const body = q.navigation("Layout navigation");
  const column = getColumn("Layout navigation");
  expect(toggle).toHaveAttribute("aria-controls", body.id);
  expect(body).toHaveClass("layout-navigation");
  expect(body).toHaveAttribute("title", "Navigation body");
  expect(body).toHaveAttribute("aria-describedby", "navigation-description");
  expect(column).not.toHaveAttribute("id");
  expect(column).not.toHaveAttribute("aria-label");
  expect(column).not.toHaveClass("layout-navigation");
  await click(q.link("Layout section"));
  expect(q.text("Navigation selected")).toBeInTheDocument();
});
