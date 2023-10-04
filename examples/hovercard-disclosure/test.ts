import { click, focus, hover, press, q, waitFor } from "@ariakit/test";

const waitForHovercardToShow = (timeout = 600) =>
  waitFor(() => expect(q.dialog()).toBeVisible(), { timeout });

const expectDisclosureToBeHidden = () =>
  expect(q.button(/^More details/)).toHaveStyle({ height: "1px" });

const expectDisclosureToBeVisible = () =>
  expect(q.button(/^More details/)).not.toHaveStyle({ height: "1px" });

test("show hovercard on hover after timeout", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await hover(q.link("@ariakitjs"));
  expect(q.dialog()).not.toBeInTheDocument();
  await waitForHovercardToShow();
});

test("do not show disclosure when focusing on anchor with mouse", async () => {
  await click(document.body);
  await focus(q.link("@ariakitjs"));
  expectDisclosureToBeHidden();
});

test("show disclosure when focusing on anchor with keyboard", async () => {
  expectDisclosureToBeHidden();
  await press.Tab();
  expectDisclosureToBeVisible();
});

test("tab to disclosure", async () => {
  await press.ShiftTab();
  expect(q.button(/^More details/)).toHaveFocus();
  expect(q.button(/^More details/)).not.toHaveStyle({ height: "1px" });
});

test("show/hide hovercard on disclosure click", async () => {
  await press.Tab();
  expect(q.dialog()).not.toBeInTheDocument();
  await click(q.button(/^More details/));
  expect(q.dialog()).toBeVisible();
  expect(q.link("Follow")).toHaveFocus();
  await click(q.button(/^More details/));
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button(/^More details/)).toHaveFocus();
});

test("show/hide hovercard on disclosure enter", async () => {
  await press.Tab();
  await press.Tab();
  expect(q.dialog()).not.toBeInTheDocument();
  await press.Enter();
  expect(q.dialog()).toBeVisible();
  expect(q.link("Follow")).toHaveFocus();
  await press.ShiftTab();
  await press.Enter();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button(/^More details/)).toHaveFocus();
});

test("show/hide hovercard on disclosure space", async () => {
  await press.Tab();
  await press.Tab();
  expect(q.dialog()).not.toBeInTheDocument();
  await press.Space();
  expect(q.dialog()).toBeVisible();
  expect(q.link("Follow")).toHaveFocus();
  await press.ShiftTab();
  await press.Space();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button(/^More details/)).toHaveFocus();
});

test("hide hovercard on escape", async () => {
  await press.Tab();
  await press.Tab();
  await press.Enter();
  expect(q.dialog()).toBeVisible();
  await press.Escape();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.link("@ariakitjs")).toHaveFocus();
});

test("do not autofocus hovercard on anchor hover after showing and hiding it using the disclosure button", async () => {
  await press.Tab();
  await press.Tab();
  await press.Enter();
  await press.Escape();
  await hover(q.link("@ariakitjs"));
  await waitFor(() => expect(q.dialog()).toBeVisible());
  expect(q.link("@ariakitjs")).toHaveFocus();
});

test("hide hovercard on blur", async () => {
  const div = document.createElement("div");
  div.tabIndex = 0;
  document.body.append(div);

  expectDisclosureToBeHidden();
  await press.Tab();
  expectDisclosureToBeVisible();
  await press.Tab();
  expectDisclosureToBeVisible();
  await press.Tab();
  expectDisclosureToBeHidden();
  await press.ShiftTab();
  expectDisclosureToBeVisible();
  await press.ShiftTab();
  expectDisclosureToBeVisible();

  div.remove();
});
