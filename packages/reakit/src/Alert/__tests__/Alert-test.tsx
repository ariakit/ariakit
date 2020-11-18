import * as React from "react";
import { render } from "reakit-test-utils";
import { Alert, AlertProps } from "../Alert";

test("render hidden", () => {
  const { getByText } = render(<Alert visible={false}>alert</Alert>);
  expect(getByText("alert")).toMatchInlineSnapshot(`
    <dialog
      role="alert"
    >
      alert
    </dialog>
  `);
});

test("render visible", () => {
  const { getByText } = render(<Alert visible>alert</Alert>);
  expect(getByText("alert")).toMatchInlineSnapshot(`
    <dialog
      open=""
      role="alert"
    >
      alert
    </dialog>
  `);
});

test("do not re-render if unstable_system is the same", () => {
  const onRender = jest.fn();
  const Test = React.memo(({ unstable_system }: AlertProps) => {
    React.useEffect(onRender);
    return <Alert unstable_system={unstable_system} />;
  }, Alert.unstable_propsAreEqual);
  const { rerender } = render(<Test visible />);
  expect(onRender).toHaveBeenCalledTimes(1);
  rerender(<Test visible unstable_system={{ b: "b" }} />);
  expect(onRender).toHaveBeenCalledTimes(2);
  rerender(<Test visible unstable_system={{ b: "b" }} />);
  expect(onRender).toHaveBeenCalledTimes(2);
});
