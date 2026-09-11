import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { DialogExamples } from "./pages/dialog.react.tsx";

mountExamples(DialogExamples);

test("moves focus into the dialog and back to its disclosure on Escape", async () => {
  const disclosure = q.button("View receipt");
  await click(disclosure);
  const dialog = q.dialog("Success");
  expect(dialog).toBeVisible();
  expect(q.within(dialog).button("OK")).toHaveFocus();
  await press.Escape();
  expect(q.dialog.maybe("Success")).not.toBeInTheDocument();
  expect(disclosure).toHaveFocus();
});

test("names a dismiss without children and closes the dialog with it", async () => {
  await click(q.button("Invite member"));
  const dialog = q.dialog("Invite sent");
  await click(q.within(dialog).button("Dismiss popup"));
  expect(q.dialog.maybe("Invite sent")).not.toBeInTheDocument();
  expect(q.button("Invite member")).toHaveFocus();
});

test("submits the form and closes the dialog with the new name", async () => {
  const box = q.within(q.article("Form"));
  expect(box.text("Current name: Ariakit UI")).toBeInTheDocument();
  await click(box.button("Rename project"));
  const dialog = q.within(q.dialog("Rename project"));
  const field = dialog.textbox("Project name");
  expect(field).toHaveFocus();
  await type("\b".repeat("Ariakit UI".length));
  await type("Ariakit Docs");
  await click(dialog.button("Save"));
  expect(q.dialog.maybe("Rename project")).not.toBeInTheDocument();
  expect(box.text("Current name: Ariakit Docs")).toBeInTheDocument();
});

test("closes the nested dialog first on Escape", async () => {
  const disclosure = q.button("Project settings");
  await click(disclosure);
  const outer = q.dialog("Project settings");
  const innerDisclosure = q.within(outer).button("Delete project");
  await click(innerDisclosure);
  expect(q.dialog("Delete project?")).toBeVisible();

  await press.Escape();
  expect(q.dialog.maybe("Delete project?")).not.toBeInTheDocument();
  expect(q.dialog("Project settings")).toBeVisible();
  expect(innerDisclosure).toHaveFocus();

  await press.Escape();
  expect(q.dialog.maybe("Project settings")).not.toBeInTheDocument();
  expect(disclosure).toHaveFocus();
});
