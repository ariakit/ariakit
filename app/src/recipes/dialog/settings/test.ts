import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("moves between sections and saves", async () => {
  const disclosure = q.button("Open settings");
  await click(disclosure);
  const dialog = q.dialog("Settings");
  expect(q.within(dialog).group("Workspace")).toBeInTheDocument();
  expect(q.within(dialog).group("Account")).toBeInTheDocument();
  expect(q.within(dialog).heading("General")).toBeInTheDocument();
  await click(q.within(dialog).link("Members"));
  expect(q.within(dialog).heading("Members")).toBeInTheDocument();
  expect(q.within(dialog).link("Members")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await click(q.within(dialog).button("Save changes"));
  expect(dialog).not.toBeVisible();
  expect(q.status()).toHaveTextContent("Settings saved");
  expect(disclosure).toHaveFocus();
});

test("closes on Escape without saving", async () => {
  const disclosure = q.button("Open settings");
  await click(disclosure);
  const dialog = q.dialog("Settings");
  await press.Escape();
  expect(dialog).not.toBeVisible();
  expect(q.status()).toHaveTextContent("");
  expect(disclosure).toHaveFocus();
});
