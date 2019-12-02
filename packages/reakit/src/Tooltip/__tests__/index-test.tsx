import * as React from "react";
import { render, hover, wait } from "reakit-test-utils";
import {
  Tooltip,
  TooltipArrow,
  TooltipReference,
  useTooltipState,
  TooltipInitialState
} from "..";

function Test(props: TooltipInitialState) {
  const tooltip = useTooltipState(props);
  return (
    <>
      <TooltipReference {...tooltip}>disclosure</TooltipReference>
      <Tooltip {...tooltip} aria-label="tooltip" tabIndex={0}>
        <TooltipArrow {...tooltip} />
        tooltip
      </Tooltip>
    </>
  );
}

test("show", async () => {
  const { getByText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const tooltip = getByText("tooltip");
  expect(tooltip).not.toBeVisible();
  hover(disclosure);
  await wait(expect(tooltip).toBeVisible);
});

test("hide", async () => {
  const { getByText, baseElement } = render(<Test visible />);
  const disclosure = getByText("disclosure");
  const tooltip = getByText("tooltip");
  expect(tooltip).toBeVisible();
  hover(disclosure);
  hover(baseElement);
  await wait(expect(tooltip).not.toBeVisible);
});
