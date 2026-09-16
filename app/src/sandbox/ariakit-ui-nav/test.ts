import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

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
  expect(
    button.querySelector(":scope > .disclosure-button-slot"),
  ).toHaveTextContent("3");
  await click(button);
  expect(q.text("Update account pages")).toBeVisible();
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
