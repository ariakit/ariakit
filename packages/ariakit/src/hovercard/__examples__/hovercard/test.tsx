import {
  act,
  click,
  getByRole,
  hover,
  render,
  waitFor,
} from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

const sleep = (timeout = 1000) =>
  act(() => new Promise((resolve) => setTimeout(resolve, timeout)));

const getAnchor = () => getByRole("link", { name: "@A11YProject" });
const getHovercard = () => getByRole("dialog", { hidden: true });

const waitForHovercardToShow = (timeout = 1000) =>
  waitFor(expect(getHovercard()).toBeVisible, { timeout });

const waitForHovercardToHide = (timeout = 1000) =>
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
  await sleep();
  await expect(getHovercard()).toBeVisible();
});

test("keep hovercard visible when hovering out and in quickly", async () => {
  const { baseElement } = render(<Example />);
  await hover(getAnchor());
  await waitForHovercardToShow();
  await hover(baseElement);
  await sleep(400);
  await hover(getAnchor());
  await expect(getHovercard()).toBeVisible();
  await hover(baseElement);
  await sleep(400);
  await hover(getHovercard());
  await sleep();
  await expect(getHovercard()).toBeVisible();
});
