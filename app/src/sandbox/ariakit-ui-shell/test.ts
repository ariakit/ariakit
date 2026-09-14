import { click, dispatch, q } from "@ariakit/test";
import { afterEach, expect, test, vi } from "vitest";

async function selectScenario(value: string) {
  await dispatch.change(q.combobox("Scenario"), { target: { value } });
}

function getColumn(label: string) {
  const landmark = q.navigation.maybe(label) ?? q.complementary(label);
  const column = landmark.closest(".shell-sidebar");
  expect(column).not.toBeNull();
  return column as HTMLElement;
}

afterEach(() => {
  vi.restoreAllMocks();
});

test("renders the docs page as one banner, one main, one contentinfo and labelled navigations", () => {
  expect(q.banner()).toBeInTheDocument();
  expect(q.main()).toBeInTheDocument();
  expect(q.contentinfo()).toBeInTheDocument();
  expect(q.navigation("Documentation")).toBeInTheDocument();
  expect(q.navigation("On this page")).toBeInTheDocument();
  // In wide mode the sidebar body is not a dialog.
  expect(q.dialog.maybe("Documentation")).not.toBeInTheDocument();
});

test("mirrors the variants on data attributes that the recipes select on", () => {
  expect(q.banner()).toHaveAttribute("data-sticky", "true");
  expect(q.banner()).toHaveAttribute("data-blur", "md");
  expect(q.main()).toHaveAttribute("data-centered", "true");
  const column = getColumn("Documentation");
  expect(column).toHaveAttribute("data-side", "start");
  expect(column).toHaveAttribute("data-sticky", "true");
  expect(column).toHaveAttribute("data-overlay-below", "md");
  expect(column).not.toHaveAttribute("data-overlay");
  expect(getColumn("On this page")).toHaveAttribute("data-side", "end");
  expect(q.contentinfo()).not.toHaveAttribute("data-sticky");
});

test("toggles the navigation sidebar from a disclosure linked to its body", async () => {
  const toggle = q.button("Toggle sidebar");
  const column = getColumn("Documentation");
  const body = q.navigation("Documentation").parentElement;
  expect(body).not.toBeNull();
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(toggle).toHaveAttribute("aria-controls", body?.id);
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

// The warning about a sidebar wider than its slot needs layout, so it lives in
// the browser test only.
test("warns in development about a percentage width, a wrapped part and a sticky footer", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  await selectScenario("warnings");
  const messages = warn.mock.calls.map(([message]) => String(message));
  expect(messages).toEqual(
    expect.arrayContaining([
      expect.stringContaining("a sidebar width cannot be a percentage"),
      expect.stringContaining("not a shell part"),
      expect.stringContaining("$sticky has no effect"),
    ]),
  );
});
