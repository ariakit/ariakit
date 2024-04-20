import { click, press, q } from "@ariakit/test";

const SELECT_TAB = "Select with manual Tab";
const SELECT_COMBOBOX_TAB = "Select with Combobox and manual Tab";
const ALL = [SELECT_TAB, SELECT_COMBOBOX_TAB];

describe.each(ALL)("%s", (label) => {
  test("switch tabs with the keyboard", async () => {
    await click(q.combobox(label));
    expect(q.option("main")).toHaveFocus();

    await press.ArrowRight();
    expect(q.tab("Tags")).toHaveFocus();
    expect(q.tab("Tags")).toHaveAttribute("aria-selected", "false");
    expect(q.tab("Tags")).toHaveAttribute("data-active-item", "true");
    expect(q.tab("Tags")).toHaveAttribute("data-focus-visible", "true");
    expect(q.tabpanel("Tags")).not.toBeInTheDocument();
    expect(q.tab("Branches")).toHaveAttribute("aria-selected", "true");
    expect(q.tab("Branches")).not.toHaveAttribute("data-active-item");
    expect(q.tab("Branches")).not.toHaveAttribute("data-focus-visible");
    expect(q.tabpanel("Branches")).toBeInTheDocument();
    expect(q.option("main")).not.toHaveFocus();
    expect(q.option("main")).toHaveAttribute("aria-selected", "true");

    await press.ArrowDown();
    expect(q.option("main")).toHaveFocus();
    expect(q.option("main")).toHaveAttribute("aria-selected", "true");
    expect(q.option("main")).toHaveAttribute("data-active-item", "true");
    expect(q.option("main")).toHaveAttribute("data-focus-visible", "true");

    await press.ArrowUp();
    expect(q.tab("Branches")).toHaveFocus();
    expect(q.tab("Branches")).toHaveAttribute("aria-selected", "true");
    expect(q.tab("Branches")).toHaveAttribute("data-active-item", "true");
    expect(q.tab("Branches")).toHaveAttribute("data-focus-visible", "true");
    expect(q.option("main")).toHaveAttribute("aria-selected", "true");
    expect(q.option("main")).not.toHaveAttribute("data-active-item");
    expect(q.option("main")).not.toHaveAttribute("data-focus-visible");

    await press.ArrowLeft();
    await press.Enter();
    expect(q.tab("Tags")).toHaveFocus();
    expect(q.tab("Tags")).toHaveAttribute("aria-selected", "true");
    expect(q.tab("Tags")).toHaveAttribute("data-active-item", "true");
    expect(q.tab("Tags")).toHaveAttribute("data-focus-visible", "true");
    expect(q.tabpanel("Tags")).toBeInTheDocument();
    expect(q.tab("Branches")).toHaveAttribute("aria-selected", "false");
    expect(q.tab("Branches")).not.toHaveAttribute("data-active-item");
    expect(q.tab("Branches")).not.toHaveAttribute("data-focus-visible");
    expect(q.tabpanel("Branches")).not.toBeInTheDocument();
  });
});
