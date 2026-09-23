import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";
import {
  getClassTokens,
  getDisclosureParts,
} from "../ariakit-ui-disclosure/disclosure.test-helper.ts";

// https://github.com/ariakit/ariakit/issues/7553
test("renders every nav row without repeated or important gap classes", () => {
  const buttons = q.button
    .all()
    .filter((button) => button.parentElement?.matches(".nav-disclosure"));
  expect(buttons).not.toHaveLength(0);
  const rows: Element[] = [
    q.within(q.navigation("Command row")).button(/^Search/),
  ];
  for (const button of buttons) {
    const { root, body } = getDisclosureParts(button);
    rows.push(root, button, body);
  }
  for (const element of rows) {
    const tokens = getClassTokens(element);
    expect(tokens).toEqual([...new Set(tokens)]);
    expect(
      tokens.filter((token) => token.startsWith("gap-") && token.endsWith("!")),
    ).toEqual([]);
  }
});

// https://github.com/ariakit/ariakit/issues/7553
test("lets a nav disclosure override the defaults of its row", () => {
  const nav = q.within(q.navigation("Row overrides"));
  const { root: account } = getDisclosureParts(nav.button("Account"));
  const { root: settings } = getDisclosureParts(nav.button("Settings"));
  expect(account).toHaveClass("ak-frame-lg");
  expect(account).toHaveAttribute(
    "style",
    "--frame-padding: calc(var(--spacing) * (2)); --disclosure-gap: var(--nav-row-gap, calc(var(--spacing) * 3)); --disclosure-body-offset: var(--nav-gap, calc(var(--spacing) * 1));",
  );
  expect(settings).toHaveClass("ak-frame-none");
  expect(settings).not.toHaveClass("ak-frame-lg");
  expect(settings).toHaveAttribute(
    "style",
    "--frame-padding: calc(var(--spacing) * (2)); --disclosure-gap: var(--nav-row-gap, calc(var(--spacing) * 3)); --disclosure-body-offset: calc(var(--spacing) * (3));",
  );
});

// https://github.com/ariakit/ariakit/pull/7494#discussion_r3995263562
test("keeps a disclosure badge beside the label without a description", async () => {
  const button = q.button("Project pages 3");
  expect(
    Array.from(button.children).filter((child) => child.textContent === "3"),
  ).toHaveLength(1);
  const link = q.link("Manage project pages");
  await click(button);
  expect(link).not.toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/7494#discussion_r3998666934
test("keeps a disclosure badge beside a consumer label component with a description", async () => {
  const button = q.button("Team pages");
  expect(button).toHaveAttribute("aria-labelledby", "nav-pages-label");
  expect(button).toHaveAccessibleDescription("All pages in this workspace");
  expect(
    Array.from(button.children).filter((child) => child.textContent === "3"),
  ).toHaveLength(1);
  const link = q.link("Manage team pages");
  await click(button);
  expect(link).not.toBeVisible();
});

// https://github.com/ariakit/ariakit/pull/7494#discussion_r3998773048
test("keeps a bare fragment label separate from its description and badge", async () => {
  const button = q
    .within(q.article("Disclosure badges"))
    .button("Account pages");
  expect(button).toHaveAccessibleDescription("Manage account pages");
  // The chevron that leads the row is a slot too, so the badge is found by its
  // text.
  const badges = Array.from(
    button.querySelectorAll(":scope > .control-slot"),
  ).filter((slot) => slot.textContent === "3");
  expect(badges).toHaveLength(1);
  await click(button);
  expect(q.text("Update account pages")).toBeVisible();
});

test("names a link by its label and describes it by its description", () => {
  const nav = q.within(q.navigation("Link descriptions"));
  const link = nav.link("Workspace settings and preferences");
  expect(link).toHaveAttribute("href", "#settings");
  expect(link).toHaveAccessibleDescription("Members and billing");
});

test("keeps anchor props, events, and refs on a wrapped link", async () => {
  const nav = q.within(q.navigation("Link wrappers"));
  const link = nav.link("Project overview");
  expect(nav.listitem.all()).toHaveLength(3);
  expect(link).toHaveAttribute("href", "#overview");
  expect(link).toHaveAttribute("title", "Overview destination");
  expect(link).toHaveClass("project-link");
  expect(link.parentElement).toHaveClass("project-item");
  expect(nav.link("Project activity").parentElement).toHaveClass("custom-item");
  expect(nav.link("Project members").parentElement?.tagName).toBe("LI");
  await click(q.button("Focus project overview"));
  expect(link).toHaveFocus();
  await click(link);
  expect(q.text("Last activated element: A")).toBeVisible();
  expect(q.within(q.navigation("Single link")).listitem.all()).toHaveLength(0);
});
