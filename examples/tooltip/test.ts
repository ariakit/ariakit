import { click, getByRole, hover, press, waitFor } from "@ariakit/test";

const getTooltip = () => getByRole("tooltip", { hidden: true });

const waitForTooltipToShow = () =>
  waitFor(() => expect(getTooltip()).toBeVisible());

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
  await hover(document.body, { clientX: 20, clientY: 20 });
};

test("show tooltip on hover", async () => {
  expect(getTooltip()).not.toBeVisible();
  await hover(getByRole("button"));
  await waitForTooltipToShow();
  await hoverOutside();
  expect(getTooltip()).not.toBeVisible();
});

test("do not hide tooltip on click", async () => {
  await hover(getByRole("button"));
  await waitForTooltipToShow();
  await click(getByRole("button"));
  expect(getTooltip()).toBeVisible();
  await hoverOutside();
  expect(getTooltip()).not.toBeVisible();
});

test("do not wait to show the tooltip if it was just hidden", async () => {
  await hover(getByRole("button"));
  await waitForTooltipToShow();
  await hoverOutside();
  expect(getTooltip()).not.toBeVisible();
  await hover(getByRole("button"));
  expect(getTooltip()).toBeVisible();
});

test("if tooltip was shown on hover, then the anchor received keyboard focus, do not hide on mouseleave", async () => {
  await hover(getByRole("button"));
  await waitForTooltipToShow();
  await press.Tab();
  expect(getTooltip()).toBeVisible();
  await hoverOutside();
  expect(getTooltip()).toBeVisible();
});

test("if tooltip was shown on focus visible, do not hide on mouseleave", async () => {
  await press.Tab();
  await waitForTooltipToShow();
  await hoverOutside();
  expect(getTooltip()).toBeVisible();
  await hover(getByRole("button"));
  expect(getTooltip()).toBeVisible();
  await hoverOutside();
  expect(getTooltip()).toBeVisible();
});

test("show tooltip on focus", async () => {
  const div = document.createElement("div");
  div.tabIndex = 0;
  document.body.append(div);

  expect(getTooltip()).not.toBeVisible();
  await press.Tab();
  expect(getByRole("tooltip")).toBeVisible();
  await press.Tab();
  expect(getTooltip()).not.toBeVisible();

  div.remove();
});

test("do not show tooltip immediately if focus was lost", async () => {
  const div = document.createElement("div");
  div.tabIndex = 0;
  document.body.append(div);

  await hover(getByRole("button"));
  await waitForTooltipToShow();
  await press.Tab();
  await press.Tab();
  expect(getTooltip()).not.toBeVisible();
  await hover(getByRole("button"));
  expect(getTooltip()).not.toBeVisible();
  await waitForTooltipToShow();

  div.remove();
});
