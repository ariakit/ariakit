import { click, getByRole, getByText, hover, waitFor } from "@ariakit/test";

const getButton = () => getByRole("button", { name: "Bold" });
const getTooltip = () => getByText("Bold");

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
  await hover(document.body, { clientX: 20, clientY: 20 });
};

test("show tooltip on hover", async () => {
  expect(getTooltip()).not.toBeVisible();
  await hover(getButton());
  await waitFor(() => expect(getTooltip()).toBeVisible());
  await hoverOutside();
  expect(getTooltip()).not.toBeVisible();
});

test("do not hide tooltip on click", async () => {
  await hover(getButton());
  await waitFor(() => expect(getTooltip()).toBeVisible());
  await click(getButton());
  expect(getTooltip()).toBeVisible();
  await hoverOutside();
  expect(getTooltip()).not.toBeVisible();
});
