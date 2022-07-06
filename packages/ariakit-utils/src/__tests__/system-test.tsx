import { ReactNode } from "react";
import { render } from "ariakit-test";

import { createComponent, createElement, createHook } from "../system";
import { Options } from "../types";

test("createComponent supports as prop", () => {
  const someFunc = jest.fn();
  const TestComponent = createComponent<{
    as?: "div";
    customProp?: boolean;
  }>(({ customProp, children, ...props }) => {
    if (customProp) {
      someFunc();
    }
    return (
      <div {...props} data-testid="div">
        {typeof children === "function" ? children(props) : children}
      </div>
    );
  });
  const { getByTestId, rerender } = render(<TestComponent />);
  const div = getByTestId("div");
  expect(div.getAttribute("as")).toBeNull();
  expect(someFunc).not.toHaveBeenCalled();
  rerender(<TestComponent as="div" customProp />);
  expect(getByTestId("div").getAttribute("as")).toBe("div");
  expect(someFunc).toHaveBeenCalled();
});

test("createComponent supports forwardRef", () => {
  const ref = jest.fn();
  const TestComponent = createComponent<{
    as?: "div";
    customProp?: boolean;
  }>(({ customProp, children, ...props }) => {
    return (
      <div {...props}>
        {typeof children === "function" ? children(props) : children}
      </div>
    );
  });
  expect(ref).not.toHaveBeenCalled();
  render(<TestComponent ref={ref} />);
  expect(ref).toHaveBeenCalled();
});

test("createElement", () => {
  const TestComponent = () => {
    const props = {};
    return createElement("button", props);
  };
  const { getByRole } = render(<TestComponent />);
  expect(getByRole("button")).toBeInTheDocument();
});

test("createElement supports as prop", () => {
  const TestComponent = () => {
    const props = {
      as: "button" as const,
    };
    return createElement("div", props);
  };
  const { getByRole } = render(<TestComponent />);
  expect(getByRole("button")).toBeInTheDocument();
});

test("createElement supports as prop as Component", () => {
  const TestComponent = () => {
    const props = {
      as: () => <button />,
    };
    return createElement("div", props);
  };
  const { getByRole } = render(<TestComponent />);
  expect(getByRole("button")).toBeInTheDocument();
});

test("createElement supports render props", () => {
  const TestComponent = () => {
    const props = {
      children: (htmlProps: any) => <button {...htmlProps} />,
    };
    return createElement("div", props);
  };
  const { getByRole } = render(<TestComponent />);
  expect(getByRole("button")).toBeInTheDocument();
});

test("createElement supports wrapElement", () => {
  const TestComponent = () => {
    const props = {
      wrapElement: (element: ReactNode) => (
        <div data-testid="wrapper">{element}</div>
      ),
    };
    return createElement("div", props);
  };
  const { getByTestId } = render(<TestComponent />);
  expect(getByTestId("wrapper")).toBeInTheDocument();
});

test("createHook", () => {
  type Props = Options<"button"> & {
    customProp?: boolean;
    someOtherProp?: boolean;
  };
  const useComponent = createHook<Props>(({ customProp, ...props }) => {
    return props;
  });
  expect(
    useComponent({ as: "button", customProp: true, someOtherProp: undefined })
  ).toEqual({
    as: "button",
  });
  expect(useComponent({})).toEqual({});
  expect(useComponent({})).not.toBe({}); // Props are copied
  expect(useComponent()).toEqual({});
});
