import * as React from "react";
import { render } from "reakit-test-utils";
import { Alert, AlertProps } from "../Alert";

test("render", () => {
  const { getByText } = render(<Alert>alert</Alert>);
  expect(getByText("box")).toMatchInlineSnapshot(`
    <dialog>
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
  const { rerender } = render(<Test />);
  expect(onRender).toHaveBeenCalledTimes(1);
  rerender(<Test unstable_system={{ b: "b" }} />);
  expect(onRender).toHaveBeenCalledTimes(2);
  rerender(<Test unstable_system={{ b: "b" }} />);
  expect(onRender).toHaveBeenCalledTimes(2);
});
