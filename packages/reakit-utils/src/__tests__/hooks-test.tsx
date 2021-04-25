import * as React from "react";
import { render } from "reakit-test-utils";
import { useForkRef, useUpdateEffect } from "../hooks";

test("useForkRef", () => {
  expect.assertions(2);
  const externalRef = React.createRef<HTMLElement>();

  const Component = React.forwardRef((props, ref) => {
    const internalRef = React.useRef<HTMLElement>(null);
    React.useEffect(() => {
      expect(internalRef.current).toBeInTheDocument();
    }, []);
    return <div ref={useForkRef(internalRef, ref)} {...props} />;
  });

  render(<Component ref={externalRef} />);

  expect(externalRef.current).toBeInTheDocument();
});

test("useUpdateEffect", () => {
  const fn = jest.fn();
  const Test = () => {
    useUpdateEffect(fn);
    return null;
  };
  const { rerender } = render(<Test />);
  expect(fn).not.toHaveBeenCalled();
  rerender(<Test />);
  expect(fn).toHaveBeenCalled();
});
