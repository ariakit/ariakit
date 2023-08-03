import { click, getByRole, hover, press, waitFor } from "@ariakit/test";

const getAnchor = () => getByRole("link");
const getTooltip = () => getByRole("tooltip", { hidden: true });

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
  await hover(document.body, { clientX: 20, clientY: 20 });
};

afterEach(async () => {
  await hoverOutside();
});

test("show tooltip on hover", async () => {
  expect(getTooltip()).not.toBeVisible();
  await hover(getAnchor());
  await waitFor(() => expect(getTooltip()).toBeVisible());
  await hoverOutside();
  expect(getTooltip()).not.toBeVisible();
});

test("do not wait to show the tooltip if it was just hidden", async () => {
  await hover(getAnchor());
  await waitFor(() => expect(getTooltip()).toBeVisible());
  await hoverOutside();
  expect(getTooltip()).not.toBeVisible();
  await hover(getAnchor());
  expect(getTooltip()).toBeVisible();
});

test("if tooltip was shown on hover, then the anchor received keyboard focus, do not hide on mouseleave", async () => {
  await hover(getAnchor());
  await waitFor(() => expect(getTooltip()).toBeVisible());
  await press.Tab();
  expect(getTooltip()).toBeVisible();
  await hoverOutside();
  expect(getTooltip()).toBeVisible();
});

test("if tooltip was shown on focus visible, do not hide on mouseleave", async () => {
  await press.Tab();
  await waitFor(() => expect(getTooltip()).toBeVisible());
  await hoverOutside();
  expect(getTooltip()).toBeVisible();
  await hover(getAnchor());
  expect(getTooltip()).toBeVisible();
  await hoverOutside();
  expect(getTooltip()).toBeVisible();
});

test("click on tooltip and press esc", async () => {
  expect(getTooltip()).not.toBeVisible();
  await hover(getAnchor());
  await waitFor(() => expect(getTooltip()).toBeVisible());
  await click(getTooltip()!);
  expect(getTooltip()).toBeVisible();
  await press.Escape();
  expect(getAnchor()).toHaveFocus();
  await waitFor(() => expect(getTooltip()).not.toBeVisible());
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

  await hover(getAnchor());
  await waitFor(() => expect(getTooltip()).toBeVisible());
  await press.Tab();
  await press.Tab();
  expect(getTooltip()).not.toBeVisible();
  await hoverOutside();
  await hover(getAnchor());
  expect(getTooltip()).not.toBeVisible();
  await waitFor(() => expect(getTooltip()).toBeVisible());

  div.remove();
});
