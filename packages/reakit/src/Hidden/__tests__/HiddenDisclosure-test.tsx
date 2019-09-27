import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import { HiddenDisclosure } from "../HiddenDisclosure";

const props: Parameters<typeof HiddenDisclosure>[0] = {
  toggle: jest.fn,
  unstable_hiddenId: "test"
};

test("render", () => {
  const { getByText } = render(
    <HiddenDisclosure {...props}>disclosure</HiddenDisclosure>
  );
  expect(getByText("disclosure")).toMatchInlineSnapshot(`
    <button
      aria-controls="test"
      aria-expanded="false"
      tabindex="0"
      type="button"
    >
      disclosure
    </button>
  `);
});

test("render visible", () => {
  const { getByText } = render(
    <HiddenDisclosure {...props} visible>
      disclosure
    </HiddenDisclosure>
  );
  expect(getByText("disclosure")).toMatchInlineSnapshot(`
    <button
      aria-controls="test"
      aria-expanded="true"
      tabindex="0"
      type="button"
    >
      disclosure
    </button>
  `);
});

test("render with aria-controls", () => {
  const { getByText } = render(
    <HiddenDisclosure {...props} aria-controls="a">
      disclosure
    </HiddenDisclosure>
  );
  expect(getByText("disclosure")).toMatchInlineSnapshot(`
    <button
      aria-controls="a test"
      aria-expanded="false"
      tabindex="0"
      type="button"
    >
      disclosure
    </button>
  `);
});

test("toggle", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <HiddenDisclosure {...props} toggle={fn}>
      disclosure
    </HiddenDisclosure>
  );
  expect(fn).toHaveBeenCalledTimes(0);
  fireEvent.click(getByText("disclosure"));
  expect(fn).toHaveBeenCalledTimes(1);
});
