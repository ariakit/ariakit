import { click, hover, press, q, sleep, waitFor } from "@ariakit/test";

const waitForHovercardToShow = (timeout = 600) =>
  waitFor(() => expect(q.dialog()).toBeVisible(), { timeout });

const waitForHovercardToHide = (timeout = 600) =>
  waitFor(() => expect(q.dialog()).not.toBeInTheDocument(), { timeout });

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
};

test("show hovercard on hover after timeout", async () => {
  expect(q.dialog()).not.toBeInTheDocument();
  await hover(q.link("@ariakitjs"));
  expect(q.dialog()).not.toBeInTheDocument();
  await waitForHovercardToShow();
});

test("hide hovercard on hover outside after timeout", async () => {
  await hover(q.link("@ariakitjs"));
  await waitForHovercardToShow();
  await hoverOutside();
  expect(q.dialog()).toBeVisible();
  await waitForHovercardToHide();
});

test("keep hovercard open when it has focus", async () => {
  await hover(q.link("@ariakitjs"));
  await waitForHovercardToShow();
  await click(q.dialog());
  await hoverOutside();
  await sleep(600);
  expect(q.dialog()).toBeVisible();
});

test("keep hovercard open when hovering out and in quickly", async () => {
  await hover(q.link("@ariakitjs"));
  await waitForHovercardToShow();
  await hoverOutside();
  await sleep(200);
  await hover(q.link("@ariakitjs"));
  expect(q.dialog()).toBeVisible();
  await hoverOutside();
  await sleep(200);
  await hover(q.dialog());
  await sleep(600);
  expect(q.dialog()).toBeVisible();
});

test("hide unfocused hovercard on escape", async () => {
  await hover(q.link("@ariakitjs"));
  await waitForHovercardToShow();
  await sleep();
  await press.Escape();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.link("@ariakitjs")).not.toHaveFocus();
});

test("hide focused hovercard on escape", async () => {
  await hover(q.link("@ariakitjs"));
  await waitForHovercardToShow();
  await click(q.dialog());
  await press.Escape();
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.link("@ariakitjs")).toHaveFocus();
});
