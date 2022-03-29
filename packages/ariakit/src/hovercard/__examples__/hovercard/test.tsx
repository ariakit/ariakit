import {
  click,
  getByRole,
  hover,
  press,
  render,
  sleep,
  waitFor,
} from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

const getAnchor = () => getByRole("link", { name: "@ariakitjs" });
const getHovercard = () => getByRole("dialog", { hidden: true });

const waitForHovercardToShow = (timeout = 600) =>
  waitFor(expect(getHovercard()).toBeVisible, { timeout });

const waitForHovercardToHide = (timeout = 600) =>
  waitFor(expect(getHovercard()).not.toBeVisible, { timeout });

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("show hovercard on hover after timeout", async () => {
  render(<Example />);
  expect(getHovercard()).not.toBeVisible();
  await hover(getAnchor());
  expect(getHovercard()).not.toBeVisible();
  await waitForHovercardToShow();
});

test("hide hovercard on hover outside after timeout", async () => {
  const { baseElement } = render(<Example />);
  await hover(getAnchor());
  await waitForHovercardToShow();
  await hover(baseElement);
  expect(getHovercard()).toBeVisible();
  await waitForHovercardToHide();
});

test("keep hovercard visible when it has focus", async () => {
  const { baseElement } = render(<Example />);
  await hover(getAnchor());
  await waitForHovercardToShow();
  await click(getHovercard());
  await hover(baseElement);
  await sleep(600);
  await expect(getHovercard()).toBeVisible();
});

test("keep hovercard visible when hovering out and in quickly", async () => {
  const { baseElement } = render(<Example />);
  await hover(getAnchor());
  await waitForHovercardToShow();
  await hover(baseElement);
  await sleep(200);
  await hover(getAnchor());
  await expect(getHovercard()).toBeVisible();
  await hover(baseElement);
  await sleep(200);
  await hover(getHovercard());
  await sleep(600);
  await expect(getHovercard()).toBeVisible();
});

test("hide unfocused hovercard on escape", async () => {
  render(<Example />);
  await hover(getAnchor());
  await waitForHovercardToShow();
  await sleep();
  await press.Escape();
  expect(getHovercard()).not.toBeVisible();
  expect(getAnchor()).not.toHaveFocus();
});

test("hide focused hovercard on escape", async () => {
  render(<Example />);
  await hover(getAnchor());
  await waitForHovercardToShow();
  await click(getHovercard());
  await press.Escape();
  expect(getHovercard()).not.toBeVisible();
  expect(getAnchor()).toHaveFocus();
});
