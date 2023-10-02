import { click, press, q } from "@ariakit/test";

const backdrop = () => {
  const dialog = q.dialog();
  const id = dialog?.id;
  const backdrop = document.querySelector(`[data-backdrop="${id}"]`);
  expect(backdrop).toBeInTheDocument();
  return backdrop!;
};

test("show dialog", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await click(q.button("View recipe"));
  expect(q.dialog()).toBeVisible();
});

test("show/hide menu", async () => {
  expect(q.menu()).not.toBeInTheDocument();
  await click(q.button("View recipe"));
  await click(q.button("Share"));
  expect(q.menu()).toBeVisible();
  expect(q.menu()).toHaveFocus();
  await click(q.button("Share"));
  expect(q.menu()).not.toBeInTheDocument();
  await click(q.button("Share"));
  expect(q.menu()).toBeVisible();
  expect(q.menu()).toHaveFocus();
});

test("hide menu and dialog with esc", async () => {
  await click(q.button("View recipe"));
  await click(q.button("Share"));
  expect(q.dialog()).toBeVisible();
  expect(q.menu()).toBeVisible();
  await press.Escape();
  expect(q.dialog()).toBeVisible();
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("Share")).toHaveFocus();
  await press.Escape();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button("View recipe")).toHaveFocus();
});

test("hide menu by clicking on dialog", async () => {
  await click(q.button("View recipe"));
  await click(q.button("Share"));
  expect(q.dialog()).toBeVisible();
  expect(q.menu()).toBeVisible();
  await click(q.dialog()!);
  expect(q.dialog()).toBeVisible();
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.dialog()).toHaveFocus();
});

test("hide both menu and dialog by clicking outside dialog", async () => {
  await click(q.button("View recipe"));
  await click(q.button("Share"));
  expect(q.dialog()).toBeVisible();
  expect(q.menu()).toBeVisible();
  await click(backdrop());
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.menu()).not.toBeInTheDocument();
  expect(q.button("View recipe")).toHaveFocus();
});
