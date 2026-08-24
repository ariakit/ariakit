import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7114
test("retains the original single-value virtualized picker", async () => {
  await click(q.combobox("Country"));
  await type("zambia", q.combobox("Search countries"));
  await expect.poll(q.option.lazy("Zambia")).toBeInTheDocument();
  await click(q.option("Zambia"));

  expect(q.combobox("Country")).toHaveTextContent("Zambia");
});

// https://github.com/ariakit/ariakit/issues/7114
test("switches selected-value persistence from finite to unbounded", async () => {
  const status = q.status("Persistence mode");
  expect(status).toHaveTextContent(
    "Finite: only the latest 4 selected rows stay mounted",
  );

  await click(q.button("Unbounded · ∞"));
  expect(q.button("Unbounded · ∞")).toHaveAttribute("aria-pressed", "true");
  expect(status).toHaveTextContent(
    "Unbounded: every selected row stays mounted outside the viewport",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("uses clear text for an empty virtualized selection", async () => {
  await click(q.button("Clear"));
  expect(q.status("Virtual selection")).toHaveTextContent("Nothing selected");
});

// https://github.com/ariakit/ariakit/issues/7114
test("selects all data-backed values outside the rendered window", async () => {
  const select = q.combobox("Multiple countries");
  await click(select);
  const zambia = await q.option.wait("Zambia");
  expect(zambia).toHaveAttribute("data-range-selectable", "true");

  const modifier = navigator.platform.startsWith("Mac")
    ? { metaKey: true }
    : { ctrlKey: true };
  await press("a", select, modifier);
  expect(select).toHaveTextContent("64 countries selected");
  const selection = q.status("Virtual selection");
  expect(selection).toHaveTextContent(
    "64 selected: France, India, Georgia, Germany, Japan, Mexico, Norway, Zambia, Argentina, Australia, Austria",
  );
  expect(selection).toHaveTextContent("Brazil, Bulgaria, Cambodia");
});

// https://github.com/ariakit/ariakit/issues/7114
test("retains hidden membership while selecting filtered data", async () => {
  await click(q.combobox("Multiple countries"));
  const search = q.combobox("Search multiple countries");
  await type("land", search);
  await expect.poll(q.option.lazy("Finland")).toBeInTheDocument();
  expect(q.option.maybe("Norway")).not.toBeInTheDocument();

  await click(q.option("Finland"));
  await click(q.option("Thailand"), { shiftKey: true });
  const selection = q.status("Virtual selection");
  expect(q.combobox("Multiple countries")).toHaveTextContent(
    "14 countries selected",
  );
  expect(selection).toHaveTextContent("France");
  expect(selection).toHaveTextContent("Finland");
  expect(selection).toHaveTextContent("Iceland");
  expect(selection).toHaveTextContent("Ireland");
  expect(selection).toHaveTextContent("Thailand");
  expect(q.option("Ireland")).toHaveAttribute("aria-selected", "true");
});

// https://github.com/ariakit/ariakit/issues/7114
test("extends a reverse range across sibling renderers", async () => {
  await click(q.button("Clear"));
  await click(q.combobox("Multiple countries"));
  const search = q.combobox("Search multiple countries");
  await type("land", search);
  await expect.poll(q.option.lazy("Thailand")).toBeInTheDocument();

  await click(q.option("Thailand"));
  for (let index = 0; index < 5; index += 1) {
    await press.ArrowUp(search, { shiftKey: true });
  }

  expect(q.combobox("Multiple countries")).toHaveTextContent(
    "6 countries selected",
  );
  const selection = q.status("Virtual selection");
  expect(selection).toHaveTextContent("Finland");
  expect(selection).toHaveTextContent("Iceland");
  expect(selection).toHaveTextContent("Ireland");
  expect(selection).toHaveTextContent("Netherlands");
  expect(selection).toHaveTextContent("Poland");
  expect(selection).toHaveTextContent("Thailand");
});

// https://github.com/ariakit/ariakit/issues/7114
test("reseats the range after editable auto-selection moves", async () => {
  await click(q.button("Clear"));
  await click(q.combobox("Multiple countries"));
  await click(q.option("Argentina"));
  const search = q.combobox("Search multiple countries");
  await type("land", search);
  await expect
    .poll(q.option.lazy("Finland"))
    .toHaveAttribute("data-active-item", "true");

  await press.ArrowDown(search, { shiftKey: true });

  const selection = q.status("Virtual selection");
  expect(selection).toHaveTextContent("Argentina");
  expect(selection).toHaveTextContent("Finland");
  expect(selection).toHaveTextContent("Iceland");
});

// https://github.com/ariakit/ariakit/issues/7114
test("restores aggregate order after an empty filter", async () => {
  await click(q.button("Clear"));
  await click(q.combobox("Multiple countries"));
  const search = q.combobox("Search multiple countries");
  await type("zzzz", search);
  expect(q.option.maybe("Zambia")).not.toBeInTheDocument();

  if (!(search instanceof HTMLInputElement)) {
    throw new Error("Expected the Combobox search to render an input");
  }
  search.select();
  await press.Backspace(search);
  await expect.poll(q.option.lazy("Zambia")).toBeInTheDocument();

  const select = q.combobox("Multiple countries");
  const modifier = navigator.platform.startsWith("Mac")
    ? { metaKey: true }
    : { ctrlKey: true };
  await press("a", select, modifier);
  expect(select).toHaveTextContent("64 countries selected");
  expect(q.status("Virtual selection")).toHaveTextContent(
    "64 selected: Argentina, Australia, Austria, Belgium, Brazil",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("extends forward across mounted sibling branches", async () => {
  expect(q.listbox("Mounted sibling branches")).toBeInTheDocument();
  await click(q.option("Coral"));
  await click(q.option("Indigo"), { shiftKey: true });

  expect(q.status("Mounted selection")).toHaveTextContent(
    "2 selected: Coral, Indigo",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("extends in reverse across mounted sibling branches", async () => {
  expect(q.listbox("Mounted sibling branches")).toBeInTheDocument();
  await click(q.option("Indigo"));
  await click(q.option("Coral"), { shiftKey: true });

  expect(q.status("Mounted selection")).toHaveTextContent(
    "2 selected: Coral, Indigo",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("restores mounted sibling order after zero root items", async () => {
  expect(q.listbox("Mounted sibling branches")).toBeInTheDocument();
  expect(q.option("Amber")).toBeInTheDocument();

  await click(q.button("Hide sibling branches"));
  expect(q.status("Mounted branch source")).toHaveTextContent("Root source: 0");
  expect(q.option.maybe("Amber")).not.toBeInTheDocument();

  await click(q.button("Restore sibling branches"));
  await expect.poll(q.option.lazy("Amber")).toBeInTheDocument();
  expect(q.status("Mounted branch source")).toHaveTextContent(
    "Root source: array",
  );

  await click(q.button("Select all mounted"));
  expect(q.status("Mounted selection")).toHaveTextContent(
    "4 selected: Amber, Coral, Indigo, Violet",
  );
});
