import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import {
  Hidden,
  HiddenDisclosure,
  useHiddenState,
  unstable_HiddenInitialState
} from "..";

function Test(props: unstable_HiddenInitialState) {
  const hidden = useHiddenState(props);
  return (
    <>
      <HiddenDisclosure {...hidden}>Disclosure</HiddenDisclosure>
      <Hidden {...hidden}>Hidden</Hidden>
    </>
  );
}

test("show", () => {
  const { getByText } = render(<Test />);
  const disclosure = getByText("Disclosure");
  const hidden = getByText("Hidden");
  // TODO: Replace by .toBeVisible
  // https://github.com/gnapse/jest-dom/issues/84
  expect(hidden).toHaveAttribute("hidden");
  fireEvent.click(disclosure);
  expect(hidden).not.toHaveAttribute("hidden");
});

test("hide", () => {
  const { getByText } = render(<Test visible />);
  const disclosure = getByText("Disclosure");
  const hidden = getByText("Hidden");
  expect(hidden).not.toHaveAttribute("hidden");
  fireEvent.click(disclosure);
  expect(hidden).toHaveAttribute("hidden");
});
