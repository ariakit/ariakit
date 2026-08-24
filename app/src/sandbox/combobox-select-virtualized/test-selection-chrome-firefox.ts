import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7114
  test("keeps the single virtualized control case", async ({ q }) => {
    await q.combobox("Country").click();
    await q.combobox("Search countries").fill("zambia");
    await test.expect(q.option("Zambia")).toBeVisible();
    await q.option("Zambia").click();

    await test.expect(q.combobox("Country")).toHaveText("Zambia");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("caps persisted selected rows without losing membership", async ({
    q,
  }) => {
    const select = q.combobox("Multiple countries");
    await select.click();
    const options = query(q.listbox("Multiple country options"));

    await test
      .expect(options.option("Zambia"))
      .toHaveAttribute("data-range-selectable", "true");
    await test.expect(options.option("Japan")).toHaveCount(1);
    await test.expect(options.option("Mexico")).toHaveCount(1);
    await test.expect(options.option("Norway")).toHaveCount(1);
    await test.expect(options.option("Zambia")).toHaveCount(1);
    await test.expect(options.option("India")).toHaveCount(0);
    await test
      .expect(q.status("Mounted selected rows"))
      .toContainText("4 of 8 selected rows are mounted now");
    await test
      .expect(q.status("Virtual selection"))
      .toContainText("8 selected:");

    await q.combobox("Search multiple countries").press("Escape");
    await q.button("Unbounded · ∞").click();
    await select.click();
    await test
      .expect(q.status("Mounted selected rows"))
      .toContainText("8 of 8 selected rows are mounted now");
    await test
      .expect(q.status("Virtual selection"))
      .toContainText("8 selected:");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("selects all off-window values from selectable renderer data", async ({
    q,
  }) => {
    const select = q.combobox("Multiple countries");
    await select.click();
    const options = query(q.listbox("Multiple country options"));
    await test.expect(options.option("Zambia")).toBeVisible();
    test.expect(await options.option().count()).toBeLessThan(64);

    await select.press("ControlOrMeta+A");
    await test.expect(select).toHaveText("64 countries selected");
    const selection = q.status("Virtual selection");
    await test
      .expect(selection)
      .toContainText(
        "64 selected: France, India, Georgia, Germany, Japan, Mexico, Norway, Zambia, Argentina, Australia, Austria",
      );
    await test.expect(selection).toContainText("Brazil, Bulgaria, Cambodia");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("keeps hidden selections when the delegate is filtered", async ({
    q,
  }) => {
    await q.combobox("Multiple countries").click();
    const search = q.combobox("Search multiple countries");
    await search.fill("land");
    await test.expect(q.option("Finland")).toBeVisible();
    await test.expect(q.option("Norway")).toHaveCount(0);

    await q.option("Finland").click();
    await q.option("Thailand").click({ modifiers: ["Shift"] });
    await test
      .expect(q.combobox("Multiple countries"))
      .toHaveText("14 countries selected");
    const selection = q.status("Virtual selection");
    await test.expect(selection).toContainText("France");
    await test.expect(selection).toContainText("Finland");
    await test.expect(selection).toContainText("Iceland");
    await test.expect(selection).toContainText("Ireland");
    await test.expect(selection).toContainText("Thailand");
    await test
      .expect(q.option("Ireland"))
      .toHaveAttribute("aria-selected", "true");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("extends a reverse range across sibling renderers", async ({ q }) => {
    await q.button("Clear").click();
    await q.combobox("Multiple countries").click();
    const search = q.combobox("Search multiple countries");
    await search.fill("land");
    await test.expect(q.option("Thailand")).toBeVisible();

    await q.option("Thailand").click();
    for (let index = 0; index < 5; index += 1) {
      await search.press("Shift+ArrowUp");
    }

    await test
      .expect(q.combobox("Multiple countries"))
      .toHaveText("6 countries selected");
    const selection = q.status("Virtual selection");
    await test.expect(selection).toContainText("Finland");
    await test.expect(selection).toContainText("Iceland");
    await test.expect(selection).toContainText("Ireland");
    await test.expect(selection).toContainText("Netherlands");
    await test.expect(selection).toContainText("Poland");
    await test.expect(selection).toContainText("Thailand");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("reseats the range after editable auto-selection moves", async ({
    q,
  }) => {
    await q.button("Clear").click();
    await q.combobox("Multiple countries").click();
    await q.option("Argentina").click();
    const search = q.combobox("Search multiple countries");
    await search.fill("land");
    await test
      .expect(q.option("Finland"))
      .toHaveAttribute("data-active-item", "true");

    await search.press("Shift+ArrowDown");

    const selection = q.status("Virtual selection");
    await test.expect(selection).toContainText("Argentina");
    await test.expect(selection).toContainText("Finland");
    await test.expect(selection).toContainText("Iceland");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("restores aggregate order after an empty filter", async ({ q }) => {
    await q.button("Clear").click();
    await q.combobox("Multiple countries").click();
    const search = q.combobox("Search multiple countries");
    await search.fill("zzzz");
    await test.expect(q.option("Zambia")).toHaveCount(0);

    await search.fill("");
    await test.expect(q.option("Zambia")).toBeVisible();

    const select = q.combobox("Multiple countries");
    await select.press("ControlOrMeta+A");
    await test.expect(select).toHaveText("64 countries selected");
    await test
      .expect(q.status("Virtual selection"))
      .toContainText(
        "64 selected: Argentina, Australia, Austria, Belgium, Brazil",
      );
  });
});
