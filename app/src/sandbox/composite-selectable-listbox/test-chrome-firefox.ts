import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7114
  test("switches between range, single, and frozen policies", async ({ q }) => {
    const listbox = q.listbox("Selection policy explorer");
    const launch = q.option("Launch checklist");

    await test.expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    await q.radio("Replace").press("Space");
    await q.option("2027 product roadmap").click();
    await launch.click({ modifiers: ["Shift"] });
    await test
      .expect(q.status("Playground selection"))
      .toHaveText(
        "3 selected: 2027 product roadmap, Customer interviews, Launch checklist",
      );
    await test
      .expect(q.option("Legal review"))
      .not.toHaveAttribute("aria-selected");

    await q.radio("Single").press("Space");
    await q.option("Research synthesis").click();
    await test.expect(listbox).not.toHaveAttribute("aria-multiselectable");
    await test
      .expect(q.option("Research synthesis"))
      .toHaveAttribute("aria-selected", "true");

    await q.radio("Frozen").press("Space");
    await launch.click();
    await test
      .expect(q.option("Research synthesis"))
      .toHaveAttribute("aria-selected", "true");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("preserves the option element when selection is enabled", async ({
    q,
  }) => {
    const legalReview = q.option("Legal review");
    const initialElement = await legalReview.elementHandle();
    if (!initialElement) {
      throw new Error("Legal review option was not rendered");
    }

    await q.checkbox("Include Legal review in selection").click();
    const sameElement = await q
      .option("Legal review")
      .evaluate(
        (element, previousElement) => element === previousElement,
        initialElement,
      );
    test.expect(sameElement).toBe(true);
    await test.expect(legalReview).toHaveAttribute("aria-selected", "false");
    await legalReview.click();
    await test.expect(legalReview).toHaveAttribute("aria-selected", "true");
    await initialElement.dispose();
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("shares the selectable store through the provider", async ({ q }) => {
    const providerListbox = q.listbox("Provider reading queue");
    await test
      .expect(providerListbox)
      .toHaveAttribute("aria-multiselectable", "true");
    await test
      .expect(q.option("Shape the narrative"))
      .toHaveAttribute("aria-selected", "true");

    await q.option("Collect field notes").click();
    await test
      .expect(q.status("Provider selection"))
      .toHaveText("2 selected: Shape the narrative, Collect field notes");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("applies item activation gates", async ({ q }) => {
    const keyboardActivation = q.option("Keyboard activation");
    await test
      .expect(keyboardActivation)
      .toHaveAttribute("aria-selected", "false");

    await keyboardActivation.click();
    await test
      .expect(keyboardActivation)
      .toHaveAttribute("aria-selected", "false");
    await keyboardActivation.press("Enter");
    await test
      .expect(keyboardActivation)
      .toHaveAttribute("aria-selected", "true");

    const pointerOrSpace = q.option("Pointer or Space");
    await pointerOrSpace.press("Enter");
    await test.expect(pointerOrSpace).toHaveAttribute("aria-selected", "false");
    await pointerOrSpace.press("Space");
    await test.expect(pointerOrSpace).toHaveAttribute("aria-selected", "true");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("customizes or suppresses the selection attribute", async ({ q }) => {
    const checkedSemantics = q.menuitemcheckbox("Checked semantics");
    await test.expect(checkedSemantics).toHaveAttribute("aria-checked", "true");
    await test.expect(checkedSemantics).not.toHaveAttribute("aria-selected");

    const hostOwnedState = q.menuitem("Host-owned state");
    await test.expect(hostOwnedState).not.toHaveAttribute("aria-selected");
    await test.expect(hostOwnedState).not.toHaveAttribute("aria-checked");
    await test.expect(hostOwnedState).not.toHaveAttribute("aria-current");
    await hostOwnedState.click();
    await test.expect(hostOwnedState).toHaveAttribute("data-selected");
    await test.expect(hostOwnedState).toHaveAttribute("aria-current", "true");
    await test
      .expect(checkedSemantics)
      .toHaveAttribute("aria-checked", "false");
    await test.expect(hostOwnedState).not.toHaveAttribute("aria-selected");
    await test.expect(hostOwnedState).not.toHaveAttribute("aria-checked");
    await test
      .expect(q.status("Item option lab selection"))
      .toHaveText("1 selected: Host-owned state");
  });
});
