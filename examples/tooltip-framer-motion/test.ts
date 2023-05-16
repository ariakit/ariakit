import { version } from "react";
import {
  click,
  getByRole,
  hover,
  press,
  queryByRole,
  waitFor,
} from "@ariakit/test";

const getAnchor = () => getByRole("link");
const getTooltip = () => queryByRole("tooltip", { hidden: true });

const hoverOutside = async () => {
  await hover(document.body);
  await hover(document.body, { clientX: 10, clientY: 10 });
  await hover(document.body, { clientX: 20, clientY: 20 });
};

const is17 = version.startsWith("17");

describe.skipIf(is17)("tooltip-framer-motion", () => {
  test("show tooltip on hover", async () => {
    expect(getTooltip()).not.toBeInTheDocument();
    await hover(getAnchor());
    await waitFor(() => expect(getTooltip()).toBeVisible());
    await hoverOutside();
    expect(getTooltip()).toBeVisible();
    await waitFor(() => expect(getTooltip()).not.toBeInTheDocument());
  });

  test("show tooltip on focus", async () => {
    expect(getTooltip()).not.toBeInTheDocument();
    await press.Tab();
    expect(getTooltip()).toBeVisible();
    await click(document.body);
    expect(getTooltip()).toBeVisible();
    await waitFor(() => expect(getTooltip()).not.toBeInTheDocument());
  });

  test("click on tooltip and press esc", async () => {
    expect(getTooltip()).not.toBeInTheDocument();
    await hover(getAnchor());
    await waitFor(() => expect(getTooltip()).toBeVisible());
    await click(getTooltip()!);
    expect(getTooltip()).toBeVisible();
    await press.Escape();
    expect(getAnchor()).toHaveFocus();
    await waitFor(() => expect(getTooltip()).not.toBeInTheDocument());
  });
});
