import { click, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/5179
test("lets a child handle Escape before the dialog", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();
  expect(q.combobox("Search")).toHaveFocus();
  expect(q.listbox("Suggestions")).toBeVisible();

  await press.Escape();

  expect(q.listbox.maybe("Suggestions")).not.toBeInTheDocument();
  expect(q.dialog("Dialog")).toBeVisible();

  await press.Escape();

  expect(q.dialog.maybe("Dialog")).not.toBeInTheDocument();
});

test.each(["Ariakit Portal", "React portal"])(
  "lets a %s child handle Escape before the dialog",
  async (portal) => {
    const dialogName = `${portal} child dialog`;
    await click(q.button(`Open ${dialogName.toLowerCase()}`));
    const input = q.combobox("Search");
    expect(q.dialog(dialogName)).toBeVisible();
    expect(q.listbox("Suggestions")).toBeVisible();

    await focus(input);
    expect(input).toHaveFocus();
    expect(q.dialog(dialogName)).toBeVisible();

    await press.Escape(input);

    expect(q.listbox.maybe("Suggestions")).not.toBeInTheDocument();
    expect(q.dialog(dialogName)).toBeVisible();

    await press.Escape(input);

    expect(q.dialog.maybe(dialogName)).not.toBeInTheDocument();
  },
);

test("lets an ancestor capture handler own Escape", async () => {
  await click(q.button("Open outer capture dialog"));
  const dialog = q.dialog("Outer capture dialog");
  const input = q.within(dialog).combobox("Search");
  const listbox = q.within(dialog).listbox("Suggestions");

  expect(dialog).toBeVisible();
  expect(input).toHaveFocus();
  expect(listbox).toBeVisible();

  await press.Escape(input);

  expect(listbox).toBeVisible();
  expect(dialog).toBeVisible();
});

test("closes on an unclaimed Escape outside the dialog", async () => {
  const disclosure = q.button("Open outside dialog");
  await click(disclosure);
  expect(q.dialog("Outside dialog")).toBeVisible();

  await focus(disclosure);
  await press.Escape(disclosure);

  expect(q.dialog.maybe("Outside dialog")).not.toBeInTheDocument();
});

test("lets an ancestor capture handler own Escape outside the dialog", async () => {
  const disclosure = q.button("Open outer capture dialog");
  await click(disclosure);
  expect(q.dialog("Outer capture dialog")).toBeVisible();

  await focus(disclosure);
  await press.Escape(disclosure);

  expect(q.dialog("Outer capture dialog")).toBeVisible();
});

test("hides after its own bubble handler stops Escape", async () => {
  await click(q.button("Open own bubble dialog"));
  expect(q.dialog("Own bubble dialog")).toBeVisible();

  await press.Escape();

  expect(q.listbox.maybe("Suggestions")).not.toBeInTheDocument();
  expect(q.dialog("Own bubble dialog")).toBeVisible();

  await press.Escape();

  expect(q.dialog.maybe("Own bubble dialog")).not.toBeInTheDocument();
});

test("hides after its own capture handler stops Escape", async () => {
  await click(q.button("Open own capture dialog"));
  expect(q.dialog("Own capture dialog")).toBeVisible();

  await press.Escape(q.combobox("Search"));

  expect(q.dialog.maybe("Own capture dialog")).not.toBeInTheDocument();
});

test("stops Escape before a third-party dialog bubble handler", async () => {
  await click(q.button("Open third-party dialog"));
  await click(q.button("Open nested ariakit dialog"));
  expect(q.dialog("Third-party dialog")).toBeVisible();
  expect(q.dialog("Nested Ariakit dialog")).toBeVisible();

  await press.Escape(q.button("Inside nested ariakit dialog"));

  expect(q.dialog.maybe("Nested Ariakit dialog")).not.toBeInTheDocument();
  expect(q.dialog("Third-party dialog")).toBeVisible();
});

test("can stop Escape before a third-party dialog capture handler", async () => {
  await click(q.button("Open capture third-party dialog"));
  await click(q.button("Open shielded ariakit dialog"));
  expect(q.dialog("Capture third-party dialog")).toBeVisible();
  expect(q.dialog("Shielded Ariakit dialog")).toBeVisible();

  await press.Escape(q.button("Inside shielded ariakit dialog"));

  expect(q.dialog.maybe("Shielded Ariakit dialog")).not.toBeInTheDocument();
  expect(q.dialog("Capture third-party dialog")).toBeVisible();
});

test("calls a rejected hideOnEscape callback once", async () => {
  await click(q.button("Open rejected callback dialog"));
  const dialog = q.dialog("Rejected callback dialog");
  const button = q.within(dialog).button("Callback calls: 0");
  expect(dialog).toBeVisible();

  await press.Escape(button);

  expect(dialog).toBeVisible();
  expect(q.within(dialog).button("Callback calls: 1")).toBeVisible();
});

test("calls an accepted hideOnEscape callback once", async () => {
  const disclosure = q.button("Open accepted callback dialog");
  await click(disclosure);
  const dialog = q.dialog("Accepted callback dialog");
  const button = q.within(dialog).button("Callback calls: 0");
  expect(dialog).toBeVisible();

  await press.Escape(button);

  expect(dialog).not.toBeVisible();
  await click(disclosure);
  expect(q.within(dialog).button("Callback calls: 1")).toBeVisible();
});

test("accepts default prevention from hideOnEscape", async () => {
  await click(q.button("Open prevented callback dialog"));
  const dialog = q.dialog("Prevented callback dialog");
  const button = q.within(dialog).button("Callback calls: 0");
  expect(dialog).toBeVisible();

  await press.Escape(button);

  expect(dialog).not.toBeVisible();
});

test("hides when hideOnEscape stops Escape from a React portal", async () => {
  await click(q.button("Open react portal callback dialog"));
  const dialog = q.dialog("React portal callback dialog");
  const button = q.button("Callback calls: 0");
  expect(dialog).toBeVisible();

  await focus(button);
  await press.Escape(button);

  expect(dialog).not.toBeVisible();
});
