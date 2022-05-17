import { useContext } from "react";
import { createContext } from "vm";
import { render } from "ariakit-test";
import {
  createMemoComponent,
  createStoreContext,
  useStore,
  useStoreProvider,
  useStorePublisher,
} from "../store";
import { Options } from "../types";

test("createStoreContext", () => {
  const context = createStoreContext<{ someState: "val" }>();
  const TestComponent = () => {
    const { someState } = useContext(context) ?? {};
    return <div>{someState}</div>;
  };
  const Provider = () => {
    return (
      <context.Provider value={{ someState: "val" }}>
        <TestComponent />
      </context.Provider>
    );
  };
  const { getByText } = render(<Provider />);
  expect(getByText("val")).toBeInTheDocument();
});

test("createMemoComponent supports as prop", () => {
  const Component = createMemoComponent<Options<"div">>(
    ({ children, ...props }) => (
      <div {...props} data-testid="div">
        {typeof children === "function" ? children(props) : children}
      </div>
    )
  );

  const { getByTestId } = render(<Component as="button" />);
  expect(getByTestId("div").getAttribute("as")).toBe("button");
});

test("createMemoComponent supports state prop", () => {
  type Props = Options<"div"> & {
    state?: { customProp: boolean };
  };
  const Component = createMemoComponent<Props>(
    ({ state, children, ...props }) => (
      <div {...props}>
        {typeof children === "function" ? children(props) : children}
        {state?.customProp && "state"}
      </div>
    )
  );
  const { getByText } = render(<Component state={{ customProp: true }} />);
  expect(getByText("state")).toBeInTheDocument();
});

test("createMemoComponent supports forward ref", () => {
  const Component = createMemoComponent<Options<"div">>(
    ({ children, ...props }) => (
      <div {...props}>
        {typeof children === "function" ? children(props) : children}
      </div>
    )
  );
  const ref = jest.fn();
  render(<Component ref={ref} />);
  expect(ref).toHaveBeenCalledWith(expect.any(Element));
});

test("createMemoComponent creates a memoized component", () => {
  const renderFunction = jest.fn();
  type Props = Options<"div"> & {
    state?: { customProp?: boolean };
  };
  const Component = createMemoComponent<Props>(
    ({ state, children, ...props }) => {
      renderFunction();
      return (
        <div {...props}>
          {typeof children === "function" ? children(props) : children}
        </div>
      );
    }
  );
  const { rerender } = render(<Component />);
  expect(renderFunction).toHaveBeenCalledTimes(1);
  const state = {};
  rerender(<Component state={state} />);
  expect(renderFunction).toHaveBeenCalledTimes(2);
  rerender(<Component state={state} />);
  expect(renderFunction).toHaveBeenCalledTimes(2);
  rerender(<Component state={{}} />);
  expect(renderFunction).toHaveBeenCalledTimes(3);
});

test("useStoreProvider", () => {
  // const SomeContext = createStoreContext<{ someVal: string }>();
  // const Component = ({ state, ...props }: Record<string, any>) => {
  //   const { wrapElement } = useStoreProvider({}, SomeContext);
  //   return wrapElement(<div {...props} />);
  // };
});

test("useStorePublisher", () => {});

test("useStore", () => {});
