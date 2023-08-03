import {
  click,
  getByText,
  hover,
  press,
  queryByRole,
  queryByText,
  waitFor,
} from "@ariakit/test";

const getMenuButton = (name: string) => getByText(name, { selector: "button" });
const getTooltip = (name: string) =>
  queryByText(name, { exact: true, selector: "[role=tooltip]" });
const getMenu = (name: string) => queryByRole("menu", { name });

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
};

const labels = [
  "default",
  "portal",
  "modal",
  "unmount portal",
  "unmount modal",
] as const;

describe.each(labels)("%s", (label) => {
  test("show/hide tooltip on hover", async () => {
    await hover(getMenuButton(label));
    await waitFor(() => expect(getTooltip(label)).toBeVisible());
    await hoverOutside();
    await waitFor(() => expect(getTooltip(label)).not.toBeVisible());
  });

  test("hide tooltip by clicking on menu button", async () => {
    await hover(getMenuButton(label));
    await waitFor(() => expect(getTooltip(label)).toBeVisible());
    await click(getMenuButton(label));
    expect(getMenu(label)).toBeInTheDocument();
    expect(getMenu(label)).toHaveFocus();
    expect(getTooltip(label)).not.toBeVisible();
  });

  test("do not show tooltip on hover after clicking on menu button", async () => {
    await hover(getMenuButton(label));
    await waitFor(() => expect(getTooltip(label)).toBeVisible());
    await click(getMenuButton(label));
    expect(getMenu(label)).toBeInTheDocument();
    expect(getTooltip(label)).not.toBeVisible();
    await hover(getMenuButton(label));
    await hover(getMenuButton(label));
    expect(getTooltip(label)).not.toBeVisible();
  });

  test("but show tooltip on hover after clicking on menu button and then hovering outside unless it's modal", async () => {
    await hover(getMenuButton(label));
    await waitFor(() => expect(getTooltip(label)).toBeVisible());
    await click(getMenuButton(label));
    expect(getMenu(label)).toBeInTheDocument();
    expect(getTooltip(label)).not.toBeVisible();
    await hoverOutside();
    await hover(getMenuButton(label));
    await hover(getMenuButton(label));
    if (label.includes("modal")) {
      expect(getTooltip(label)).not.toBeVisible();
    } else {
      await waitFor(() => expect(getTooltip(label)).toBeVisible());
    }
  });

  test("show tooltip again after closing menu with esc", async () => {
    await click(getMenuButton(label));
    expect(getMenu(label)).toBeInTheDocument();
    await press.Escape();
    expect(getMenu(label)).not.toBeInTheDocument();
    await waitFor(() => expect(getTooltip(label)).toBeVisible());
  });
});
