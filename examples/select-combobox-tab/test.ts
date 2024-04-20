import { click, focus, press, q, sleep, type } from "@ariakit/test";

const SELECT = "Select";
const SELECT_COMBOBOX = "Select with Combobox";
const SELECT_TAB = "Select with Tab";
const SELECT_COMBOBOX_TAB = "Select with Combobox and Tab";

const ALL = [SELECT, SELECT_COMBOBOX, SELECT_TAB, SELECT_COMBOBOX_TAB];
const COMBOBOX = [SELECT_COMBOBOX, SELECT_COMBOBOX_TAB];
const TAB = [SELECT_TAB, SELECT_COMBOBOX_TAB];

describe.each(ALL)("%s", (label) => {
  test("default value", async () => {
    expect(q.combobox(label)).toHaveTextContent("main");
  });

  test("open initial focus", async () => {
    await click(q.combobox(label));
    const dialog = q.dialog();
    expect(dialog).toBeInTheDocument();
    const listbox = q.within(dialog).listbox();
    expect(listbox).toBeInTheDocument();
    expect(q.option("main")).toHaveFocus();
    expect(q.option("main")).toHaveAttribute("aria-selected", "true");
  });

  test("click on another option", async () => {
    await click(q.combobox(label));
    await click(q.option("leg"));
    expect(q.dialog()).not.toBeInTheDocument();
    expect(q.combobox(label)).toHaveTextContent("leg");
  });

  test("typeahead", async () => {
    await click(q.combobox(label));
    await type("gh");
    expect(q.option("gh-pages")).toHaveFocus();
    await press.Enter();
    expect(q.dialog()).not.toBeInTheDocument();
    expect(q.combobox(label)).toHaveTextContent("gh-pages");
    await press.Space();
    expect(q.dialog()).toBeInTheDocument();
    expect(q.option("gh-pages")).toHaveFocus();
    expect(q.option("gh-pages")).toHaveAttribute("aria-selected", "true");
  });

  test("move down with arrow key", async () => {
    await focus(q.combobox(label));
    await press.ArrowDown();
    expect(q.option("main")).toHaveFocus();
    await press.ArrowDown();
    expect(q.option("0.10-stable")).toHaveFocus();
    // Hold ctrl to avoid typing on the combobox input
    await press.Space(null, { ctrlKey: true });
    expect(q.dialog()).not.toBeInTheDocument();
    expect(q.combobox(label)).toHaveTextContent("0.10-stable");
  });
});

describe.each(COMBOBOX)("Combobox tests - %s", (label) => {
  test("search", async () => {
    await click(q.combobox(label));
    await type("cus");
    expect(q.option.all()).toHaveLength(2);
    expect(q.option("fabric-focus-blur")).toHaveFocus();
    expect(q.option("Create branch cus from main")).toBeInTheDocument();
  });

  test("create custom item", async () => {
    await click(q.combobox(label));
    await type("custom");
    expect(q.option.all()).toHaveLength(1);
    expect(q.option("Create branch custom from main")).toHaveFocus();
    await press.Enter();
    expect(q.dialog()).not.toBeInTheDocument();
    expect(q.combobox(label)).toHaveTextContent("custom");
    await press.Space();
    expect(q.dialog()).toBeInTheDocument();
    expect(q.option("custom")).toHaveFocus();
    expect(q.option("custom")).toHaveAttribute("aria-selected", "true");
  });
});

describe.each(TAB)("Tab tests - %s", (label) => {
  test("default tab", async () => {
    await click(q.combobox(label));
    const dialog = q.dialog();
    expect(dialog).toBeInTheDocument();
    const tab = q.within(dialog).tab("Branches");
    expect(tab).toHaveAttribute("aria-selected", "true");
    const tabPanel = q.within(dialog).tabpanel("Branches");
    expect(tabPanel).toBeInTheDocument();
    const listbox = q.within(tabPanel).listbox();
    expect(listbox).toBeInTheDocument();
  });

  test("clicking on different tab and clicking outside resets the selected tab", async () => {
    await click(q.combobox(label));
    await click(q.tab("Tags"));
    await click(document.body);
    expect(q.dialog()).not.toBeInTheDocument();
    await press.Enter();
    await sleep(1000);
    expect(q.dialog()).toBeInTheDocument();
    expect(q.tabpanel("Branches")).toBeInTheDocument();
    expect(q.option("main")).toHaveFocus();
    expect(q.option("main")).toHaveAttribute("data-active-item", "true");
    expect(q.option("main")).toHaveAttribute("data-focus-visible", "true");
  });
});
