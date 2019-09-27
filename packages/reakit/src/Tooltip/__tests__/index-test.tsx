import * as React from "react";
import { render, fireEvent, wait } from "@testing-library/react";
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
  fireEvent.mouseEnter(disclosure);
  await wait(expect(tooltip).toBeVisible);
});

test("hide", async () => {
  const { getByText } = render(<Test visible />);
  const disclosure = getByText("disclosure");
  const tooltip = getByText("tooltip");
  expect(tooltip).toBeVisible();
  fireEvent.mouseLeave(disclosure);
  await wait(expect(tooltip).not.toBeVisible);
});
