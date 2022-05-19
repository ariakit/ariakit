import { useContext } from "react";
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
  const SomeContext = createStoreContext<{ someVal: string }>();
  const Consumer = () => {
    const { someVal } = useContext(SomeContext) ?? {};
    return <div>{someVal}</div>;
  };
  const Component = () => {
    const { wrapElement } = useStoreProvider(
      { state: { someVal: "some val" } },
      SomeContext
    );
    return wrapElement(<Consumer />);
  };
  const { getByText } = render(<Component />);
  expect(getByText("some val")).toBeInTheDocument();
});

test("useStorePublisher", () => {
  const renderFunc = jest.fn();
  const state = {};
  const Component = () => {
    const store = useStorePublisher(state);
    renderFunc(store);
    return null;
  };
  render(<Component />);
  expect(renderFunc).toHaveBeenCalledWith(state);
});

test("useStore with undefined state and no filter", () => {
  const renderFunc = jest.fn();
  const state = undefined;
  const filter = undefined;
  const Component = (props: { useStoreArgs: Parameters<typeof useStore> }) => {
    const store = useStore(...props.useStoreArgs);
    renderFunc(store);
    return null;
  };
  const { rerender } = render(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(1, state);
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(2, state);
});

test("useStore with non-publisher defined state and no filter", () => {
  const renderFunc = jest.fn();
  const state = { someState: "some state" };
  const filter = undefined;
  const Component = (props: { useStoreArgs: Parameters<typeof useStore> }) => {
    const store = useStore(...props.useStoreArgs);
    renderFunc(store);
    return null;
  };
  const { rerender } = render(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(1, state);
  state.someState = "some other state";
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(2, state);
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(3, state);
});

test("useStore with non-publisher defined state and filter", () => {
  const renderFunc = jest.fn();
  const state = { someState: "some state" };
  const filter = ["someState"] as any;
  const Component = (props: { useStoreArgs: Parameters<typeof useStore> }) => {
    const store = useStore(...props.useStoreArgs);
    renderFunc(store);
    return null;
  };
  const { rerender } = render(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(1, state);
  state.someState = "some other state";
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(2, state);
  filter[0] = (val: typeof state) => val.someState === "some other state";
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(3, state);
  state.someState = "some other other state";
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(4, state);
});

test("useStore with publisher defined state and no filter", () => {
  const renderFunc = jest.fn();
  const state = { someState: "some state" };
  const filter = undefined;
  const Component = (props: { useStoreArgs: Parameters<typeof useStore> }) => {
    const [state, filter] = props.useStoreArgs;
    const publisherState = useStorePublisher(state);
    const store = useStore(publisherState, filter);
    renderFunc(store);
    return null;
  };
  const { rerender } = render(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(1, state);
  state.someState = "some other state";
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(2, state);
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(3, state);
});

test("useStore with publisher defined state and filter as empty array", () => {
  const renderFunc = jest.fn();
  const state = { someState: "some state", someVal: "some val" };
  const filter = [] as any;
  const Component = (props: { useStoreArgs: Parameters<typeof useStore> }) => {
    const [state, filter] = props.useStoreArgs;
    const publisherState = useStorePublisher(state);
    const store = useStore(publisherState, filter);
    renderFunc(store);
    return null;
  };
  const { rerender } = render(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(1, state);
  state.someState = "some other state";
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(2, state);
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(3, state);
});

test("useStore with publisher defined state and filter", () => {
  const renderFunc = jest.fn();
  const state = { someState: "some state", someVal: "some val" };
  const filter = ["someState"] as any;
  const Component = (props: { useStoreArgs: Parameters<typeof useStore> }) => {
    const [state, filter] = props.useStoreArgs;
    const publisherState = useStorePublisher(state);
    const store = useStore(publisherState, filter);
    renderFunc(store);
    return null;
  };
  const { rerender } = render(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(1, state);
  state.someState = "some other state";
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(2, state);
  filter[0] = "someVal";
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(3, state);
  filter[0] = (val: typeof state) => val.someState === "some other state";
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(4, state);
  state.someState = "some state";
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(5, state);
  state.someVal = "some val2";
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(6, state);
  filter[0] = "someVal";
  rerender(<Component useStoreArgs={[state, filter]} />);
  expect(renderFunc).toHaveBeenNthCalledWith(7, state);
});

test("useStore with context publisher defined state and filter", () => {
  const renderFunc = jest.fn();
  const subRenderFunc = jest.fn();
  const state = { someState: "some state", someVal: "some val" };
  const filter = ["someState"] as any;
  const Context = createStoreContext<{
    state: typeof state;
    filter: typeof filter;
  }>();
  const SubComponent = (props: {
    useStoreArgs: Parameters<typeof useStore>;
  }) => {
    const [state, filter] = props.useStoreArgs;
    const store = useStore(state, filter);
    subRenderFunc(store);
    return null;
  };
  const Component = () => {
    const { state, filter } = useContext(Context) ?? {};
    const publisherState = useStorePublisher(state);
    const store = useStore(publisherState, filter);
    renderFunc(store);
    return <SubComponent useStoreArgs={[state, filter]} />;
  };
  const { rerender } = render(
    <Context.Provider value={{ state, filter }}>
      <Component />
    </Context.Provider>
  );
  expect(renderFunc).toHaveBeenNthCalledWith(1, state);
  expect(subRenderFunc).toHaveBeenNthCalledWith(1, state);
  state.someState = "some other state";
  rerender(
    <Context.Provider value={{ state, filter }}>
      <Component />
    </Context.Provider>
  );
  expect(renderFunc).toHaveBeenNthCalledWith(2, state);
  expect(subRenderFunc).toHaveBeenNthCalledWith(2, state);
  filter[0] = "someVal";
  rerender(
    <Context.Provider value={{ state, filter }}>
      <Component />
    </Context.Provider>
  );
  expect(renderFunc).toHaveBeenNthCalledWith(3, state);
  expect(subRenderFunc).toHaveBeenNthCalledWith(3, state);
  filter[0] = (val: typeof state) => val.someState === "some other state";
  rerender(
    <Context.Provider value={{ state, filter }}>
      <Component />
    </Context.Provider>
  );
  expect(renderFunc).toHaveBeenNthCalledWith(4, state);
  expect(subRenderFunc).toHaveBeenNthCalledWith(4, state);
  state.someState = "some state";
  rerender(
    <Context.Provider value={{ state, filter }}>
      <Component />
    </Context.Provider>
  );
  expect(renderFunc).toHaveBeenNthCalledWith(5, state);
  expect(subRenderFunc).toHaveBeenNthCalledWith(5, state);
  state.someVal = "some val2";
  rerender(
    <Context.Provider value={{ state, filter }}>
      <Component />
    </Context.Provider>
  );
  expect(renderFunc).toHaveBeenNthCalledWith(6, state);
  expect(subRenderFunc).toHaveBeenNthCalledWith(6, state);
  filter[0] = "someVal";
  rerender(
    <Context.Provider value={{ state, filter }}>
      <Component />
    </Context.Provider>
  );
  expect(renderFunc).toHaveBeenNthCalledWith(7, state);
  expect(subRenderFunc).toHaveBeenNthCalledWith(7, state);
});
