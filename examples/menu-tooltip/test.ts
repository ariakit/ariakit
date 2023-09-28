import { click, getByRole, getByText, hover, waitFor } from "@ariakit/test";

const getMenu = () => getByRole("menu", { name: "Accessibility Shortcuts" });
const getMenuButton = () =>
  getByRole("button", { name: "Accessibility Shortcuts" });
const getTooltip = () =>
  getByText("Accessibility Shortcuts", {
    exact: true,
    selector: "[role=tooltip]",
  });

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
};

afterEach(async () => {
  await hoverOutside();
});

test("show/hide tooltip on hover", async () => {
  await hover(getMenuButton());
  await waitFor(() => expect(getTooltip()).toBeVisible());
  await hoverOutside();
  await waitFor(() => expect(getTooltip()).not.toBeVisible());
});

test("hide tooltip by clicking on menu button", async () => {
  await hover(getMenuButton());
  await waitFor(() => expect(getTooltip()).toBeVisible());
  await click(getMenuButton());
  expect(getMenu()).toBeVisible();
  expect(getMenu()).toHaveFocus();
  expect(getTooltip()).not.toBeVisible();
});
