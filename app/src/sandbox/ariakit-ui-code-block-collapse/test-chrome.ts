import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// The expanded block scrolls into view smoothly, and nothing on the page tracks
// the end of the scroll, so boxes are read once the page stops moving between
// frames.
async function waitForScrollEnd(page: Page) {
  const getScrollY = () => page.evaluate(() => scrollY);
  let start = await getScrollY();
  await expect
    .poll(async () => {
      await flushFrames(page);
      const end = await getScrollY();
      const stopped = end === start;
      start = end;
      return stopped;
    })
    .toBe(true);
}

async function getBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Missing box");
  return box;
}

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("fits the expanded block between the sticky header and footer", async ({
    page,
    q,
  }) => {
    // The block with file tabs starts near the sticky footer, so the expanded
    // block must scroll into view and stop short of both sticky bars.
    await q.button("Mostrar as 36 linhas").click();
    const collapse = q.button("Mostrar menos linhas");
    await test.expect(collapse).toBeInViewport({ ratio: 1 });
    await waitForScrollEnd(page);
    const header = await getBox(q.banner());
    const footer = await getBox(q.contentinfo());
    const tabs = await getBox(q.tablist("Arquivos"));
    const button = await getBox(collapse);
    test.expect(tabs.y).toBeGreaterThanOrEqual(header.y + header.height);
    test.expect(button.y + button.height).toBeLessThanOrEqual(footer.y);
  });

  test("fits the expanded block in a dialog", async ({ page, q }) => {
    await q.button("Open use-users.ts").click();
    const dialog = q.dialog("use-users.ts");
    await query(dialog).button("Show all 36 lines").click();
    const collapse = query(dialog).button("Show fewer lines");
    await test.expect(collapse).toBeInViewport({ ratio: 1 });
    await waitForScrollEnd(page);
    // The dialog doesn't scroll, so expanded code taller than the dialog would
    // push the button out of it.
    const dialogBox = await getBox(dialog);
    const button = await getBox(collapse);
    test
      .expect(button.y + button.height)
      .toBeLessThanOrEqual(dialogBox.y + dialogBox.height);
  });

  test("fits the expanded block in a popover", async ({ page, q }) => {
    await q.button("Preview use-users.ts").click();
    const popover = q.dialog("Preview of use-users.ts");
    await query(popover).button("Show all 36 lines").click();
    await test
      .expect(query(popover).button("Show fewer lines"))
      .toBeInViewport({ ratio: 1 });
    await waitForScrollEnd(page);
    // The popover grows with its content, so it must stay in the room that it
    // has on the screen.
    await test.expect(popover).toBeInViewport({ ratio: 1 });
  });

  test("keeps the expanded state across file tabs", async ({ q }) => {
    await q.button("Mostrar as 36 linhas").click();
    await test.expect(q.tabpanel("use-users.ts")).toBeFocused();
    // The style sheet is shorter than the lines that the block shows.
    await q.tab("users.css").click();
    await test.expect(q.tabpanel("users.css")).toBeVisible();
    await test.expect(q.button(/Mostrar/)).toHaveCount(0);
    await q.tab("use-users.ts").click();
    await test.expect(q.button("Mostrar menos linhas")).toBeVisible();
  });

  test("follows the state from outside without moving the focus", async ({
    q,
  }) => {
    const toggle = q.button("Show all lines of use-users.ts");
    await toggle.click();
    await test.expect(q.button("Show fewer lines")).toBeVisible();
    await test.expect(toggle).toBeFocused();
    await q.button("Show fewer lines").click();
    await test.expect(toggle).toHaveAttribute("aria-pressed", "false");
    await test.expect(q.button("Show all 36 lines")).toBeFocused();
  });

  test("doesn't move the focus after a toggle that the page ignores", async ({
    q,
  }) => {
    await q.button("Lock the state of use-users.ts").click();
    await q.button("Show all 36 lines").click();
    await test.expect(q.button("Show all 36 lines")).toBeVisible();
    const toggle = q.button("Show all lines of use-users.ts");
    await toggle.click();
    await test.expect(q.button("Show fewer lines")).toBeVisible();
    await test.expect(toggle).toBeFocused();
  });

  test("moves the focus to wrapped code that the button expands", async ({
    page,
    q,
  }) => {
    await q.button("Show all wrapped lines").click();
    const collapse = q.button("Show fewer wrapped lines");
    const id = await collapse.getAttribute("aria-controls");
    const code = page.locator(`[id="${id}"]`);
    await test.expect(code).toBeFocused();
    // Wrapped code takes the focus, but it's not a tab stop.
    await test.expect(code).not.toHaveAttribute("tabindex", "0");
  });

  test("moves the focus after a state that the page applies in a transition", async ({
    q,
  }) => {
    await q.button("Show all lines after a transition").click();
    await test
      .expect(q.region("Hook that expands in a transition"))
      .toBeFocused();
    await q.button("Show fewer lines after a transition").click();
    await test
      .expect(q.button("Show all lines after a transition"))
      .toBeFocused();
  });

  test("moves the focus to the code from a click on it in a dialog", async ({
    page,
    q,
  }) => {
    await q.button("Open use-users.ts").click();
    const dialog = q.dialog("use-users.ts");
    const code = query(dialog).region("Hook in a dialog");
    // A click on the top of the collapsed code, far from the button, focuses
    // the dialog around it first.
    const box = await getBox(code);
    await page.mouse.click(box.x + 80, box.y + 40);
    await test.expect(query(dialog).button("Show fewer lines")).toBeVisible();
    await test.expect(code).toBeFocused();
  });

  test("doesn't move the focus from the body after a toggle that the page ignores", async ({
    page,
    q,
  }) => {
    await q.button("Lock the state of use-users.ts").click();
    await q.button("Show all 36 lines").click();
    await q.text(/^The hook loads the users of a team/).click();
    await test.expect(q.button("Show all 36 lines")).not.toBeFocused();
    // A state from outside that doesn't take the focus, such as a keyboard
    // shortcut on the page.
    await q.button("Show all lines of use-users.ts").dispatchEvent("click");
    await test.expect(q.button("Show fewer lines")).toBeVisible();
    await test.expect
      .poll(() => page.evaluate(() => document.activeElement === document.body))
      .toBe(true);
  });

  test("doesn't move the focus after a toggle that the page ignores and a scroll", async ({
    page,
    q,
  }) => {
    await q.button("Lock the state of use-users.ts").click();
    const expand = q.button("Show all 36 lines");
    await expand.click();
    await test.expect(expand).toBeFocused();
    const top = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 600);
    // The page sees the new scroll position only after the wheel event.
    await test.expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThan(top);
    // A state from outside that doesn't take the focus, such as a timer.
    await q.button("Show all lines of use-users.ts").dispatchEvent("click");
    await test.expect(q.button("Show fewer lines")).toBeVisible();
    await test.expect(q.region("use-users.ts")).not.toBeFocused();
  });
});
