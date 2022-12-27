import {
  click,
  getByRole,
  hover,
  press,
  render,
  sleep,
  waitFor,
} from "@ariakit/test";
import Example from ".";

const getAnchor = () => getByRole("link", { name: "@ariakitjs" });
const getHovercard = () => getByRole("dialog", { hidden: true });

const waitForHovercardToShow = (timeout = 600) =>
  waitFor(expect(getHovercard()).toBeVisible, { timeout });

const waitForHovercardToHide = (timeout = 600) =>
  waitFor(expect(getHovercard()).not.toBeVisible, { timeout });

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
};

test("show hovercard on hover after timeout", async () => {
  render(<Example />);
  expect(getHovercard()).not.toBeVisible();
  await hover(getAnchor());
  expect(getHovercard()).not.toBeVisible();
  await waitForHovercardToShow();
});

test("hide hovercard on hover outside after timeout", async () => {
  render(<Example />);
  await hover(getAnchor());
  await waitForHovercardToShow();
  await hoverOutside();
  expect(getHovercard()).toBeVisible();
  await waitForHovercardToHide();
});

test("keep hovercard open when it has focus", async () => {
  render(<Example />);
  await hover(getAnchor());
  await waitForHovercardToShow();
  await click(getHovercard());
  await hoverOutside();
  await sleep(600);
  await expect(getHovercard()).toBeVisible();
});

test("keep hovercard open when hovering out and in quickly", async () => {
  render(<Example />);
  await hover(getAnchor());
  await waitForHovercardToShow();
  await hoverOutside();
  await sleep(200);
  await hover(getAnchor());
  await expect(getHovercard()).toBeVisible();
  await hoverOutside();
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
