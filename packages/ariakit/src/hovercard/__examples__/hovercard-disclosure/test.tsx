import {
  click,
  focus,
  getByRole,
  hover,
  press,
  render,
  waitFor,
} from "ariakit-test-utils";
import Example from ".";

const getAnchor = () => getByRole("link", { name: "@ariakitjs" });
const getHovercard = () => getByRole("dialog", { hidden: true });
const getDisclosure = () =>
  getByRole("button", { name: "More details about @ariakitjs" });
const getFollowLink = () => getByRole("link", { name: "Follow" });

const waitForHovercardToShow = (timeout = 600) =>
  waitFor(expect(getHovercard()).toBeVisible, { timeout });

test("show hovercard on hover after timeout", async () => {
  render(<Example />);
  expect(getHovercard()).not.toBeVisible();
  await hover(getAnchor());
  expect(getHovercard()).not.toBeVisible();
  await waitForHovercardToShow();
});

test("do not show disclosure when focusing on anchor with mouse", async () => {
  render(<Example />);
  await focus(getAnchor());
  expect(getDisclosure()).toHaveStyle({ height: "1px" });
});

test("show disclosure when focusing on anchor with keyboard", async () => {
  render(<Example />);
  await press.Tab();
  expect(getDisclosure()).not.toHaveStyle({ height: "1px" });
});

test("tab to disclosure", async () => {
  render(<Example />);
  await press.ShiftTab();
  expect(getDisclosure()).toHaveFocus();
  expect(getDisclosure()).not.toHaveStyle({ height: "1px" });
});

test("show/hide hovercard on disclosure click", async () => {
  render(<Example />);
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
  render(<Example />);
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
  render(<Example />);
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
  render(<Example />);
  await press.Tab();
  await press.Tab();
  await press.Enter();
  expect(getHovercard()).toBeVisible();
  await press.Escape();
  expect(getHovercard()).not.toBeVisible();
  expect(getAnchor()).toHaveFocus();
});
