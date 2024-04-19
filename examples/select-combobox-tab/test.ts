import { click, press, q, type } from "@ariakit/test";

describe.each([
  "Select",
  "Select with Combobox",
  "Select with Tab",
  "Select with Combobox and Tab",
])("%s", (label) => {
  test("default value", async () => {
    expect(q.combobox(label)).toHaveTextContent("main");
  });

  test("open initial focus", async () => {
    await click(q.combobox(label));
    expect(q.option("main")).toHaveFocus();
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
  });
});
