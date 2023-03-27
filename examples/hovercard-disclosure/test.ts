import { click, focus, getByRole, hover, press, waitFor } from "@ariakit/test";

const getAnchor = () => getByRole("link", { name: "@ariakitjs" });
const getHovercard = () => getByRole("dialog", { hidden: true });
const getDisclosure = () =>
  getByRole("button", { name: "More details about @ariakitjs" });
const getFollowLink = () => getByRole("link", { name: "Follow" });

const waitForHovercardToShow = (timeout = 600) =>
  waitFor(() => expect(getHovercard()).toBeVisible(), { timeout });

const expectDisclosureToBeHidden = () =>
  expect(getDisclosure()).toHaveStyle({ height: "1px" });

const expectDisclosureToBeVisible = () =>
  expect(getDisclosure()).not.toHaveStyle({ height: "1px" });

test("show hovercard on hover after timeout", async () => {
  expect(getHovercard()).not.toBeVisible();
  await hover(getAnchor());
  expect(getHovercard()).not.toBeVisible();
  await waitForHovercardToShow();
});

test("do not show disclosure when focusing on anchor with mouse", async () => {
  await click(document.body);
  await focus(getAnchor());
  expectDisclosureToBeHidden();
});

test("show disclosure when focusing on anchor with keyboard", async () => {
  expectDisclosureToBeHidden();
  await press.Tab();
  expectDisclosureToBeVisible();
});

test("tab to disclosure", async () => {
  await press.ShiftTab();
  expect(getDisclosure()).toHaveFocus();
  expect(getDisclosure()).not.toHaveStyle({ height: "1px" });
});

test("show/hide hovercard on disclosure click", async () => {
  await press.Tab();
  expect(getHovercard()).not.toBeVisible();
  await click(getDisclosure());
  expect(getHovercard()).toBeVisible();
  expect(getFollowLink()).toHaveFocus();
  await click(getDisclosure());
  expect(getHovercard()).not.toBeVisible();
  expect(getDisclosure()).toHaveFocus();
});

test("show/hide hovercard on disclosure enter", async () => {
  await press.Tab();
  await press.Tab();
  expect(getHovercard()).not.toBeVisible();
  await press.Enter();
  expect(getHovercard()).toBeVisible();
  expect(getFollowLink()).toHaveFocus();
  await press.ShiftTab();
  await press.Enter();
  expect(getHovercard()).not.toBeVisible();
  expect(getDisclosure()).toHaveFocus();
});

test("show/hide hovercard on disclosure space", async () => {
  await press.Tab();
  await press.Tab();
  expect(getHovercard()).not.toBeVisible();
  await press.Space();
  expect(getHovercard()).toBeVisible();
  expect(getFollowLink()).toHaveFocus();
  await press.ShiftTab();
  await press.Space();
  expect(getHovercard()).not.toBeVisible();
  expect(getDisclosure()).toHaveFocus();
});

test("hide hovercard on escape", async () => {
  await press.Tab();
  await press.Tab();
  await press.Enter();
  expect(getHovercard()).toBeVisible();
  await press.Escape();
  expect(getHovercard()).not.toBeVisible();
  expect(getAnchor()).toHaveFocus();
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
