import * as React from "react";
import { render, fireEvent } from "react-testing-library";
import { Button } from "../Button";

test("render", () => {
  const { getByText } = render(<Button>test</Button>);
  expect(getByText("test")).toMatchInlineSnapshot(`
<button
  role="button"
  tabindex="0"
>
  test
</button>
`);
});

test("non-native button space/enter", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Button as="div" onClick={fn}>
      test
    </Button>
  );
  const element = getByText("test");
  fireEvent.keyDown(element, { key: "Enter" });
  expect(fn).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(element, { key: " " });
  expect(fn).toHaveBeenCalledTimes(2);
});

test("non-native button space/enter disabled", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Button as="div" disabled onClick={fn}>
      test
    </Button>
  );
  const element = getByText("test");
  fireEvent.keyDown(element, { key: "Enter" });
  fireEvent.keyDown(element, { key: " " });
  expect(fn).toHaveBeenCalledTimes(0);
});
