import * as React from "react";
import { render, fireEvent, wait } from "@testing-library/react";
import {
  Popover,
  PopoverArrow,
  PopoverDisclosure,
  usePopoverState,
  PopoverInitialState
} from "..";

function Test(props: PopoverInitialState) {
  const popover = usePopoverState(props);
  return (
    <>
      <PopoverDisclosure {...popover}>disclosure</PopoverDisclosure>
      <Popover {...popover} aria-label="popover" tabIndex={0}>
        <PopoverArrow {...popover} />
        popover
      </Popover>
    </>
  );
}

test("show", async () => {
  const { getByText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const popover = getByText("popover");
  expect(popover).not.toBeVisible();
  fireEvent.click(disclosure);
  await wait(expect(popover).toBeVisible);
});

test("hide", async () => {
  const { getByText } = render(<Test visible />);
  const disclosure = getByText("disclosure");
  const popover = getByText("popover");
  expect(popover).toBeVisible();
  fireEvent.click(disclosure);
  await wait(expect(popover).not.toBeVisible);
});
