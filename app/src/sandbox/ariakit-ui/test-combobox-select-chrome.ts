import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "combobox" },
  async ({ test, query }) => {
    test("renders the select list in a portal", async ({ q }) => {
      const select = q.combobox("Favorite fruit");
      await select.click();
      await test.expect(q.listbox("Favorite fruit")).toBeVisible();
      await test
        .expect(query(q.article("Default select")).listbox("Favorite fruit"))
        .toHaveCount(0);
      await q.option("Cherry").click();
      await test.expect(select).toHaveText("Cherry");
      await test.expect(q.listbox("Favorite fruit")).toBeHidden();
    });

    test("gives the select the height of the input beside it", async ({
      q,
    }) => {
      const article = query(q.article("In a form"));
      const input = await article.textbox("Full name").boundingBox();
      const select = await article.combobox("Country").boundingBox();
      test.expect(input).not.toBeNull();
      test.expect(select).not.toBeNull();
      if (!input || !select) return;
      test.expect(select.height).toBe(input.height);
    });

    test("opens the select list at least as wide as its button", async ({
      q,
    }) => {
      const article = query(q.article("In a form"));
      const button = await article.combobox("Country").boundingBox();
      const list = await article.listbox("Country").boundingBox();
      test.expect(button).not.toBeNull();
      test.expect(list).not.toBeNull();
      if (!button || !list) return;
      test.expect(list.width).toBeGreaterThanOrEqual(button.width);
    });

    test("scrolls a long select list inside its height cap", async ({ q }) => {
      const list = query(q.article("Long list")).listbox("Start time");
      await test.expect(list).toHaveCSS("overflow-y", "auto");
      const box = await list.boundingBox();
      test.expect(box).not.toBeNull();
      if (!box) return;
      // The recipe caps the list at 20rem, 320px at the page's 16px root.
      test.expect(box.height).toBeLessThanOrEqual(320);
      const overflows = await list.evaluate(
        (node) => node.scrollHeight > node.clientHeight,
      );
      test.expect(overflows).toBe(true);
    });

    test("dims the description of a disabled select item", async ({ q }) => {
      const article = query(q.article("Rich items"));
      const enabled = article.text("One project and community support");
      const disabled = article.text("Contact sales to turn it on");
      const getColor = (node: Element) => getComputedStyle(node).color;
      const enabledColor = await enabled.evaluate(getColor);
      const disabledLabelColor = await article
        .text("Enterprise")
        .evaluate(getColor);
      await test.expect(disabled).not.toHaveCSS("color", enabledColor);
      await test.expect(disabled).toHaveCSS("color", disabledLabelColor);
    });

    test("joins the values of a multiple selection", async ({ q }) => {
      const article = query(q.article("Multiple selection"));
      await test
        .expect(article.combobox("Toppings"))
        .toHaveText("Cheese, Olives");
      await test
        .expect(article.option("Cheese"))
        .toHaveAttribute("aria-selected", "true");
      await test
        .expect(article.option("Olives"))
        .toHaveAttribute("aria-selected", "true");
    });

    test("colors the badge select with the selected status", async ({ q }) => {
      const select = q.combobox("Review status");
      await test.expect(select).toHaveText("In review");
      const getBackground = (node: Element) =>
        getComputedStyle(node).backgroundColor;
      const reviewBackground = await select.evaluate(getBackground);
      await select.click();
      await q.option("Published").click();
      await test.expect(select).toHaveText("Published");
      await test.expect(q.listbox("Review status")).toBeHidden();
      await test
        .expect(select)
        .not.toHaveCSS("background-color", reviewBackground);
    });
  },
);
