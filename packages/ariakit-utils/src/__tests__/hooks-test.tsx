import { useEffect, useRef, useState } from "react";
import { fireEvent } from "@testing-library/react";
import { render, sleep } from "ariakit-test";

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
      <div>
        <button onClick={() => setSomeState("some new value")} />
        {initialValue}
      </div>
    );
  };
  const { container } = render(<TestComponent />);
  expect(container).toHaveTextContent("some value");
  fireEvent.click(container.querySelector("button")!);
  expect(container).toHaveTextContent("some value");
});

test("useLazyValue", () => {
  const TestComponent = () => {
    const [someState, setSomeState] = useState("some value");
    const lazyValue = useLazyValue(() => someState);

    return (
      <div>
        <button onClick={() => setSomeState("some new value")} />
        {lazyValue}
      </div>
    );
  };
  const { container } = render(<TestComponent />);
  expect(container).toHaveTextContent("some value");
  fireEvent.click(container.querySelector("button")!);
  expect(container).toHaveTextContent("some value");
});

test("useLiveRef", async () => {
  const TestComponent = () => {
    const [someState, setSomeState] = useState("some value");
    const [_, update] = useForceUpdate();
    const liveRef = useLiveRef(someState);

    return (
      <div>
        <button
          onClick={() => {
            setSomeState("some new value");
            // This is hacky but in order to test the ref value after the useEffect happens we must re-render another time
            // Even though canUseDOM is true, it seems like the ref value is being updated after the render (not synchronously)
            setTimeout(() => update(), 0);
          }}
        />
        {liveRef.current}
      </div>
    );
  };
  const { container } = render(<TestComponent />);
  expect(container).toHaveTextContent("some value");
  fireEvent.click(container.querySelector("button")!);
  await sleep();
  expect(container).toHaveTextContent("some new value");

  // Leaving this here for discussion. Interesting when using renderHook, things behave differently
  //
  // const { result, rerender } = renderHook((value) => useLiveRef(value), {
  //   initialProps: "some value",
  // });
  // expect(result.current.current).toBe("some value");
  // rerender("new value");
  // expect(result.current.current).toBe("new value");
});

test("usePreviousValue", () => {
  const duringRender = jest.fn();
  const TestComponent = () => {
    const [someState, setSomeState] = useState("some value");
    const prevValue = usePreviousValue(someState);
    duringRender(prevValue);

    return (
      <div>
        <button onClick={() => setSomeState("some new value")} />
        {prevValue}
      </div>
    );
  };
  const { container } = render(<TestComponent />);
  expect(container).toHaveTextContent("some value");
  fireEvent.click(container.querySelector("button")!);
  expect(duringRender).nthCalledWith(1, "some value");
  expect(duringRender).nthCalledWith(2, "some value");
  expect(duringRender).nthCalledWith(3, "some new value");
  expect(container).toHaveTextContent("some new value");
});

test("useEvent", () => {
  // Check function is stable
  const effectFunction = jest.fn();
  const TestComponent = () => {
    const [callback, setCallback] = useState(() => effectFunction);
    const result = useEvent(callback);
    useEffect(() => {
      effectFunction();
    }, [result]);

    return <button onClick={() => setCallback(jest.fn())} />;
  };
  const { container } = render(<TestComponent />);
  expect(effectFunction).toBeCalledTimes(1);
  fireEvent.click(container.querySelector("button")!);
  expect(effectFunction).toBeCalledTimes(1);

  // Check that error is thrown during render
  let error: Error | undefined;
  const TestComponent2 = () => {
    const result = useEvent(jest.fn());

    try {
      result();
    } catch (e) {
      if (e instanceof Error) {
        error = e;
      }
    }

    return <div />;
  };
  expect(error).toBeUndefined();
  render(<TestComponent2 />);
  expect(error).toBeDefined();
});

test("useForkRef", () => {
  const ref1 = jest.fn();
  const ref2 = jest.fn();
  const TestComponent = () => {
    const internalRef = useRef();
    const ref = useForkRef(internalRef, ref1, ref2);

    return <button ref={ref} />;
  };

  const { container } = render(<TestComponent />);
  expect(ref1).toBeCalledTimes(1);
  expect(ref2).toBeCalledTimes(1);
  const button = container.querySelector("button")!;
  expect(ref1).toHaveBeenCalledWith(button);
  expect(ref2).toHaveBeenCalledWith(button);

  // No refs case
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

  // Undefined case
  let idVal2: string | undefined;
  const TestComponent2 = () => {
    const id = useRefId();
    idVal = id;
    return <div />;
  };
  expect(idVal2).toBeUndefined();
  render(<TestComponent2 />);
  expect(idVal2).toBeUndefined();
});

test("useId", () => {
  // Case where react id is defined
  const TestComponent = () => {
    const [idState, setIdState] = useState("");
    const id = useId(idState);

    return <button onClick={() => setIdState("some-id")} id={id} />;
  };
  const { container } = render(<TestComponent />);
  const button = container.querySelector("button")!;
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

  // With type case
  let tagNameVal2: string | undefined;
  const TestComponent2 = () => {
    const ref = useRef<HTMLDivElement>(null);
    const tagName = useTagName(ref, "button");
    tagNameVal2 = tagName;

    return <div ref={ref} />;
  };
  render(<TestComponent2 />);
  expect(tagNameVal2).toBe("div");

  // Undefined case
  let tagNameVal3: string | undefined;
  const TestComponent3 = () => {
    const ref = useRef<HTMLDivElement>(null);
    const tagName = useTagName(ref, "button");
    tagNameVal3 = tagName;
    return <div />;
  };
  render(<TestComponent3 />);
  expect(tagNameVal3).toBe("button");
});

test("useUpdateEffect", () => {
  const effectFunction = jest.fn();
  const TestComponent = (props: { somePropVale: number }) => {
    const { somePropVale } = props;

    useUpdateEffect(() => {
      effectFunction();
    }, [somePropVale]);

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

    useUpdateLayoutEffect(() => {
      effectFunction();
    }, [somePropVale]);

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
        <button id="controlled" onClick={() => setControlled(!controlled)} />
        <button id="update-state" onClick={() => setState("some-state")} />
        <button
          id="update-controlled-state"
          onClick={() => setControlledState("some-controlled-state")}
        />
        <button
          id="reset"
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
  const { container } = render(<TestComponent />);
  const controlled = container.querySelector("#controlled")!;
  const updateState = container.querySelector("#update-state")!;
  const updateControlledState = container.querySelector(
    "#update-controlled-state"
  )!;
  const reset = container.querySelector("#reset")!;
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
    useEffect(() => {
      forceUpdateFunc();
    }, []);
    return <button onClick={() => forceUpdateFunc()} />;
  };
  render(<TestComponent />);
  // Should render twice on mount
  expect(someFunction).toBeCalledTimes(2);
  const button = document.querySelector("button")!;
  fireEvent.click(button);
  expect(someFunction).toBeCalledTimes(3);
});

test("useBooleanEvent", () => {
  const someFunc = jest.fn();
  const TestComponent = () => {
    const func = useBooleanEvent(() => true);
    const bool = useBooleanEvent(true);

    return (
      <div>
        <button id="func" onClick={() => (func() ? someFunc("func") : null)} />
        <button id="bool" onClick={() => (bool() ? someFunc("bool") : null)} />
      </div>
    );
  };
  const { container } = render(<TestComponent />);
  const func = container.querySelector("#func")!;
  const bool = container.querySelector("#bool")!;
  fireEvent.click(func);
  expect(someFunc).toBeCalledTimes(1);
  expect(someFunc).toBeCalledWith("func");
  fireEvent.click(bool);
  expect(someFunc).toBeCalledTimes(2);
  expect(someFunc).toBeCalledWith("bool");
});

test("useWrapElement", () => {
  const DeeplyWrappedComponent = () => {
    const [count, setCount] = useState(3);
    const newProps1 = useWrapElement({}, (element) => (
      <div id="wrap1">{element}</div>
    ));
    const newProps2 = useWrapElement(newProps1, (element) => (
      <div id="wrap2">{element}</div>
    ));
    const newProps3 = useWrapElement(
      newProps2,
      (element) => <div id={`wrap${count}`}>{element}</div>,
      [count]
    );
    return newProps3.wrapElement(
      <div id="innerElement">
        <button onClick={() => setCount(count + 1)}>Click me</button>
      </div>
    );
  };
  const { container } = render(<DeeplyWrappedComponent />);
  expect(container.querySelector("#wrap1")).toBeInTheDocument();
  expect(container.querySelector("#wrap2")).toBeInTheDocument();
  expect(container.querySelector("#wrap3")).toBeInTheDocument();
  expect(container.querySelector("#innerElement")).toBeInTheDocument();

  const button = container.querySelector("button")!;
  fireEvent.click(button);
  expect(container.querySelector("#wrap1")).toBeInTheDocument();
  expect(container.querySelector("#wrap2")).toBeInTheDocument();
  expect(container.querySelector("#wrap3")).not.toBeInTheDocument();
  expect(container.querySelector("#wrap4")).toBeInTheDocument();
});
