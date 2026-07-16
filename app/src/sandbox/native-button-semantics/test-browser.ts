import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("declares native button types before refs run", async ({ q }) => {
    await test.expect(q.tab("Default tab")).toHaveAttribute("type", "button");
    await test.expect(q.tab("Submit tab")).toHaveAttribute("type", "submit");
    await test.expect(q.tab("Reset tab")).toHaveAttribute("type", "reset");
    await test.expect(q.tab("Button tab")).toHaveAttribute("type", "button");
    await test.expect(q.tab("Div tab")).not.toHaveAttribute("type");
    await test.expect(q.tab("Hook tab")).not.toHaveAttribute("type");
    await test
      .expect(q.button("Input command"))
      .toHaveAttribute("type", "submit");
    await test
      .expect(q.button("Default command"))
      .toHaveAttribute("type", "button");
    await test
      .expect(q.button("Default button"))
      .toHaveAttribute("type", "button");
    await test
      .expect(q.button("Submit button"))
      .toHaveAttribute("type", "submit");
    await test
      .expect(q.button("Reset button"))
      .toHaveAttribute("type", "reset");
    await test.expect(q.button("Div button")).not.toHaveAttribute("type");
    await test
      .expect(q.button("Toolbar item"))
      .toHaveAttribute("type", "button");
    await test.expect(q.button("Root menu")).toHaveAttribute("type", "button");
    await test.expect(q.status("Default button ref type")).toHaveText("button");
    await test
      .expect(q.status("Default command ref type"))
      .toHaveText("button");
    await test.expect(q.status("Default tab ref type")).toHaveText("button");
    await test.expect(q.status("Toolbar item ref type")).toHaveText("button");
  });

  test("preserves custom element semantics", async ({ q }) => {
    await test.expect(q.text("Focusable div")).toHaveAttribute("tabindex", "0");
    await test
      .expect(q.link("Disabled anchor"))
      .toHaveAttribute("tabindex", "-1");
    await test
      .expect(q.link("Disabled anchor"))
      .not.toHaveAttribute("disabled");
    await test.expect(q.button("Disabled button")).toBeDisabled();

    const nestedMenuButton = q.menuitem("Nested menu");
    await test.expect(nestedMenuButton).toHaveJSProperty("tagName", "DIV");
    await test.expect(nestedMenuButton).not.toHaveAttribute("type");
  });

  test("updates custom focusability", async ({ q }) => {
    const focusable = q.text("Focusable div");
    await test.expect(focusable).toHaveAttribute("tabindex", "0");

    await q.button("Toggle focusable").click();
    await test.expect(focusable).not.toHaveAttribute("tabindex");

    await q.button("Toggle focusable").click();
    await test.expect(focusable).toHaveAttribute("tabindex", "0");
  });

  test("clears submit focus visibility when focusable is disabled", async ({
    page,
    q,
  }) => {
    const button = q.button("Submit focus target");
    await button.focus();
    await page.keyboard.press("a");
    await test.expect(button).toHaveAttribute("data-focus-visible", "true");

    await page.keyboard.press("f");
    await test.expect(button).not.toHaveAttribute("data-focus-visible");
  });
});
