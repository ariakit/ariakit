import { useEffect, useRef, useState } from "react";
import { fireEvent, render, sleep } from "ariakit-test";

import {
  useBooleanEvent,
  useControlledState,
  useEvent,
  useForceUpdate,
  useForkRef,
  useId,
  useInitialValue,
  useLazyValue,
  useLiveRef,
  usePreviousValue,
  useRefId,
  useTagName,
  useUpdateEffect,
  useUpdateLayoutEffect,
  useWrapElement,
} from "../hooks";

test("useInitialValue", () => {
  const TestComponent = () => {
    const [someState, setSomeState] = useState("some value");
    const initialValue = useInitialValue(someState);
    return (
      <button onClick={() => setSomeState("some new value")}>
        {initialValue}
      </button>
    );
  };
  const { container, getByRole } = render(<TestComponent />);
  expect(container).toHaveTextContent("some value");
  fireEvent.click(getByRole("button"));
  expect(container).toHaveTextContent("some value");
});

test("useLazyValue", () => {
  const TestComponent = () => {
    const [someState, setSomeState] = useState("some value");
    const lazyValue = useLazyValue(() => someState);
    return (
      <button onClick={() => setSomeState("some new value")}>
        {lazyValue}
      </button>
    );
  };
  const { container, getByRole } = render(<TestComponent />);
  expect(container).toHaveTextContent("some value");
  fireEvent.click(getByRole("button"));
  expect(container).toHaveTextContent("some value");
});

test("useLiveRef", async () => {
  const effectFunction = jest.fn();
  const TestComponent = () => {
    const [someState, setSomeState] = useState("some value");
    const liveRef = useLiveRef(someState);
    useEffect(() => effectFunction(liveRef.current), [someState]);
    return <button onClick={() => setSomeState("some new value")} />;
  };
  const { getByRole } = render(<TestComponent />);
  expect(effectFunction).toHaveBeenCalledTimes(2);
  expect(effectFunction).toHaveBeenCalledWith("some value");
  fireEvent.click(getByRole("button"));
  expect(effectFunction).toHaveBeenCalledTimes(3);
  expect(effectFunction).toHaveBeenCalledWith("some new value");
});

test("usePreviousValue", () => {
  const duringRender = jest.fn();
  const TestComponent = () => {
    const [someState, setSomeState] = useState("some value");
    const prevValue = usePreviousValue(someState);
    duringRender(prevValue);
    return (
      <button onClick={() => setSomeState("some new value")}>
        {prevValue}
      </button>
    );
  };
  const { container, getByRole } = render(<TestComponent />);
  expect(container).toHaveTextContent("some value");
  fireEvent.click(getByRole("button"));
  expect(duringRender).nthCalledWith(1, "some value");
  expect(duringRender).nthCalledWith(2, "some value");
  expect(duringRender).nthCalledWith(3, "some value");
  expect(duringRender).nthCalledWith(4, "some new value");
  expect(container).toHaveTextContent("some new value");
});

test("useEvent function is stable", () => {
  // Check function is stable
  const effectFunction = jest.fn();
  const TestComponent = () => {
    const [callback, setCallback] = useState(() => effectFunction);
    const result = useEvent(callback);
    useEffect(effectFunction, [result]);
    return <button onClick={() => setCallback(jest.fn())} />;
  };
  const { getByRole } = render(<TestComponent />);
  expect(effectFunction).toBeCalledTimes(2);
  fireEvent.click(getByRole("button"));
  expect(effectFunction).toBeCalledTimes(2);
});

test("useForkRef", () => {
  const ref1 = jest.fn();
  const ref2 = jest.fn();
  const TestComponent = () => {
    const internalRef = useRef();
    const ref = useForkRef(internalRef, ref1, ref2);
    return <button ref={ref} />;
  };
  const { getByRole } = render(<TestComponent />);
  expect(ref1).toBeCalledTimes(1);
  expect(ref2).toBeCalledTimes(1);
  const button = getByRole("button");
  expect(ref1).toHaveBeenCalledWith(button);
  expect(ref2).toHaveBeenCalledWith(button);
});

test("useForkRef no refs provided", () => {
  let refVal: any;
  const TestComponent2 = () => {
    const ref = useForkRef();
    refVal = ref;
    return <div />;
  };
  expect(refVal).toBeUndefined();
  render(<TestComponent2 />);
  expect(refVal).toBeUndefined();
});

test("useRefId", () => {
  let idVal: string | undefined;
  const TestComponent = () => {
    const ref = useRef<HTMLDivElement>(null);
    const id = useRefId(ref);
    idVal = id;
    return <div id="some-id" ref={ref} />;
  };
  expect(idVal).toBeUndefined();
  render(<TestComponent />);
  expect(idVal).toBe("some-id");
});

test("useRefId undefined ref", () => {
  let idVal: string | undefined;
  const TestComponent2 = () => {
    const ref = useRef<HTMLDivElement>(null);
    const id = useRefId(ref);
    idVal = id;
    return <div />;
  };
  expect(idVal).toBeUndefined();
  render(<TestComponent2 />);
  expect(idVal).toBeUndefined();
});

test("useId", () => {
  const TestComponent = () => {
    const [idState, setIdState] = useState("");
    const id = useId(idState);
    return <button onClick={() => setIdState("some-id")} id={id} />;
  };
  const { getByRole } = render(<TestComponent />);
  const button = getByRole("button");
  expect(button.id).toBeTruthy();
  fireEvent.click(button);
  expect(button.id).toBe("some-id");
});

test("useTagName", () => {
  let tagNameVal: string | undefined;
  const TestComponent = () => {
    const ref = useRef<HTMLDivElement>(null);
    const tagName = useTagName(ref);
    tagNameVal = tagName;
    return <div ref={ref} />;
  };
  render(<TestComponent />);
  expect(tagNameVal).toBe("div");
});

test("useTagName with type", () => {
  let tagNameVal: string | undefined;
  const TestComponent = () => {
    const ref = useRef<HTMLDivElement>(null);
    const tagName = useTagName(ref, "button");
    tagNameVal = tagName;
    return <div ref={ref} />;
  };
  render(<TestComponent />);
  expect(tagNameVal).toBe("div");
});

test("useTagName with type and element undefined", () => {
  let tagNameVal: string | undefined;
  const TestComponent = () => {
    const ref = useRef<HTMLDivElement>(null);
    const tagName = useTagName(ref, "button");
    tagNameVal = tagName;
    return <div />;
  };
  render(<TestComponent />);
  expect(tagNameVal).toBe("button");
});

test("useUpdateEffect", () => {
  const effectFunction = jest.fn();
  const TestComponent = (props: { somePropVale: number }) => {
    const { somePropVale } = props;
    useUpdateEffect(effectFunction, [somePropVale]);
    return <div />;
  };
  const { rerender } = render(<TestComponent somePropVale={0} />);
  expect(effectFunction).toBeCalledTimes(0);
  rerender(<TestComponent somePropVale={1} />);
  expect(effectFunction).toBeCalledTimes(1);
  rerender(<TestComponent somePropVale={1} />);
  expect(effectFunction).toBeCalledTimes(1);
  rerender(<TestComponent somePropVale={2} />);
  expect(effectFunction).toBeCalledTimes(2);
});

test("useUpdateLayoutEffect", () => {
  const effectFunction = jest.fn();
  const TestComponent = (props: { somePropVale: number }) => {
    const { somePropVale } = props;
    useUpdateLayoutEffect(effectFunction, [somePropVale]);
    return <div />;
  };
  const { rerender } = render(<TestComponent somePropVale={0} />);
  expect(effectFunction).toBeCalledTimes(0);
  rerender(<TestComponent somePropVale={1} />);
  expect(effectFunction).toBeCalledTimes(1);
  rerender(<TestComponent somePropVale={1} />);
  expect(effectFunction).toBeCalledTimes(1);
  rerender(<TestComponent somePropVale={2} />);
  expect(effectFunction).toBeCalledTimes(2);
});

test("useControlledState", async () => {
  const TestComponent = () => {
    const [controlled, setControlled] = useState(false);
    const [state, setState] = useState("initial state");
    const [controlledState, setControlledState] = useControlledState(
      "initial controlled state",
      controlled ? state : undefined,
      controlled ? setState : undefined
    );
    return (
      <div>
        <button
          data-testid="controlled"
          onClick={() => setControlled(!controlled)}
        />
        <button
          data-testid="update-state"
          onClick={() => setState("some-state")}
        />
        <button
          data-testid="update-controlled-state"
          onClick={() => setControlledState("some-controlled-state")}
        />
        <button
          data-testid="reset"
          onClick={() => {
            setControlled(false);
            // Have to force this on a separate tick to avoid
            // the state being reset into the controlled state
            setTimeout(() => {
              setState("initial state");
              setControlledState("initial controlled state");
            }, 0);
          }}
        />
        <div>{controlledState}</div>
      </div>
    );
  };
  const { container, getByTestId } = render(<TestComponent />);
  const controlled = getByTestId("controlled");
  const updateState = getByTestId("update-state");
  const updateControlledState = getByTestId("update-controlled-state");
  const reset = getByTestId("reset");
  expect(container).toHaveTextContent("initial controlled state");
  fireEvent.click(updateControlledState);
  expect(container).toHaveTextContent("some-controlled-state");
  fireEvent.click(controlled);
  expect(container).toHaveTextContent("initial state");
  fireEvent.click(updateState);
  expect(container).toHaveTextContent("some-state");
  fireEvent.click(reset);
  await sleep();
  expect(container).toHaveTextContent("initial controlled state");
  fireEvent.click(controlled);
  expect(container).toHaveTextContent("initial state");
});

test("useForceUpdate", () => {
  const someFunction = jest.fn();
  const TestComponent = () => {
    const [_, forceUpdateFunc] = useForceUpdate();
    someFunction();
    useEffect(forceUpdateFunc, []);
    return <button onClick={() => forceUpdateFunc()} />;
  };
  const { getByRole } = render(<TestComponent />);
  // Should render twice on mount
  expect(someFunction).toBeCalledTimes(4);
  fireEvent.click(getByRole("button"));
  expect(someFunction).toBeCalledTimes(6);
});

test("useBooleanEvent", () => {
  const someFunc = jest.fn();
  const TestComponent = () => {
    const func = useBooleanEvent(() => true);
    const bool = useBooleanEvent(true);
    return (
      <div>
        <button
          data-testid="func"
          onClick={() => (func() ? someFunc("func") : null)}
        />
        <button
          data-testid="bool"
          onClick={() => (bool() ? someFunc("bool") : null)}
        />
      </div>
    );
  };
  const { getByTestId } = render(<TestComponent />);
  fireEvent.click(getByTestId("func"));
  expect(someFunc).toBeCalledTimes(1);
  expect(someFunc).toBeCalledWith("func");
  fireEvent.click(getByTestId("bool"));
  expect(someFunc).toBeCalledTimes(2);
  expect(someFunc).toBeCalledWith("bool");
});

test("useWrapElement", () => {
  const DeeplyWrappedComponent = () => {
    const [count, setCount] = useState(3);
    const newProps1 = useWrapElement({}, (element) => (
      <div data-testid="wrap1">{element}</div>
    ));
    const newProps2 = useWrapElement(newProps1, (element) => (
      <div data-testid="wrap2">{element}</div>
    ));
    const newProps3 = useWrapElement(
      newProps2,
      (element) => <div data-testid={`wrap${count}`}>{element}</div>,
      [count]
    );
    return newProps3.wrapElement(
      <div data-testid="innerElement">
        <button onClick={() => setCount(count + 1)}>Click me</button>
      </div>
    );
  };
  const { getByTestId, queryByTestId, getByRole } = render(
    <DeeplyWrappedComponent />
  );
  expect(getByTestId("wrap1")).toBeInTheDocument();
  expect(getByTestId("wrap2")).toBeInTheDocument();
  expect(getByTestId("wrap3")).toBeInTheDocument();
  expect(getByTestId("innerElement")).toBeInTheDocument();
  fireEvent.click(getByRole("button"));
  expect(getByTestId("wrap1")).toBeInTheDocument();
  expect(getByTestId("wrap2")).toBeInTheDocument();
  expect(queryByTestId("wrap3")).not.toBeInTheDocument();
  expect(getByTestId("wrap4")).toBeInTheDocument();
});
