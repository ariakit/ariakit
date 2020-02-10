import * as React from "react";
import { render, hover, wait } from "reakit-test-utils";
import { Tooltip, TooltipReference, useTooltipState } from "..";

test("show tooltip on hover", async () => {
  const Test = () => {
    const tooltip = useTooltipState();
    return (
      <>
        <TooltipReference {...tooltip}>reference</TooltipReference>
        <Tooltip {...tooltip}>tooltip</Tooltip>
      </>
    );
  };
  const { baseElement, getByText } = render(<Test />);
  const reference = getByText("reference");
  const tooltip = getByText("tooltip");
  expect(tooltip).not.toBeVisible();
  hover(reference);
  await wait(expect(tooltip).toBeVisible);
  hover(baseElement);
  await wait(expect(tooltip).not.toBeVisible);
});
