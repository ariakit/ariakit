import { click, press, q, sleep, waitFor } from "@ariakit/test";

function pageDialog() {
  return q.within(q.dialog("Pages"));
}

test("selected tab is restored only after the animation ends", async () => {
  await click(q.combobox());
  expect(await q.dialog.wait("Pages")).toBeVisible();
  const dialog = pageDialog();
  await press.ArrowDown();
  await press.ArrowRight();
  expect(dialog.tab("Examples 31")).toHaveFocus();
  expect(dialog.tab("Examples 31")).toHaveAttribute("data-active-item");
  expect(dialog.tab("Examples 31")).toHaveAttribute("aria-selected", "true");
  expect(dialog.tabpanel("Examples 31")).toBeVisible();
  await press.Escape();
  expect(q.combobox()).toHaveAttribute("data-active-item");
  expect(dialog.tab("Examples 31")).not.toHaveFocus();
  expect(dialog.tab("Examples 31")).not.toHaveAttribute("data-active-item");
  expect(dialog.tab("Examples 31")).toHaveAttribute("aria-selected", "true");
  await waitFor(() => expect(q.dialog("Pages")).not.toBeInTheDocument());
  await press.ArrowDown();
  await press.ArrowDown();
  expect(pageDialog().tab("Components 16")).toHaveFocus();
  expect(pageDialog().tab("Components 16")).toHaveAttribute("data-active-item");
  expect(pageDialog().tab("Components 16")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(pageDialog().tabpanel("Components 16")).toBeVisible();
});

test("can re-open the dialog with arrow down while the animation is running", async () => {
  await click(q.combobox());
  expect(await q.dialog.wait("Pages")).toBeVisible();
  const dialog = pageDialog();
  await press.ArrowDown();
  await press.ArrowRight();
  await press.Escape();
  expect(q.combobox()).toHaveAttribute("data-active-item");
  await sleep(200);
  await press.ArrowDown();
  expect(q.dialog("Pages")).toBeVisible();
  expect(dialog.tab("Examples 31")).not.toHaveFocus();
  expect(dialog.tab("Examples 31")).not.toHaveAttribute("data-active-item");
  expect(dialog.tab("Examples 31")).toHaveAttribute("aria-selected", "true");
  expect(dialog.tabpanel("Examples 31")).toBeVisible();
  await sleep(1000);
  expect(q.dialog("Pages")).toBeVisible();
  expect(pageDialog().tabpanel("Examples 31")).toBeVisible();
  expect(pageDialog().tab("Examples 31")).not.toHaveFocus();
  expect(pageDialog().tab("Examples 31")).not.toHaveAttribute(
    "data-active-item",
  );
  expect(pageDialog().tab("Examples 31")).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
