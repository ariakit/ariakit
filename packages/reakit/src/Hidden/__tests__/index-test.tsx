import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Hidden, HiddenDisclosure, useHiddenState } from "..";

test("show", () => {
  function Test() {
    const hidden = useHiddenState();
    return (
      <>
        <HiddenDisclosure {...hidden}>disclosure</HiddenDisclosure>
        <Hidden {...hidden}>hidden</Hidden>
      </>
    );
  }
  const { getByText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const hidden = getByText("hidden");
  expect(hidden).not.toBeVisible();
  fireEvent.click(disclosure);
  expect(hidden).toBeVisible();
});

test("hide", () => {
  function Test() {
    const hidden = useHiddenState({ visible: true });
    return (
      <>
        <HiddenDisclosure {...hidden}>disclosure</HiddenDisclosure>
        <Hidden {...hidden}>hidden</Hidden>
      </>
    );
  }
  const { getByText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const hidden = getByText("hidden");
  expect(hidden).toBeVisible();
  fireEvent.click(disclosure);
  expect(hidden).not.toBeVisible();
});

test("multiple components", () => {
  function Test() {
    const hidden1 = useHiddenState();
    const hidden2 = useHiddenState();
    return (
      <>
        <HiddenDisclosure {...hidden1}>
          {props => (
            <HiddenDisclosure {...props} {...hidden2}>
              disclosure
            </HiddenDisclosure>
          )}
        </HiddenDisclosure>
        <Hidden {...hidden1}>hidden1</Hidden>
        <Hidden {...hidden2}>hidden2</Hidden>
      </>
    );
  }
  const { getByText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const hidden1 = getByText("hidden1");
  const hidden2 = getByText("hidden2");
  expect(hidden1).not.toBeVisible();
  expect(hidden2).not.toBeVisible();
  fireEvent.click(disclosure);
  expect(hidden1).toBeVisible();
  expect(hidden2).toBeVisible();
});
