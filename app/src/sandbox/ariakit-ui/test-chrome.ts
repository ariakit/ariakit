import type { Locator, Page } from "@playwright/test";
import {
  tabTo,
  waitForGalleryPage,
  withGalleryPage,
} from "./gallery-test-utils.ts";
import { galleryPages } from "./pages.ts";

// The behavior of every gallery page: names, ARIA state, DOM structure,
// keyboard, focus, dismissal, forms and store sync. What the pages look like,
// including after an interaction, is covered by the captures in
// test-browser.ts.

/**
 * Tabs into a box the way a person does: a click on the box title sets the
 * point where sequential navigation starts, and Tab moves to the next stop.
 */
async function tabInto(page: Page, title: Locator) {
  await title.click();
  await page.keyboard.press("Tab");
}

/**
 * Counts the animations running on an overlay and its content. Ariakit renders
 * the backdrop of a dialog as the element right before it, so a dialog passes
 * `withBackdrop` to count the backdrop too.
 */
function countAnimations(overlay: Locator, withBackdrop = false) {
  return overlay.evaluate((node, backdrop) => {
    const count = node.getAnimations({ subtree: true }).length;
    if (!backdrop) return count;
    const element = node.previousElementSibling;
    if (!element) return Number.NaN;
    return count + element.getAnimations().length;
  }, withBackdrop);
}

withGalleryPage("heading", async ({ query, test }) => {
  test("nests the semantic ladder under the box title", async ({ q }) => {
    const box = query(q.article("Semantic levels"));
    await test.expect(box.heading("Level three", { level: 3 })).toBeVisible();
    await test.expect(box.heading("Level four", { level: 4 })).toBeVisible();
    await test.expect(box.heading("Level five", { level: 5 })).toBeVisible();
    await test.expect(box.heading("Level six", { level: 6 })).toBeVisible();
  });

  test("keeps the element of a heading whose size changes", async ({ q }) => {
    await test
      .expect(
        query(q.article("Visual level")).heading("An h4 at the h2 size", {
          level: 4,
        }),
      )
      .toBeVisible();
    await test
      .expect(
        query(q.article("Size override")).heading("A small section title", {
          level: 3,
        }),
      )
      .toBeVisible();
  });

  test("links a permalink to its heading", async ({ q }) => {
    const heading = query(q.article("Permalink")).heading("Anchored heading");
    await test
      .expect(query(heading).link("Anchored heading"))
      .toHaveAttribute("href", "#permalink");
  });
});

withGalleryPage("button", async ({ query, test }) => {
  test("keeps a focusable disabled button in the tab order", async ({
    page,
    q,
  }) => {
    const focusable = query(q.article("Focusable disabled"));
    const button = focusable.button("Export");
    await test.expect(button).toHaveAttribute("aria-disabled", "true");
    await test.expect(button).not.toHaveAttribute("disabled");
    await tabInto(page, focusable.heading("Focusable disabled"));
    await test.expect(button).toBeFocused();

    // A natively disabled button is not a stop, so Tab passes it by.
    const native = query(q.article("Disabled bevel"));
    await tabInto(page, native.heading("Disabled bevel"));
    await test.expect(native.button("Archive")).not.toBeFocused();
    await test.expect(page.locator("main :focus")).toHaveCount(1);
  });

  test("checks the clicked radio of a button radio group", async ({ q }) => {
    const segmented = query(
      query(q.article("Segmented control")).radiogroup("View"),
    );
    await test.expect(segmented.radio("List")).toBeChecked();
    await segmented.radio("Grid").click();
    await test.expect(segmented.radio("Grid")).toBeChecked();
    await test.expect(segmented.radio("List")).not.toBeChecked();

    const vertical = query(
      query(q.article("Vertical bar glider")).radiogroup("Theme"),
    );
    await test.expect(vertical.radio("System")).toBeChecked();
    await vertical.radio("Dark").click();
    await test.expect(vertical.radio("Dark")).toBeChecked();
    await test.expect(vertical.radio("System")).not.toBeChecked();
  });
});

withGalleryPage("badge", async ({ query, test }) => {
  // A badge is phrasing content, so the parser keeps it inside a paragraph, and
  // a heading, which holds phrasing content only, can hold it.
  test("renders a badge as phrasing content", async ({ q }) => {
    const inText = query(q.article("In running text"))
      .text("v0.2")
      .locator("..");
    await test.expect(inText).toHaveJSProperty("tagName", "SPAN");
    await test.expect(inText.locator("..")).toHaveJSProperty("tagName", "P");

    const box = query(q.article("Auto size in a heading"));
    const heading = box.heading(/^Changelog/);
    await test.expect(heading.locator(":scope > div")).toHaveCount(0);
    await test
      .expect(box.text("Latest").locator(".."))
      .toHaveJSProperty("tagName", "SPAN");
  });
});

withGalleryPage("input", async ({ query, test }) => {
  test("links each hint and error message to its field", async ({ q }) => {
    const field = query(q.article("Labeled field with hint")).textbox(
      "Display name",
    );
    await test
      .expect(field)
      .toHaveAccessibleDescription("Shown on your public profile.");

    const invalid = query(q.article("Invalid")).textbox("Email");
    await test.expect(invalid).toHaveAttribute("aria-invalid", "true");
    await test
      .expect(invalid)
      .toHaveAccessibleDescription("Enter a valid email address.");
  });

  test("names a field from the label around it", async ({ q }) => {
    const field = query(q.article("Small")).textbox("Postal code");
    await test.expect(field).toBeEditable();
  });

  test("disables the disabled field", async ({ q }) => {
    const field = query(q.article("Disabled")).textbox("Username");
    await test.expect(field).toBeDisabled();
  });

  test("keeps the key hint out of the search trigger name", async ({ q }) => {
    const trigger = query(q.article("Search trigger")).button("Search docs");
    await test.expect(trigger).toBeVisible();
  });

  test("keeps the share link read-only", async ({ q }) => {
    const box = query(q.article("Share link with copy button"));
    const input = box.textbox("Share link");
    await test.expect(input).toHaveValue("ariakit.com/ui");
    await test.expect(input).not.toBeEditable();
  });

  // The wrapper is a div because it holds a button, so a label inside it keeps
  // click-to-focus on the prefix.
  test("focuses the share link from a click on its prefix", async ({ q }) => {
    const box = query(q.article("Share link with copy button"));
    await box.text("https://").click();
    await test.expect(box.textbox("Share link")).toBeFocused();
  });
});

withGalleryPage("checkbox", async ({ query, test }) => {
  test("select all reflects and toggles its children", async ({ q }) => {
    const box = query(q.article("Select all"));
    const parent = box.checkbox("All features");
    const children = query(box.group("Features"));
    const alerts = children.checkbox("Alerts");
    const analytics = children.checkbox("Analytics");

    await test.expect(parent).toHaveAttribute("aria-checked", "mixed");
    await test.expect(alerts).toBeChecked();
    // The parent names the children it controls.
    const controls = await parent.getAttribute("aria-controls");
    const childIds = await children
      .checkbox()
      .evaluateAll((nodes) => nodes.map((node) => node.id));
    test.expect(controls?.split(" ")).toEqual(childIds);

    await parent.click();
    await test.expect(parent).toBeChecked();
    for (const child of await children.checkbox().all()) {
      await test.expect(child).toBeChecked();
    }

    await parent.click();
    await test.expect(parent).not.toBeChecked();
    for (const child of await children.checkbox().all()) {
      await test.expect(child).not.toBeChecked();
    }

    await analytics.click();
    await test.expect(analytics).toBeChecked();
    await test.expect(parent).toHaveAttribute("aria-checked", "mixed");
  });

  test("a card grid is a named group of cards", async ({ q }) => {
    const box = query(q.article("Card grid"));
    const grid = query(box.group("Features"));
    await test.expect(grid.checkbox()).toHaveCount(4);
    await test.expect(box.text("1 of 4 selected")).toBeVisible();
    // The input is visually hidden, so a user clicks the card around it.
    await grid.text("Alerts").click();
    await test.expect(grid.checkbox("Alerts")).toBeChecked();
    await test.expect(box.text("2 of 4 selected")).toBeVisible();
  });
});

withGalleryPage("combobox", async ({ query, test }) => {
  // The lists held open on this route mark every list that already exists when
  // they open as outside them, and Ariakit then ignores Escape on it. The lists
  // that tests open render in a portal and mount on open to avoid the marks,
  // and these tests guard that they still close on Escape.
  // https://github.com/ariakit/ariakit/issues/7463
  test("closes the live combobox list on Escape", async ({ page, q }) => {
    const input = q.combobox("Destination");
    await input.click();
    const list = q.listbox("Destination");
    await test.expect(list).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(list).toBeHidden();
    await test.expect(input).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7463
  test("closes the live select lists on Escape", async ({ page, q }) => {
    for (const name of ["Favorite fruit", "Review status"]) {
      const select = q.combobox(name);
      await select.click();
      const list = q.listbox(name);
      await test.expect(list).toBeVisible();
      await page.keyboard.press("Escape");
      await test.expect(list).toBeHidden();
      await test.expect(select).toBeFocused();
    }
  });

  test("filters, completes inline and closes on Enter", async ({ q }) => {
    const input = q.combobox("Destination");
    await input.click();
    const list = q.listbox("Destination");
    await test.expect(list).toBeVisible();
    // The popover renders in a portal, outside the box.
    await test
      .expect(query(q.article("Default")).listbox("Destination"))
      .toHaveCount(0);
    await input.pressSequentially("Den");
    await test.expect(input).toHaveValue("Denmark");
    await test.expect(query(list).option()).toHaveCount(1);
    await input.press("Enter");
    await test.expect(list).toBeHidden();
    await test.expect(input).toHaveValue("Denmark");
  });

  test("shows the empty state when nothing matches", async ({ q }) => {
    const input = q.combobox("Destination");
    await input.click();
    await input.pressSequentially("xyz");
    const list = q.listbox("Destination");
    await test.expect(query(list).option()).toHaveCount(0);
    await test.expect(query(list).text("No results found")).toBeVisible();
  });

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

  test("counts one selected label in the singular", async ({ q }) => {
    const select = query(q.article("Selection count")).combobox("Issue labels");
    await test.expect(select).toHaveText("2 labels");
    await select.click();
    await query(q.listbox("Issue labels")).option("Docs").click();
    await test.expect(select).toHaveText("1 label");
  });

  test("lets a long select list scroll inside its height cap", async ({
    page,
    q,
  }) => {
    const list = query(q.article("Long list")).listbox("Start time");
    await list.hover();
    await page.mouse.wheel(0, 400);
    await test.expect
      .poll(() => list.evaluate((node) => node.scrollTop))
      .toBeGreaterThan(0);
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

  test("shows the chosen status on the badge select", async ({ q }) => {
    const select = q.combobox("Review status");
    await test.expect(select).toHaveText("In review");
    await select.click();
    await q.option("Published").click();
    await test.expect(select).toHaveText("Published");
    await test.expect(q.listbox("Review status")).toBeHidden();
  });
});

withGalleryPage("tabs", async ({ query, test }) => {
  test("moves keyboard focus between tabs without selecting", async ({
    page,
    q,
  }) => {
    const box = query(q.article("Folder glider"));
    await box.tab("Code").click();
    await page.keyboard.press("ArrowRight");
    await test.expect(box.tab("Usage")).toBeFocused();
    await test
      .expect(box.tab("Usage"))
      .toHaveAttribute("aria-selected", "false");
    await test.expect(box.tab("Code")).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Enter");
    await test
      .expect(box.tab("Usage"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(box.tab("Code"))
      .toHaveAttribute("aria-selected", "false");
  });

  test("lets an overflowing strip scroll to the tabs that do not fit", async ({
    page,
    q,
  }) => {
    const strip = query(q.article("Overflowing strip")).tablist(
      "Overflowing strip",
    );
    await strip.hover();
    await page.mouse.wheel(400, 0);
    await test.expect
      .poll(() => strip.evaluate((node) => node.scrollLeft))
      .toBeGreaterThan(0);
  });
});

withGalleryPage("disclosure", async ({ query, test }) => {
  test("shares the open state of a controlled disclosure with an outside button", async ({
    page,
    q,
  }) => {
    const example = query(q.article("Controlled"));
    const toggle = example.button("Toggle delivery details");
    const button = example.button("Delivery details");
    const text = example.text(
      "Standard delivery takes three to five business days.",
    );
    const contentId = await toggle.getAttribute("aria-controls");
    test.expect(contentId).toBeTruthy();
    await test.expect(button).toHaveAttribute("aria-controls", contentId ?? "");
    await test.expect(toggle).toHaveAttribute("aria-expanded", "false");
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await test.expect(text).toBeHidden();

    await toggle.click();
    await test.expect(toggle).toHaveAttribute("aria-expanded", "true");
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    await test.expect(page.locator(`[id="${contentId}"]`)).toBeVisible();
    await test.expect(text).toBeVisible();

    await button.click();
    await test.expect(toggle).toHaveAttribute("aria-expanded", "false");
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await test.expect(text).toBeHidden();
  });

  test("labels and describes a button that has both", async ({ q }) => {
    const button = query(q.article("Description")).button("Billing");
    await test
      .expect(button)
      .toHaveAccessibleDescription("Manage the cards on this account");
  });

  test("opens and closes group members independently", async ({ q }) => {
    const group = query(q.article("Group"));
    const change = group.button("Can I change my plan?");
    const refunds = group.button("Do you offer refunds?");
    await test.expect(change).toHaveAttribute("aria-expanded", "true");
    await test.expect(refunds).toHaveAttribute("aria-expanded", "false");
    await refunds.click();
    await test.expect(refunds).toHaveAttribute("aria-expanded", "true");
    await test.expect(change).toHaveAttribute("aria-expanded", "true");
    await test
      .expect(group.text("We refund any payment made in the last 30 days."))
      .toBeVisible();
  });
});

withGalleryPage("nav", async ({ query, test }) => {
  test("marks only the link that matches the current URL", async ({ q }) => {
    const rows = query(q.navigation("Rows"));
    await test
      .expect(rows.link("Installation"))
      .toHaveAttribute("aria-current", "page");
    await test
      .expect(rows.link("Overview"))
      .not.toHaveAttribute("aria-current");
    await test.expect(rows.link("Usage")).not.toHaveAttribute("aria-current");
    // A link to a part of the current page is not the current page.
    await test.expect(rows.link("Options")).not.toHaveAttribute("aria-current");

    // A placeholder link has no destination, so it stays out of the tab order.
    const roadmap = rows.link("Roadmap");
    await test.expect(roadmap).toHaveAttribute("aria-disabled", "true");
    await test.expect(roadmap).not.toHaveAttribute("href");
    await rows.link("Usage").focus();
    await rows.link("Usage").press("Tab");
    await test.expect(roadmap).not.toBeFocused();
  });

  test("opens the section that holds the current link", async ({ q }) => {
    const nav = query(q.navigation("Disclosures"));
    await test
      .expect(nav.button("Getting started"))
      .toHaveAttribute("aria-expanded", "true");
    await test
      .expect(nav.button("Styling"))
      .toHaveAttribute("aria-expanded", "true");
    await test
      .expect(nav.button("Composition"))
      .toHaveAttribute("aria-expanded", "false");
    const current = q
      .navigation("Disclosures")
      .locator("[aria-current='page']");
    await test.expect(current).toHaveAccessibleName("Introduction");
    await test.expect(current).toBeVisible();
    await test
      .expect(current)
      .toHaveAttribute("href", "/docs/styling/introduction");
  });

  test("opens every section around a deep current link", async ({ q }) => {
    const nav = query(q.navigation("Nested disclosures"));
    await test
      .expect(nav.button("Components"))
      .toHaveAttribute("aria-expanded", "true");
    await test
      .expect(nav.button("Forms"))
      .toHaveAttribute("aria-expanded", "true");
    const checkbox = nav.link("Checkbox");
    await test.expect(checkbox).toHaveAttribute("aria-current", "page");
    await test.expect(checkbox).toBeVisible();
  });

  test("moves the current page when a sidebar link is clicked", async ({
    q,
  }) => {
    const nav = query(q.navigation("Documentation sections"));
    const current = q
      .navigation("Documentation sections")
      .locator("[aria-current='page']");
    await test.expect(current).toHaveCount(1);
    await test
      .expect(current)
      .toHaveAttribute("href", "/docs/styling/introduction");
    await nav.link("Quickstart").first().click();
    await test.expect(current).toHaveCount(1);
    await test
      .expect(current)
      .toHaveAttribute("href", "/docs/start/quickstart");
  });
});

withGalleryPage("list", async ({ query, test }) => {
  test("describes the value of a progress marker", async ({ q }) => {
    const row = query(q.article("Checklist"))
      .listitem()
      .filter({ hasText: "Collect the replies" });
    const marker = query(row).img("Unchecked");
    await test.expect(marker).toHaveAccessibleDescription("65% complete");

    const done = query(q.article("Checklist"))
      .listitem()
      .filter({ hasText: "Book the venue" });
    await test
      .expect(query(done).img("Checked"))
      .toHaveAccessibleDescription("");
  });

  test("describes the value of a standalone progress marker", async ({ q }) => {
    const entry = query(q.article("Status legend")).text("In progress");
    await test
      .expect(query(entry).img("Unchecked"))
      .toHaveAccessibleDescription("70% complete");
  });

  // Sections mode used to match only h1 to h4, so the deep sections box needs
  // headings at level five to cover the rhythm that its capture shows.
  test("nests the deep sections headings at level five", async ({ q }) => {
    await test
      .expect(
        query(q.article("Deep sections")).heading("Two-factor sign-in", {
          level: 5,
        }),
      )
      .toBeVisible();
    await test
      .expect(query(q.article("Sections")).heading("Account", { level: 3 }))
      .toBeVisible();
  });
});

withGalleryPage("table", async ({ query, test }) => {
  test("selects rows with their checkboxes and the select-all", async ({
    q,
  }) => {
    const grid = query(q.grid("Select components"));
    const selectAll = grid.checkbox("Select all rows");
    // A row's name starts with its checkbox label, then its row header.
    const rowOf = (name: string) => grid.row(new RegExp(`^Select ${name} `));

    await test.expect(selectAll).toHaveAttribute("aria-checked", "mixed");
    await test.expect(rowOf("Glider")).toHaveAttribute("aria-selected", "true");
    await test.expect(rowOf("Tabs")).toHaveAttribute("aria-selected", "true");
    await test
      .expect(rowOf("Button"))
      .toHaveAttribute("aria-selected", "false");

    await grid.checkbox("Select Button").click();
    await grid.checkbox("Select Table").click();
    await test.expect(rowOf("Button")).toHaveAttribute("aria-selected", "true");
    await test.expect(selectAll).toBeChecked();

    await selectAll.click();
    for (const name of ["Button", "Glider", "Tabs", "Table"]) {
      await test.expect(rowOf(name)).toHaveAttribute("aria-selected", "false");
    }
    await test.expect(selectAll).not.toBeChecked();
  });

  test("moves cell focus with the arrow keys", async ({ page, q }) => {
    const grid = query(q.article("Selected rows"));
    await grid.checkbox("Select all rows").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await test.expect(grid.rowheader("Glider")).toBeFocused();
    await test
      .expect(grid.row(/\bGlider\b/))
      .toHaveAttribute("aria-selected", "true");
  });

  test("moves row focus with the arrow keys", async ({ page, q }) => {
    const grid = query(q.article("Focusable rows"));
    const first = grid.row(/^Button /);
    await first.focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(first).not.toBeFocused();
    await page.keyboard.press("ArrowUp");
    await test.expect(first).toBeFocused();
    await page.keyboard.press("End");
    await test.expect(grid.row(/^Table /)).toBeFocused();
  });
});

withGalleryPage("progress", async ({ query, test }) => {
  // Whether the element itself, not something painted over it, is what the
  // pointer reaches at its center. Hit testing only covers the viewport.
  const isHitAtCenter = async (element: Locator) => {
    await element.scrollIntoViewIfNeeded();
    return element.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const hit = node.ownerDocument.elementFromPoint(
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
      );
      return !!hit && node.contains(hit);
    });
  };

  // The disc that paints the parent surface back over the center of the ring
  // used to paint over the label too, and the arc's box, whose mask hit testing
  // ignores, took the pointer.
  test("lets the pointer reach the label in the middle of a ring", async ({
    q,
  }) => {
    for (const { box, name, label } of [
      { box: "Ring with label", name: "Photo backup", label: "70%" },
      { box: "Ring on a brand layer", name: "Course progress", label: "60%" },
    ]) {
      const ring = query(q.article(box)).progressbar(name);
      const text = query(ring).text(label);
      await test.expect(text).toBeVisible();
      test.expect(await isHitAtCenter(text)).toBe(true);
    }
  });
});

withGalleryPage("popover", async ({ query, test }) => {
  // The popovers held open on this route mark every popover that already exists
  // when they open as outside them, and Ariakit then ignores Escape on it. The
  // live popover renders in a portal and mounts on open to avoid the marks, and
  // this test guards that it still closes on Escape.
  // https://github.com/ariakit/ariakit/issues/7463
  test("closes the live popover on Escape while others are held open", async ({
    page,
    q,
  }) => {
    const disclosure = q.button("Event details");
    await disclosure.click();
    const popover = q.dialog("Design review");
    await test.expect(popover).toBeVisible();
    // The popover renders in a portal, outside its box.
    await test
      .expect(query(q.article("Opened on click")).dialog())
      .toHaveCount(0);
    await test.expect(query(popover).button("Close")).toBeFocused();
    await page.keyboard.press("Escape");
    await test.expect(popover).toBeHidden();
    await test.expect(disclosure).toBeFocused();
    // The held popovers ignore Escape and stay open.
    await test
      .expect(query(q.article("Default")).dialog("Team meeting"))
      .toBeVisible();
  });

  test("closes the live popover on a click outside", async ({ q }) => {
    await q.button("Event details").click();
    const popover = q.dialog("Design review");
    await test.expect(popover).toBeVisible();
    await q.heading("Popover", { level: 1 }).click();
    await test.expect(popover).toBeHidden();
  });

  test("closes a held popover from its dismiss and reopens it from its disclosure", async ({
    q,
  }) => {
    const box = query(q.article("Brand callout"));
    const popover = box.dialog("New: saved views");
    await test.expect(popover).toBeVisible();
    await box.button("Got it").click();
    await test.expect(popover).toBeHidden();
    await box.button("Views").click();
    await test.expect(popover).toBeVisible();
  });

  test("closes a popover from a dismiss without children", async ({ q }) => {
    const box = query(q.article("Close button"));
    const popover = box.dialog("Notifications");
    await test.expect(popover).toBeVisible();
    await box.button("Dismiss popup").click();
    await test.expect(popover).toBeHidden();
    await box.button("Notifications").click();
    await test.expect(popover).toBeVisible();
  });

  test("describes a popover that has no heading", async ({ q }) => {
    const popover = query(q.article("Compact frame")).dialog("Share");
    await test
      .expect(popover)
      .toHaveAccessibleDescription("Anyone with the link can view.");
  });

  // The entry transition runs for a few hundred milliseconds from the frame
  // that shows the popover, so a regression is still running when the
  // visibility assertion passes.
  test("runs no popover animation when the user prefers reduced motion", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await q.button("Event details").click();
    const popover = q.dialog("Design review");
    await test.expect(popover).toBeVisible();
    test.expect(await countAnimations(popover)).toBe(0);
  });
});

withGalleryPage("dialog", async ({ query, test }) => {
  test("moves focus into the dialog and back to its disclosure on Escape", async ({
    page,
    q,
  }) => {
    const disclosure = q.button("View receipt");
    await disclosure.click();
    const dialog = q.dialog("Success");
    await test.expect(dialog).toBeVisible();
    await test.expect(query(dialog).button("OK")).toBeFocused();
    // The dialog renders in a portal, outside its box.
    await test.expect(query(q.article("Default")).dialog()).toHaveCount(0);
    await page.keyboard.press("Escape");
    await test.expect(dialog).toBeHidden();
    await test.expect(disclosure).toBeFocused();
  });

  test("closes the dialog from its dismiss", async ({ q }) => {
    const disclosure = q.button("Invite member");
    await disclosure.click();
    const dialog = q.dialog("Invite sent");
    await test.expect(dialog).toBeVisible();
    await query(dialog).button("Dismiss popup").click();
    await test.expect(dialog).toBeHidden();
    await test.expect(disclosure).toBeFocused();
  });

  test("submits the form and closes the dialog with the new name", async ({
    q,
  }) => {
    const box = query(q.article("Form"));
    await test.expect(box.text("Current name: Ariakit UI")).toBeVisible();
    await box.button("Rename project").click();
    const dialog = q.dialog("Rename project");
    const field = query(dialog).textbox("Project name");
    await test.expect(field).toBeFocused();
    await field.fill("Ariakit Docs");
    await query(dialog).button("Save").click();
    await test.expect(dialog).toBeHidden();
    await test.expect(box.text("Current name: Ariakit Docs")).toBeVisible();
    await test.expect(box.button("Rename project")).toBeFocused();
  });

  test("keeps the saved name when the form is canceled", async ({ q }) => {
    const box = query(q.article("Form"));
    await box.button("Rename project").click();
    const dialog = q.dialog("Rename project");
    await query(dialog).textbox("Project name").fill("Discarded");
    await query(dialog).button("Cancel").click();
    await test.expect(dialog).toBeHidden();
    await test.expect(box.text("Current name: Ariakit UI")).toBeVisible();
    // The dialog unmounts on close, so the field starts from the saved name.
    await box.button("Rename project").click();
    await test
      .expect(query(dialog).textbox("Project name"))
      .toHaveValue("Ariakit UI");
  });

  // Initial focus lands on the action after the body, and the body must not
  // scroll to reach it, so the first section stays readable.
  test("focuses the action after a long body without scrolling the body", async ({
    q,
  }) => {
    await q.button("Terms of service").click();
    const dialog = q.dialog("Terms of service");
    await test.expect(query(dialog).button("Agree")).toBeFocused();
    const body = dialog.locator("p").first().locator("..");
    test.expect(await body.evaluate((node) => node.scrollTop)).toBe(0);
  });

  test("closes the nested dialog first on Escape", async ({ page, q }) => {
    const disclosure = q.button("Project settings");
    await disclosure.click();
    const outer = q.dialog("Project settings");
    await test.expect(outer).toBeVisible();
    const innerDisclosure = query(outer).button("Delete project");
    await innerDisclosure.click();
    const inner = q.dialog("Delete project?");
    await test.expect(inner).toBeVisible();
    await test.expect(query(inner).button("Cancel")).toBeFocused();

    await page.keyboard.press("Escape");
    await test.expect(inner).toBeHidden();
    await test.expect(outer).toBeVisible();
    await test.expect(innerDisclosure).toBeFocused();

    await page.keyboard.press("Escape");
    await test.expect(outer).toBeHidden();
    await test.expect(disclosure).toBeFocused();
  });

  // The entry transitions run for a few hundred milliseconds from the frame
  // that shows the dialog, so a regression is still running when the visibility
  // assertion passes.
  test("runs no dialog or backdrop animation when the user prefers reduced motion", async ({
    page,
    q,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await q.button("View receipt").click();
    const dialog = q.dialog("Success");
    await test.expect(dialog).toBeVisible();
    test.expect(await countAnimations(dialog, true)).toBe(0);
  });
});

withGalleryPage("tooltip", async ({ query, test }) => {
  // The tooltips held open on this route mark every tooltip that already exists
  // when they open as outside them, and Ariakit then ignores Escape on it. The
  // live tooltip mounts on open to avoid the marks, and this test guards that
  // it still closes on Escape.
  // https://github.com/ariakit/ariakit/issues/7463
  test("closes the live tooltip on Escape while others are held open", async ({
    page,
    q,
  }) => {
    const anchor = q.button("Publish");
    await tabTo(page, anchor);
    await test.expect(anchor).toBeFocused();
    const tooltip = q.tooltip("Publish to the public site");
    await test.expect(tooltip).toBeVisible();
    // The tooltip renders in a portal, outside its box.
    await test
      .expect(query(q.article("Hover or focus")).tooltip())
      .toHaveCount(0);
    await page.keyboard.press("Escape");
    await test.expect(tooltip).toBeHidden();
    await test.expect(anchor).toBeFocused();
    // The held tooltips ignore Escape and stay open.
    await test.expect(q.tooltip("Save changes")).toBeVisible();
  });

  test("opens the live tooltip on hover", async ({ q }) => {
    const anchor = q.button("Publish");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await anchor.scrollIntoViewIfNeeded();
    await anchor.hover();
    const tooltip = q.tooltip("Publish to the public site");
    await test.expect(tooltip).toBeVisible();
    await q.heading("Tooltip", { level: 1 }).hover();
    await test.expect(tooltip).toBeHidden();
  });
});

withGalleryPage("combobox-fixtures", async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973490977
  test("displays zero counts instead of the selected value", async ({ q }) => {
    await test.expect(q.combobox("Unread messages")).toHaveText("0");
    await test.expect(q.combobox("Open issues")).toHaveText("0");
    await q.combobox("Open issues").click();
    await test.expect(q.option("0")).toBeVisible();
    await q.option("0").click();
    // The combobox-item-highlight list stays open on this route, so the query
    // names the list that closes.
    await test.expect(q.listbox("Open issues")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973273374
  test("opens and selects with a supplied store", async ({ q }) => {
    const select = q.combobox("Fruit");
    await test.expect(select).toHaveText("Apple");
    await select.click();
    await test.expect(q.option("Orange")).toBeVisible();
    await q.option("Orange").click();
    await test.expect(select).toHaveText("Orange");
    await test.expect(q.text("Selected fruit: Orange")).toBeVisible();
    // The combobox-item-highlight list stays open on this route, so the query
    // names the list that closes.
    await test.expect(q.listbox("Fruit")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974549543
  test("falls back from false labels and keeps conditional options named", async ({
    q,
  }) => {
    const button = q.combobox("Status filter");
    await test.expect(button).toHaveText("Open");
    await test.expect(q.combobox("Status summary")).toHaveText("0Summary");
    await button.click();
    await q.option("Closed").click();
    await test.expect(button).toHaveText("Closed");
    await q.checkbox("Show status labels").check();
    await test.expect(button).toContainText("Custom status");
    await button.click();
    await test.expect(q.option("Closed status")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974549543
  test("omits false icon slots and preserves zero icons", async ({ q }) => {
    const button = q.combobox("Status filter");
    await test.expect(button.locator(":scope > *")).toHaveCount(1);
    await button.click();
    // Other lists are open on this route, so the options come from this one.
    const options = query(q.listbox("Status filter")).option();
    await test.expect(options.nth(0).locator(":scope > *")).toHaveCount(1);
    await test.expect(options.nth(1).locator(":scope > *")).toHaveCount(1);
    await test.expect(q.option(/^0\s*No activity$/)).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974549543
  test("preserves intentional empty strings", async ({ q }) => {
    await test.expect(q.combobox("Blank display")).toHaveText("");
    await test.expect(q.combobox("Blank summary")).toHaveText("");
    await q.combobox("Status filter").click();
    await test.expect(q.option("Blank status")).toHaveText("");
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
  test("keeps an editable input when an optional render is undefined", async ({
    q,
  }) => {
    await q.textbox("Project name").fill("Website");
    await test.expect(q.text("Project: Website")).toBeVisible();
    await q.textbox("Notes").fill("First line\nSecond line");
    await test
      .expect(q.textbox("Notes"))
      .toHaveValue("First line\nSecond line");
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
  test("keeps the combobox list in a portal with optional position props", async ({
    q,
  }) => {
    await q.combobox("Assignee").click();
    await test.expect(q.listbox("Assignee")).toBeVisible();
    await test
      .expect(query(q.region("Project editor")).listbox())
      .toHaveCount(0);
  });
});

withGalleryPage("disclosure-fixtures", async ({ query, test }) => {
  test.describe("disclosure button store", () => {
    for (const name of ["Project", "Team"]) {
      // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781692
      test(`keeps the ${name.toLowerCase()} button state in sync with its explicit store`, async ({
        q,
      }) => {
        const fixture = query(q.article("Disclosure button store"));
        const button = fixture.button(`${name} details`);
        await test.expect(button).toHaveAttribute("aria-expanded", "false");
        await test.expect(button).not.toHaveAttribute("data-open");
        await button.click();
        await test.expect(button).toHaveAttribute("aria-expanded", "true");
        await test.expect(button).toHaveAttribute("data-open", "true");
        await test
          .expect(fixture.text(`${name} details are available.`))
          .toBeVisible();
        await button.click();
        await test.expect(button).toHaveAttribute("aria-expanded", "false");
        await test.expect(button).not.toHaveAttribute("data-open");
        await test
          .expect(fixture.text(`${name} details are available.`))
          .not.toBeVisible();
      });
    }
  });

  test.describe("disclosure optional content", () => {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974550076
    test("omits a false label while keeping the description", async ({ q }) => {
      const fixture = query(q.article("Disclosure optional content"));
      const button = fixture.button("Optional title");
      await test.expect(button).not.toHaveAttribute("aria-labelledby");
      // The description is the button's only content, so it names the button
      // and does not describe it with the same text again.
      await test.expect(button).toHaveAccessibleName("Optional title");
      await test.expect(button).not.toHaveAttribute("aria-describedby");
      await test.expect(button.locator("span[id]")).toHaveCount(1);
      await button.click();
      await test.expect(fixture.text("Optional settings")).toBeVisible();
    });

    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974549543
    test("renders a zero icon before the label and the default indicator", async ({
      q,
    }) => {
      const fixture = query(q.article("Disclosure optional content"));
      const button = fixture.button(/Unread messages$/);
      await test.expect(button).toHaveText("0Unread messages");
      await test
        .expect(button.locator(":scope > span").first())
        .toHaveText("0");
      await test
        .expect(button.locator(":scope > span").last())
        .toHaveAttribute("data-disclosure-indicator");
      await button.click();
      await test.expect(fixture.text("No unread messages")).toBeVisible();
    });

    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974019389
    test("preserves a zero description and omits a false description", async ({
      q,
    }) => {
      const fixture = query(q.article("Disclosure optional content"));
      const button = fixture.button("Pending requests");
      await test.expect(button).toHaveAccessibleDescription("0");
      await test.expect(button).toHaveText("Pending requests0");
      await button.click();
      await test.expect(fixture.text("No requests need review")).toBeVisible();
      const archived = fixture.button("Archived requests");
      await test.expect(archived).not.toHaveAttribute("aria-describedby");
      await test.expect(archived).not.toHaveAttribute("aria-labelledby");
    });

    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224162
    test("omits optional headings without hiding the filters", async ({
      page,
      q,
    }) => {
      const article = q.article("Disclosure optional content");
      const fixture = query(article);
      const assignee = fixture.combobox("Assignee");
      // The combobox popover renders in a portal, outside the fixture. The
      // combobox remounts when the headings toggle, so its popover is looked up
      // again each time.
      const getPopover = async () => {
        const id = await assignee.getAttribute("aria-controls");
        return query(page.locator(`[id="${id}"]`));
      };
      await test.expect(assignee).toBeVisible();
      await test.expect(fixture.combobox("Status")).toBeVisible();
      await test.expect(fixture.button("")).toHaveCount(0);
      await test
        .expect(article.locator("label").filter({ hasText: /^$/ }))
        .toHaveCount(0);
      await assignee.click();
      const popover = await getPopover();
      await test.expect(popover.option("Alice")).toBeVisible();
      await test.expect(popover.group()).not.toHaveAttribute("aria-labelledby");
      await assignee.press("Escape");
      await fixture.checkbox("Show filter headings").check();
      await test.expect(fixture.button("Project filters")).toBeVisible();
      await test.expect(assignee).not.toBeVisible();
      await fixture.button("Project filters").click();
      await test.expect(assignee).toBeVisible();
      await assignee.click();
      await test.expect((await getPopover()).group("Team")).toBeVisible();
      await assignee.press("Escape");
      await fixture.button("0").click();
      await test.expect(fixture.text("No pending requests")).toBeVisible();
    });

    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224487
    test("names a disclosure from its description without a missing label", async ({
      q,
    }) => {
      const fixture = query(q.article("Disclosure optional content"));
      const button = fixture.button("Advanced options");
      await test.expect(button).not.toHaveAttribute("aria-labelledby");
      // The description names the button, so describing it with the same text
      // would announce it twice.
      await test.expect(button).toHaveAccessibleName("Advanced options");
      await test.expect(button).not.toHaveAttribute("aria-describedby");
      await button.click();
      await test.expect(fixture.text("Advanced controls")).toBeVisible();
    });

    // Only a missing label may drop the description relationship. A caller's
    // aria-label names the button, so the description must still describe it.
    test("describes a description-only button that an aria-label names", async ({
      q,
    }) => {
      const fixture = query(q.article("Named description-only button"));
      const button = fixture.button("Advanced filters");
      await test.expect(button).toHaveAccessibleName("Advanced filters");
      await test.expect(button).toHaveAccessibleDescription("Tune the results");
    });
  });
});

withGalleryPage("list-fixtures", async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584702
  test("omits a conditional list button without hiding its content", async ({
    q,
  }) => {
    const scope = query(q.article("list-disclosure-optional-button"));
    await test.expect(scope.text("Review assigned issues")).toBeVisible();
    await test.expect(scope.button("")).toHaveCount(0);

    await scope.checkbox("Show task headings").check();
    await test.expect(scope.button("Project tasks")).toBeVisible();
    await test.expect(scope.text("Review assigned issues")).toBeHidden();
    await scope.button("Project tasks").click();
    await test.expect(scope.text("Review assigned issues")).toBeVisible();
    await scope.button("Project tasks").click();
    await test.expect(scope.text("Review assigned issues")).toBeHidden();

    await scope.checkbox("Show task headings").uncheck();
    await test.expect(scope.text("Review assigned issues")).toBeVisible();
    await test.expect(scope.button("Project tasks")).toHaveCount(0);
    await test.expect(scope.button("")).toHaveCount(0);
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584702
  test("keeps zero as a list button label", async ({ q }) => {
    const scope = query(q.article("list-disclosure-optional-button"));
    const button = scope.button("0");
    await test.expect(button).toBeVisible();
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    await test.expect(scope.text("No pending tasks")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781710
  test("uses progress as the default check state and preserves explicit values", async ({
    q,
  }) => {
    const scope = query(q.article("list-item-marker-checked"));
    const completed = query(scope.list("Completed progress"));
    const unchecked = query(scope.list("Explicit unchecked state"));
    const checked = query(scope.list("Explicit checked state"));
    await test.expect(completed.img("Checked")).toBeVisible();
    await test.expect(unchecked.img("Unchecked")).toBeVisible();
    await test.expect(checked.img("Checked")).toBeVisible();
  });
});

withGalleryPage("nav-fixtures", async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552687
  test("omits a conditional navigation button without hiding its links", async ({
    q,
  }) => {
    const fixture = query(q.article("Optional navigation headings"));
    const navigation = query(fixture.navigation("Workspace navigation"));
    await test.expect(navigation.link("Workspace members")).toBeVisible();
    await test.expect(navigation.link("Workspace settings")).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(0);

    await fixture.checkbox("Show navigation headings").check();
    const button = navigation.button("Workspace pages");
    await test.expect(button).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(1);
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await test.expect(navigation.link("Workspace members")).toBeHidden();
    await button.click();
    await test.expect(navigation.link("Workspace members")).toBeVisible();
    await test.expect(navigation.link("Workspace settings")).toBeVisible();
    await button.click();
    await test.expect(navigation.link("Workspace members")).toBeHidden();

    await fixture.checkbox("Show navigation headings").uncheck();
    await test.expect(navigation.link("Workspace members")).toBeVisible();
    await test.expect(navigation.link("Workspace settings")).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(0);
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552687
  test("keeps zero as a navigation button label", async ({ q }) => {
    const navigation = query(q.navigation("Invitation navigation"));
    const button = navigation.button("0");
    await test.expect(button).toBeVisible();
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await test.expect(navigation.link("Invitation settings")).toBeHidden();
    await button.click();
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    await test.expect(navigation.link("Invitation settings")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584695
  test("uses the explicit navigation button and content without extra controls", async ({
    q,
  }) => {
    const navigation = query(q.navigation("Project navigation"));
    const button = navigation.button("Project pages");
    await test.expect(button).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(1);
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await test.expect(navigation.link("All projects")).toBeHidden();

    await button.click();
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    await test.expect(navigation.link("All projects")).toBeVisible();
    await test.expect(navigation.button()).toHaveCount(1);

    await button.click();
    await test.expect(navigation.link("All projects")).toBeHidden();
    await test.expect(button).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223511
  test("keeps a dialog closed when its navigation contains the current page", async ({
    q,
  }) => {
    const fixture = query(q.article("Current page in a dialog"));
    const disclosure = fixture.button("Open navigation dialog");
    await test.expect(disclosure).toHaveAttribute("aria-expanded", "false");
    // The dialog renders in a portal, outside the fixture.
    await test.expect(q.dialog("Navigation dialog")).toBeHidden();

    await disclosure.click();
    const dialog = q.dialog("Navigation dialog");
    await test.expect(dialog).toBeVisible();
    await test
      .expect(query(dialog).link("Documentation"))
      .toHaveAttribute("aria-current", "page");

    await query(dialog).button("Close navigation dialog").click();
    await test.expect(q.dialog("Navigation dialog")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223511
  test("opens the current page's navigation group across an unrelated provider", async ({
    q,
  }) => {
    const fixture = query(q.article("Section across an unrelated provider"));
    await test
      .expect(fixture.button("Account pages"))
      .toHaveAttribute("aria-expanded", "true");
    await test.expect(fixture.link("Account overview")).toBeVisible();
    await test
      .expect(fixture.button("Open account settings"))
      .toHaveAttribute("aria-expanded", "false");
    // The dialog renders in a portal, outside the fixture.
    await test.expect(q.dialog("Account settings")).toBeHidden();

    await fixture.button("Open account settings").click();
    await test.expect(q.dialog("Account settings")).toBeVisible();
  });
});

withGalleryPage("progress-fixtures", async ({ query, test }) => {
  test("moves the bar and the ring to each new value", async ({ q }) => {
    const scope = query(q.article("Value change"));
    const bar = scope.progressbar("Build bar");
    const ring = scope.progressbar("Build ring");

    await test.expect(bar).toHaveAttribute("aria-valuenow", "0.2");
    await test.expect(ring).toHaveAttribute("aria-valuenow", "0.2");

    await scope.button("Advance").click();
    await test.expect(bar).toHaveAttribute("aria-valuenow", "0.5");
    await test.expect(ring).toHaveAttribute("aria-valuenow", "0.5");

    await scope.button("Advance").click();
    await scope.button("Advance").click();
    await test.expect(bar).toHaveAttribute("aria-valuenow", "1");
    await test.expect(ring).toHaveAttribute("aria-valuenow", "1");

    await scope.button("Reset").click();
    await test.expect(bar).toHaveAttribute("aria-valuenow", "0");
    await test.expect(ring).toHaveAttribute("aria-valuenow", "0");
    await test.expect(scope.button("Advance")).toBeVisible();
  });
});

withGalleryPage("table-fixtures", async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972228648
  test("selects the cell layer row from its checkbox", async ({ q }) => {
    const fixture = query(q.article("Table cell layer"));
    await test
      .expect(fixture.row())
      .not.toHaveAttribute("aria-selected", "true");
    await fixture.checkbox("Select row").check();
    await test.expect(fixture.row()).toHaveAttribute("aria-selected", "true");
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974212082
  test("keeps edited notes with each contributor after reordering and insertion", async ({
    q,
  }) => {
    const fixture = query(q.article("Table rows"));
    await fixture.textbox("Ada notes").fill("Ready for review");
    await fixture.textbox("Grace notes").fill("Tests complete");
    await fixture.button("Reverse rows").click();

    await test
      .expect(fixture.cell(/^(Ada|Grace)$/))
      .toHaveText(["Grace", "Ada"]);
    await test
      .expect(fixture.textbox("Ada notes"))
      .toHaveValue("Ready for review");
    await test
      .expect(fixture.textbox("Grace notes"))
      .toHaveValue("Tests complete");

    await fixture.button("Add contributor").click();

    await test
      .expect(fixture.cell(/^(Ada|Grace|Katherine)$/))
      .toHaveText(["Katherine", "Grace", "Ada"]);
    await test.expect(fixture.textbox("Katherine notes")).toHaveValue("");
    await test
      .expect(fixture.textbox("Ada notes"))
      .toHaveValue("Ready for review");
    await test
      .expect(fixture.textbox("Grace notes"))
      .toHaveValue("Tests complete");
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974212082
  test("renders column cells without the reserved row metadata", async ({
    q,
  }) => {
    const table = query(q.table("Team hours"));
    await test
      .expect(table.columnheader())
      .toHaveText(["Contributor", "Hours", "Notes"]);
    await test.expect(query(table.row(/^Ada /)).cell()).toHaveCount(3);
    await test.expect(query(table.row(/^Grace /)).cell()).toHaveCount(3);
    await test.expect(table.rowheader("Total")).toHaveAttribute("scope", "row");
    await test.expect(query(table.row(/^Total /)).cell()).toHaveCount(2);
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974552570
  test("keeps missing hours under their header when adding a contributor", async ({
    q,
  }) => {
    const fixture = query(q.article("Table rows"));
    await fixture.button("Add contributor").click();

    const cells = query(fixture.row(/^Katherine\b/)).cell();
    await test.expect(cells).toHaveCount(3);
    await test.expect(cells.nth(0)).toHaveText("Katherine");
    await test.expect(cells.nth(1)).toBeEmpty();
    await test
      .expect(query(cells.nth(2)).textbox("Katherine notes"))
      .toHaveValue("");
  });

  // Explicit zero must not share an identity with an unkeyed row at index zero.
  test("keeps keyed row edits when unkeyed rows change position", async ({
    q,
  }) => {
    const fixture = query(q.article("Mixed row keys"));
    await fixture.textbox("Assigned task notes").fill("Ready to assign");
    await fixture.button("Reverse task rows").click();

    await test
      .expect(fixture.cell(/^(Draft|Assigned) task$/))
      .toHaveText(["Assigned task", "Draft task"]);
    await test
      .expect(fixture.textbox("Assigned task notes"))
      .toHaveValue("Ready to assign");
    await test.expect(fixture.textbox("Draft task notes")).toHaveValue("Draft");
  });

  // A declarative value that is an element other than a TableCell is the cell's
  // content. It used to be cloned as the cell itself, which put it in the row
  // beside the cells, with the column props on it.
  test("renders element values inside the cells of their columns", async ({
    page,
    q,
  }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      errors.push(message.text());
    });
    // withGalleryPage opened the page before the listener existed, and React
    // reports invalid nesting and props while the island renders.
    await page.reload({ waitUntil: "load" });
    await waitForGalleryPage(page, "table-fixtures");

    const table = query(q.table("Element values"));
    const row = table.row(/^Ada /);
    await test.expect(query(row).rowheader("Ada")).toBeVisible();
    const cells = query(row).cell();
    await test.expect(cells).toHaveCount(2);
    await test.expect(cells.nth(0)).toHaveText("Active");
    await test.expect(query(cells.nth(1)).button("Edit Ada")).toBeVisible();
    test.expect(errors).toEqual([]);
  });
});

withGalleryPage("tabs-fixtures", async ({ query, test }) => {
  for (const name of ["Project", "Team"]) {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781700
    test(`keeps the ${name.toLowerCase()} panel visible with an explicit store`, async ({
      q,
    }) => {
      const box = query(q.article("Tab panel shared store"));
      await test.expect(box.tabpanel(`${name} activity`)).toBeVisible();
      await box.tab(`${name} reviews`).click();
      await test.expect(box.tabpanel(`${name} reviews`)).toBeVisible();
      await test.expect(box.text(`${name} review updates`)).toBeVisible();
      await box.tab(`${name} activity`).click();
      await test.expect(box.tabpanel(`${name} activity`)).toBeVisible();
      await test.expect(box.text(`${name} activity updates`)).toBeVisible();
    });
  }

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781700
  test("preserves an explicit tabId on a single panel", async ({ q }) => {
    const box = query(q.article("Tab panel shared store"));
    await test.expect(box.tabpanel("Pinned activity")).toBeVisible();
    await box.tab("Pinned reviews").click();
    await test
      .expect(box.tab("Pinned reviews"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(box.tabpanel("Pinned activity")).not.toBeVisible();
    await box.tab("Pinned activity").click();
    await test.expect(box.tabpanel("Pinned activity")).toBeVisible();
  });

  test("a tabs record keys its tabs and passes tab props", async ({
    page,
    q,
  }) => {
    const box = query(q.article("Tabs record"));
    // defaultSelectedId names a record key, so the keys are the tab ids.
    await test
      .expect(box.tab("Usage"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(box.tab("Code")).toHaveAttribute("aria-disabled", "true");

    await box.tab("Preview").click();
    await test
      .expect(box.tab("Preview"))
      .toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await test.expect(box.tab("Code")).toBeFocused();
    await test
      .expect(box.tab("Code"))
      .toHaveAttribute("aria-selected", "false");
    await test
      .expect(box.tab("Preview"))
      .toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await test
      .expect(box.tab("Usage"))
      .toHaveAttribute("aria-selected", "true");
  });
});

const buttonPageUrl = /\/react\/previews\/ariakit-ui\/#\/button$/;

// The shell is the same on every page, so one page exercises it. "Nav" also
// gives the sidebar a current link whose name cannot collide with the "Nav
// fixtures" link, because every link query here is exact.
withGalleryPage("nav", async ({ query, test }) => {
  test.describe("desktop", () => {
    // test.use sets the width before the preview loads, so the sidebar never
    // renders at another breakpoint first.
    test.use({ viewport: { width: 1280, height: 900 } });

    test("keeps the gallery sidebar expanded", async ({ page, q }) => {
      const sidebar = q.complementary("Gallery sections");
      await test.expect(sidebar).toBeVisible();
      await test
        .expect(query(sidebar).link("Nav", { exact: true }))
        .toHaveAttribute("aria-current", "page");
      await test.expect(q.button("Open gallery sections")).toBeHidden();
      await test.expect(q.button("Collapse sidebar")).toHaveCount(0);

      await query(sidebar).link("Button", { exact: true }).click();
      await test.expect(page).toHaveURL(buttonPageUrl);
      await test.expect(q.heading("Button", { level: 1 })).toBeVisible();
      await test.expect(page).toHaveTitle("Ariakit UI: Button");
      await test
        .expect(query(sidebar).link("Button", { exact: true }))
        .toHaveAttribute("aria-current", "page");
      await test
        .expect(query(sidebar).link("Nav", { exact: true }))
        .not.toHaveAttribute("aria-current");

      // Browser history moves between the hash pages.
      await page.goBack();
      await test.expect(q.heading("Nav", { level: 1 })).toBeVisible();
    });

    test("keeps the page when an example link changes the hash", async ({
      page,
      q,
    }) => {
      // The page would only change after the hashchange event, so the test
      // waits for the event before it asserts that the page stayed.
      const hashChange = page.evaluate(
        () =>
          new Promise((resolve) => {
            addEventListener("hashchange", resolve, { once: true });
          }),
      );
      await query(q.article("Touching rows")).link("Overview").click();
      await hashChange;
      await test.expect(page).toHaveURL(/#overview$/);
      await test.expect(q.heading("Nav", { level: 1 })).toBeVisible();
    });

    test("hides the example snippets from the header and keeps them hidden", async ({
      page,
      q,
    }) => {
      const snippets = page.locator("main article pre");
      const visibleSnippets = page.locator("main article pre:visible");
      const snippetCount = await snippets.count();
      test.expect(snippetCount).toBeGreaterThan(0);
      await test.expect(visibleSnippets).toHaveCount(snippetCount);

      const settings = query(q.radiogroup("Code snippets"));
      await settings.radio("Hide code snippets").click();
      await test.expect(settings.radio("Hide code snippets")).toBeChecked();
      await test.expect(visibleSnippets).toHaveCount(0);

      // The setting persists, and the shell restores it on the next load.
      await page.reload({ waitUntil: "load" });
      await waitForGalleryPage(page, "nav");
      await test.expect(settings.radio("Hide code snippets")).toBeChecked();
      await test.expect(visibleSnippets).toHaveCount(0);

      await settings.radio("Show code snippets").click();
      await test.expect(visibleSnippets).toHaveCount(snippetCount);
    });
  });

  test.describe("mobile", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("opens and dismisses the gallery navigation dialog", async ({
      page,
      q,
    }) => {
      const toggle = q.button("Open gallery sections");
      await test.expect(q.complementary("Gallery sections")).toBeHidden();
      await test.expect(toggle).toBeVisible();
      await toggle.click();
      const dialog = q.dialog("Gallery sections");
      await test.expect(dialog).toBeVisible();
      await test
        .expect(query(dialog).link("Nav", { exact: true }))
        .toHaveAttribute("aria-current", "page");

      await q.button("Close gallery sections").click();
      await test.expect(dialog).toBeHidden();
      await test.expect(toggle).toBeFocused();
      await toggle.click();
      await page.keyboard.press("Escape");
      await test.expect(dialog).toBeHidden();
      await test.expect(toggle).toBeFocused();

      // A link only changes the hash, so the dialog closes itself.
      await toggle.click();
      await query(dialog).link("Button", { exact: true }).click();
      await test.expect(page).toHaveURL(buttonPageUrl);
      await test.expect(q.heading("Button", { level: 1 })).toBeVisible();
      await test.expect(dialog).toBeHidden();
      await toggle.click();
      await test
        .expect(query(dialog).link("Button", { exact: true }))
        .toHaveAttribute("aria-current", "page");
    });
  });

  test.describe("mobile below the desktop breakpoint", () => {
    test.use({ viewport: { width: 767, height: 844 } });

    test("dismisses the mobile dialog when the gallery switches to desktop", async ({
      page,
      q,
    }) => {
      await test.expect(q.complementary("Gallery sections")).toBeHidden();
      await q.button("Open gallery sections").click();
      await test.expect(q.dialog("Gallery sections")).toBeVisible();

      await page.setViewportSize({ width: 768, height: 844 });
      await test.expect(q.dialog("Gallery sections")).toBeHidden();
      const sidebar = q.complementary("Gallery sections");
      await test.expect(sidebar).toBeVisible();
      await test.expect(q.button("Open gallery sections")).toBeHidden();
      await query(sidebar).link("Button", { exact: true }).click();
      await test.expect(page).toHaveURL(buttonPageUrl);
    });
  });
});

// Every page, including the overview and the regression fixture pages.
const routes = [
  { route: undefined, showcase: true },
  ...galleryPages.map((page) => ({
    route: page.id,
    showcase: page.kind === "showcase",
  })),
];

for (const { route, showcase } of routes) {
  withGalleryPage(route, async ({ test }) => {
    test("loads from its hash and has unique example titles", async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        errors.push(message.text());
      });
      // withGalleryPage opened the page from the overview before the listeners
      // existed. A reload loads the URL with the hash, where the server markup
      // and hydration must still agree, because only the client reads the hash.
      await page.reload({ waitUntil: "load" });
      await waitForGalleryPage(page, route);

      const titles = await page.locator("main article").evaluateAll((nodes) =>
        nodes.map((node) => {
          const id = node.getAttribute("aria-labelledby");
          const label = id ? node.ownerDocument.getElementById(id) : null;
          return label?.textContent?.trim() ?? "";
        }),
      );
      // Tests scope their queries with q.article(title), so a repeated or empty
      // title would make them ambiguous.
      test.expect(titles).not.toContain("");
      test.expect(new Set(titles).size).toBe(titles.length);

      // A showcase box's snippet names the knob the box is about, so two boxes
      // that print the same snippet either repeat an example or hide their
      // difference in a prop the snippet does not show. Fixture pages keep old
      // markup on purpose and are exempt.
      if (showcase) {
        const snippets = await page
          .locator("main article pre code")
          .allTextContents();
        const repeated = snippets.filter(
          (snippet, index) => snippets.indexOf(snippet) !== index,
        );
        test.expect(repeated).toEqual([]);
      }

      const hydrationErrors = errors.filter((error) =>
        /hydrat|did not match/i.test(error),
      );
      test.expect(hydrationErrors).toEqual([]);
    });
  });
}
