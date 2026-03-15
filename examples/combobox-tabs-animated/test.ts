import { click, press, q, sleep, waitFor } from "@ariakit/test";

test("selected tab is restored only after the animation ends", async () => {
  await click(q.combobox());
  expect(await q.dialog.wait("Pages")).toBeVisible();
  await press.ArrowDown();
  await press.ArrowRight();
  const examplesTab = q.tab("Examples31");
  expect(examplesTab).toHaveFocus();
  expect(examplesTab).toHaveAttribute("data-active-item");
  expect(examplesTab).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Examples31")).toBeVisible();
  await press.Escape();
  expect(q.combobox()).toHaveAttribute("data-active-item");
  expect(examplesTab).not.toHaveFocus();
  expect(examplesTab).not.toHaveAttribute("data-active-item");
  expect(examplesTab).toHaveAttribute("aria-selected", "true");
  await waitFor(() => expect(q.dialog("Pages")).not.toBeInTheDocument());
  await press.ArrowDown();
  await press.ArrowDown();
  const componentsTab = q.tab("Components16");
  expect(componentsTab).toHaveFocus();
  expect(componentsTab).toHaveAttribute("data-active-item");
  expect(componentsTab).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Components16")).toBeVisible();
});

test("can re-open the dialog with arrow down while the animation is running", async () => {
  await click(q.combobox());
  expect(await q.dialog.wait("Pages")).toBeVisible();
  await press.ArrowDown();
  await press.ArrowRight();
  await press.Escape();
  expect(q.combobox()).toHaveAttribute("data-active-item");
  await sleep(200);
  await press.ArrowDown();
  expect(q.dialog("Pages")).toBeVisible();
  const examplesTab = q.tab("Examples31");
  expect(examplesTab).not.toHaveFocus();
  expect(examplesTab).not.toHaveAttribute("data-active-item");
  expect(examplesTab).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Examples31")).toBeVisible();
  await sleep(1000);
  expect(q.dialog("Pages")).toBeVisible();
  expect(q.tabpanel("Examples31")).toBeVisible();
  expect(examplesTab).not.toHaveFocus();
  expect(examplesTab).not.toHaveAttribute("data-active-item");
  expect(examplesTab).toHaveAttribute("aria-selected", "true");
});
