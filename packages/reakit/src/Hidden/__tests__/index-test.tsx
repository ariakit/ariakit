import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  Hidden,
  HiddenDisclosure,
  useHiddenState,
  HiddenInitialState
} from "..";

function Test(props: HiddenInitialState) {
  const hidden = useHiddenState(props);
  return (
    <>
      <HiddenDisclosure {...hidden}>disclosure</HiddenDisclosure>
      <Hidden {...hidden}>hidden</Hidden>
    </>
  );
}

test("show", () => {
  const { getByText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const hidden = getByText("hidden");
  expect(hidden).not.toBeVisible();
  fireEvent.click(disclosure);
  expect(hidden).toBeVisible();
});

test("hide", () => {
  const { getByText } = render(<Test visible />);
  const disclosure = getByText("disclosure");
  const hidden = getByText("hidden");
  expect(hidden).toBeVisible();
  fireEvent.click(disclosure);
  expect(hidden).not.toBeVisible();
});
