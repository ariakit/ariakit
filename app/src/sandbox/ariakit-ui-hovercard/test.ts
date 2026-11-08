import { click, focus, hover, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

// How long Ariakit waits before a hovercard shows.
const SHOW_TIMEOUT = 500;

test("closes the hovercard on Escape", async () => {
  const section = q.within(q.region("Single"));
  await hover(section.link("Kai Tanaka"));
  await expect.poll(q.dialog.maybe.lazy("Kai Tanaka")).toBeVisible();
  await press.Escape();
  await expect.poll(q.dialog.maybe.lazy("Kai Tanaka")).not.toBeInTheDocument();
});

test("closes the hovercard with the dismiss button", async () => {
  const section = q.within(q.region("Single"));
  await hover(section.link("Kai Tanaka"));
  await expect.poll(q.dialog.maybe.lazy("Kai Tanaka")).toBeVisible();
  await click(q.within(q.dialog("Kai Tanaka")).button("Dismiss popup"));
  await expect.poll(q.dialog.maybe.lazy("Kai Tanaka")).not.toBeInTheDocument();
});

test("doesn't open the hovercard on focus", async () => {
  const section = q.within(q.region("Shared"));
  await focus(section.link("Kai Tanaka"));
  await press.Tab();
  expect(section.link("Noor Haddad")).toHaveFocus();
  // No state tracks a hovercard that doesn't show, so the test crosses the show
  // timeout before it checks.
  await sleep(SHOW_TIMEOUT);
  // Focus doesn't move the anchor of the shared hovercard, so a hovercard that
  // opened anyway would show another person.
  expect(q.dialog.maybe()).not.toBeInTheDocument();
});

test("opens the hovercard from the keyboard with the disclosure", async () => {
  // Tab gives the anchor keyboard focus, which shows the disclosure after it.
  await focus(q.within(q.region("Shared")).link("Lena Fischer"));
  await press.Tab();
  const section = q.within(q.region("Disclosure"));
  expect(section.link("Noor Haddad")).toHaveFocus();
  await press.Tab();
  expect(section.button("More details about Noor Haddad")).toHaveFocus();
  await press.Enter();
  await expect.poll(q.dialog.maybe.lazy("Noor Haddad")).toBeVisible();
});

test("names a disclosure without children", async () => {
  const section = q.within(q.region("Single"));
  await focus(section.link("Kai Tanaka"));
  await press.Tab();
  expect(section.button("More details")).toHaveFocus();
});
