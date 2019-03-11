import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import { HiddenDisclosure } from "../HiddenDisclosure";

const props = {
  toggle: jest.fn,
  refId: "test"
};

test("render", () => {
  const { getByText } = render(
    <HiddenDisclosure {...props}>test</HiddenDisclosure>
  );
  expect(getByText("test")).toMatchInlineSnapshot(`
<button
  aria-controls="test"
  aria-expanded="false"
  role="button"
  tabindex="0"
>
  test
</button>
`);
});

test("render visible", () => {
  const { getByText } = render(
    <HiddenDisclosure {...props} visible>
      test
    </HiddenDisclosure>
  );
  expect(getByText("test")).toMatchInlineSnapshot(`
<button
  aria-controls="test"
  aria-expanded="true"
  role="button"
  tabindex="0"
>
  test
</button>
`);
});

test("toggle", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <HiddenDisclosure {...props} toggle={fn}>
      test
    </HiddenDisclosure>
  );
  expect(fn).toHaveBeenCalledTimes(0);
  fireEvent.click(getByText("test"));
  expect(fn).toHaveBeenCalledTimes(1);
});
