import { click, press, q, type } from "@ariakit/test";

const backdrop = () => {
  const dialog = q.dialog();
  const id = dialog?.id;
  const backdrop = document.querySelector(`[data-backdrop="${id}"]`);
  expect(backdrop).toBeInTheDocument();
  return backdrop!;
};

test("open/hide dialog without filling in the form", async () => {
  await click(q.button("Post"));
  expect(q.dialog("Post")).toBeVisible();
  expect(q.textbox()).toHaveFocus();
  await click(q.button("Dismiss popup"));
  expect(q.dialog("Post")).not.toBeInTheDocument();
});

test("try to hide the dialog with Escape after filling in the form", async () => {
  await click(q.button("Post"));
  await type("Hello");
  await press.Escape();
  expect(q.dialog.includesHidden("Post")).toBeVisible();
  expect(q.dialog("Post")).not.toBeInTheDocument();
  expect(q.dialog("Save post?")).toBeVisible();
  expect(q.button("Save")).toHaveFocus();
  await press.Escape();
  expect(q.dialog("Save post?")).not.toBeInTheDocument();
  expect(q.dialog("Post")).toBeVisible();
  expect(q.textbox()).toHaveFocus();
  await press.Escape();
  expect(q.dialog.includesHidden("Post")).toBeVisible();
  expect(q.dialog("Post")).not.toBeInTheDocument();
  expect(q.dialog("Save post?")).toBeVisible();
  expect(q.button("Save")).toHaveFocus();
  await press.Enter();
  expect(q.dialog("Post")).not.toBeInTheDocument();
  expect(q.dialog("Save post?")).not.toBeInTheDocument();
  expect(q.button("Post")).toHaveFocus();
});

test("try to hide the dialog by clicking outside after filling in the form", async () => {
  await click(q.button("Post"));
  await type("Hello");
  await click(backdrop());
  expect(q.dialog.includesHidden("Post")).toBeVisible();
  expect(q.dialog("Post")).not.toBeInTheDocument();
  expect(q.dialog("Save post?")).toBeVisible();
  expect(q.button("Save")).toHaveFocus();
  await click(backdrop());
  expect(q.dialog("Save post?")).not.toBeInTheDocument();
  expect(q.dialog("Post")).toBeVisible();
  expect(q.textbox()).toHaveFocus();
  await click(backdrop());
  expect(q.dialog.includesHidden("Post")).toBeVisible();
  expect(q.dialog("Post")).not.toBeInTheDocument();
  expect(q.dialog("Save post?")).toBeVisible();
  expect(q.button("Save")).toHaveFocus();
  await click(q.button("Save"));
  expect(q.dialog("Post")).not.toBeInTheDocument();
  expect(q.dialog("Save post?")).not.toBeInTheDocument();
  expect(q.button("Post")).toHaveFocus();
});

test("try to hide the dialog by clicking on the dismiss button after filling in the form", async () => {
  await click(q.button("Post"));
  await type("Hello");
  await click(q.button("Dismiss popup"));
  expect(q.dialog.includesHidden("Post")).toBeVisible();
  expect(q.dialog("Post")).not.toBeInTheDocument();
  expect(q.dialog("Save post?")).toBeVisible();
  expect(q.button("Save")).toHaveFocus();
  await click(backdrop());
  expect(q.textbox()).toHaveFocus();
  await click(q.button("Post"));
  expect(q.dialog("Post")).not.toBeInTheDocument();
  expect(q.button("Post")).toHaveFocus();
});
