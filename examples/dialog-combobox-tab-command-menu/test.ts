import { click, press, q, type } from "@ariakit/test";

const SIMPLE = "Simple";
const WITH_TABS = "With Tabs";
const WITH_TABS_2_COLUMNS = "With Tabs (2 columns)";
const WITH_TABS_3_COLUMNS = "With Tabs (3 columns)";

const LABELS = [SIMPLE, WITH_TABS, WITH_TABS_2_COLUMNS, WITH_TABS_3_COLUMNS];

const TABS = [WITH_TABS, WITH_TABS_2_COLUMNS, WITH_TABS_3_COLUMNS];

const GRIDS = [WITH_TABS_2_COLUMNS, WITH_TABS_3_COLUMNS];

describe.each(LABELS)("%s", (label) => {
  beforeEach(async () => {
    await click(q.button(label));
    expect(q.dialog("Command Menu")).toBeVisible();
  });

  test("open command menu when button is clicked and focus on the first option", async () => {
    const firstOption = q.option("Getting Started");
    expect(firstOption).toHaveFocus();
    expect(firstOption).toHaveAttribute("data-active-item");
    expect(firstOption).not.toHaveAttribute("data-focus-visible");
  });

  test("close command menu when Escape key is pressed", async () => {
    await press.Escape();
    expect(q.dialog("Command Menu")).not.toBeInTheDocument();
  });

  test("close command menu when clicking outside", async () => {
    await click(document.body);
    expect(q.dialog("Command Menu")).not.toBeInTheDocument();
  });

  test("close command menu when clicking on the esc button", async () => {
    await click(q.button("Esc"));
    expect(q.dialog("Command Menu")).not.toBeInTheDocument();
  });

  test("filter options when typing", async () => {
    await type("but");
    expect(q.option.all()).toHaveLength(5);
    const firstOption = q.option("Button");
    expect(firstOption).toHaveFocus();
    expect(firstOption).toHaveAttribute("data-active-item");
    expect(firstOption).toHaveAttribute("data-focus-visible");
  });

  test("closing and reopening the command menu should reset filter", async () => {
    const initialLength = q.option.all().length;
    await type("but");
    expect(q.option.all().length).toBeLessThan(initialLength);
    await press.Escape();
    await click(q.button(label));
    expect(q.option.all()).toHaveLength(initialLength);
    expect(q.combobox()).toHaveValue("");
  });
});

describe.each(TABS)("Tabs - %s", (label) => {
  beforeEach(async () => {
    await click(q.button(label));
    expect(q.dialog("Command Menu")).toBeVisible();
  });

  test("the first tab is selected by default", async () => {
    expect(q.tab(/^All/)).toHaveAttribute("aria-selected", "true");
    expect(q.tab(/^All/)).not.toHaveAttribute("data-active-item");
    expect(q.tabpanel(/^All/)).toBeVisible();
  });

  test("pressing Tab key should select tabs", async () => {
    await press.Tab();
    expect(q.tab(/^All/)).toHaveAttribute("aria-selected", "false");
    expect(q.tabpanel(/^All/)).not.toBeInTheDocument();
    expect(q.tab(/^Guide/)).toHaveAttribute("aria-selected", "true");
    expect(q.tab(/^Guide/)).toHaveAttribute("data-active-item");
    expect(q.tabpanel(/^Guide/)).toBeVisible();

    await press.Tab();
    expect(q.tab(/^Guide/)).toHaveAttribute("aria-selected", "false");
    expect(q.tabpanel(/^Guide/)).not.toBeInTheDocument();
    expect(q.tab(/^Components/)).toHaveAttribute("aria-selected", "true");
    expect(q.tab(/^Components/)).toHaveAttribute("data-active-item");
    expect(q.tabpanel(/^Components/)).toBeVisible();

    await press.ShiftTab();
    expect(q.tab(/^Components/)).toHaveAttribute("aria-selected", "false");
    expect(q.tabpanel(/^Components/)).not.toBeInTheDocument();
    expect(q.tab(/^Guide/)).toHaveAttribute("aria-selected", "true");
    expect(q.tab(/^Guide/)).toHaveAttribute("data-active-item");
    expect(q.tabpanel(/^Guide/)).toBeVisible();
  });

  test("pressing Tab key past the last tab should move focus to the Esc button", async () => {
    await press.Tab();
    await press.Tab();
    await press.Tab();
    await press.Tab();
    expect(q.button("Esc")).toHaveFocus();
    expect(q.button("Esc")).toHaveAttribute("data-focus-visible");
    expect(q.tab(/^Examples/)).not.toHaveFocus();
    expect(q.tab(/^Examples/)).toHaveAttribute("aria-selected", "true");
    expect(q.tab(/^Examples/)).toHaveAttribute("data-active-item");
    expect(q.tab(/^Examples/)).not.toHaveAttribute("data-focus-visible");
    expect(q.tabpanel(/^Examples/)).toBeVisible();

    await press.ShiftTab();
    expect(q.button("Esc")).not.toHaveFocus();
    expect(q.button("Esc")).not.toHaveAttribute("data-focus-visible");
    expect(q.tab(/^Examples/)).toHaveFocus();
    expect(q.tab(/^Examples/)).toHaveAttribute("aria-selected", "true");
    expect(q.tab(/^Examples/)).toHaveAttribute("data-active-item");
    expect(q.tab(/^Examples/)).toHaveAttribute("data-focus-visible");
    expect(q.tabpanel(/^Examples/)).toBeVisible();
  });

  test("change tabs with arrow keys after pressing Tab key", async () => {
    await press.Tab();
    await press.ArrowRight();
    expect(q.tab(/^Guide/)).toHaveAttribute("aria-selected", "false");
    expect(q.tabpanel(/^Guide/)).not.toBeInTheDocument();
    expect(q.tab(/^Components/)).toHaveAttribute("aria-selected", "true");
    expect(q.tab(/^Components/)).toHaveAttribute("data-active-item");
    expect(q.tabpanel(/^Components/)).toBeVisible();
    await press.ArrowLeft();
    expect(q.tab(/^Components/)).toHaveAttribute("aria-selected", "false");
    expect(q.tabpanel(/^Components/)).not.toBeInTheDocument();
    expect(q.tab(/^Guide/)).toHaveAttribute("aria-selected", "true");
    expect(q.tab(/^Guide/)).toHaveAttribute("data-active-item");
    expect(q.tabpanel(/^Guide/)).toBeVisible();
  });
});

describe.each(GRIDS)("Grids - %s", (label) => {
  beforeEach(async () => {
    await click(q.button(label));
    expect(q.dialog("Command Menu")).toBeVisible();
  });

  test("pressing arrow keys moves focus between grid items and tabs", async () => {
    await press.ArrowRight();
    const secondOption = q.option("Styling");
    expect(secondOption).toHaveFocus();
    expect(secondOption).toHaveAttribute("data-active-item");
    expect(secondOption).toHaveAttribute("data-focus-visible");
    await press.ArrowUp();
    expect(secondOption).not.toHaveFocus();
    expect(secondOption).not.toHaveAttribute("data-active-item");
    expect(secondOption).not.toHaveAttribute("data-focus-visible");
    expect(q.tab(/^All/)).toHaveFocus();
    expect(q.tab(/^All/)).toHaveAttribute("aria-selected", "true");
    expect(q.tab(/^All/)).toHaveAttribute("data-active-item");
    expect(q.tab(/^All/)).toHaveAttribute("data-focus-visible");
  });

  test("move horizontally to wrap lines", async () => {
    await press.ArrowRight();
    await press.ArrowRight();
    await press.ArrowRight();
    const option = q.option("Component providers");
    expect(option).toHaveFocus();
    expect(option).toHaveAttribute("data-active-item");
    expect(option).toHaveAttribute("data-focus-visible");
    await press.ArrowUp();
    await press.ArrowUp();
    expect(option).not.toHaveFocus();
    expect(option).not.toHaveAttribute("data-active-item");
    expect(option).not.toHaveAttribute("data-focus-visible");
    expect(q.tab(/^All/)).toHaveFocus();
    expect(q.tab(/^All/)).toHaveAttribute("aria-selected", "true");
    expect(q.tab(/^All/)).toHaveAttribute("data-active-item");
    expect(q.tab(/^All/)).toHaveAttribute("data-focus-visible");
  });

  test("focusShift", async () => {
    await type("ert");
    await press.ArrowRight();
    await press.ArrowDown();
    await press.ArrowDown();
    try {
      expect(q.option("Navigation Menubar")).toHaveFocus();
    } catch {
      await press.ArrowDown();
      expect(q.option("Navigation Menubar")).toHaveFocus();
    }
  });
});
