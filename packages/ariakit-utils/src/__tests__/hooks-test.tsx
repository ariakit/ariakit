import { useEffect, useRef, useState } from "react";
import { fireEvent, render, renderHook } from "@testing-library/react";
import { AnyFunction } from "ariakit-utils/types";

import {
  useBooleanEvent,
  useControlledState,
  useDeferredValue,
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
  const { result, rerender } = renderHook((value) => useInitialValue(value), {
    initialProps: "some value",
  });
  expect(result.current).toBe("some value");
  rerender("new value");
  expect(result.current).toBe("some value");
});

test("useLazyValue", () => {
  const firstSet = new Set();
  const { result, rerender } = renderHook((value) => useLazyValue(value), {
    initialProps: () => firstSet,
  });
  expect(result.current).toBe(firstSet);
  rerender(() => new Set());
  expect(result.current).toBe(firstSet);
});

test("useLiveRef", () => {
  const { result, rerender } = renderHook((value) => useLiveRef(value), {
    initialProps: "some value",
  });
  expect(result.current.current).toBe("some value");
  rerender("new value");
  expect(result.current.current).toBe("new value");
});

test("usePreviousValue", () => {
  const duringRender = jest.fn();
  const { result, rerender } = renderHook(
    (value) => {
      const result = usePreviousValue(value);
      duringRender(result);
      return result;
    },
    {
      initialProps: "some value",
    }
  );
  expect(result.current).toBe("some value");
  rerender("new value");
  expect(duringRender).toHaveBeenCalledWith("some value");
  expect(result.current).toBe("new value");
});

test("useEvent", () => {
  // Check function is stable
  const effectFunction = jest.fn();
  const { rerender } = renderHook(
    (callback: AnyFunction) => {
      const result = useEvent(callback);
      useEffect(() => {
        effectFunction();
      }, [result]);

      return result;
    },
    {
      initialProps: jest.fn(),
    }
  );
  expect(effectFunction).toBeCalledTimes(1);
  rerender(jest.fn());
  expect(effectFunction).toBeCalledTimes(1);

  // Check that error is thrown during render
  let error: Error | undefined;
  renderHook(
    (callback: AnyFunction) => {
      const result = useEvent(callback);

      try {
        result();
      } catch (e) {
        if (e instanceof Error) {
          error = e;
        }
      }

      return result;
    },
    {
      initialProps: jest.fn(),
    }
  );
  expect(error).toBeDefined();
});

test("useForkRef", () => {
  const ref1 = jest.fn();
  const ref2 = jest.fn();
  const { result } = renderHook(() => {
    const internalRef = useRef();
    const result = useForkRef(internalRef, ref1, ref2);

    return result;
  });
  expect(typeof result.current).toBe("function");
  result.current?.("new value");
  expect(ref1).toHaveBeenCalledWith("new value");
  expect(ref2).toHaveBeenCalledWith("new value");
  result.current?.("new value2");
  expect(ref1).toHaveBeenCalledWith("new value2");
  expect(ref2).toHaveBeenCalledWith("new value2");

  // No refs case
  const { result: result2 } = renderHook(() => useForkRef());
  expect(result2.current).toBeUndefined();
});

test("useRefId", () => {
  const element = document.createElement("div");
  element.id = "some-id";
  const { result } = renderHook(() => {
    const ref = useRef(element);
    return useRefId(ref);
  });
  expect(result.current).toBe(element.id);

  // Undefined case
  const { result: result2 } = renderHook(() => useRefId());
  expect(result2.current).toBeUndefined();
});

test("useId", () => {
  // Case where react id is defined
  const { result, rerender } = renderHook((defaultId?: string) =>
    useId(defaultId)
  );
  expect(result.current).toBeTruthy();
  rerender("new id");
  expect(result.current).toBe("new id");

  // Case where react id is not defined
  // Not sure how to do this since useReactId is defined in this file
});

test("useDeferredValue", () => {
  // Case where useDeferredValue is defined
  const { result, rerender } = renderHook((value) => useDeferredValue(value));
  expect(result.current).toBeUndefined();
  rerender("new value");
  expect(result.current).toBe("new value");

  // Case where useDeferredValue is not defined
  // Not sure how to do this since useReactDeferredValue is defined in this file
});

test("useTagName", () => {
  const element = document.createElement("div");
  const { result } = renderHook(() => {
    const ref = useRef(element);
    return useTagName(ref);
  });
  expect(result.current).toBe("div");

  // With type case
  const { result: result2 } = renderHook(() => {
    const ref = useRef(element);
    return useTagName(ref, "button");
  });
  expect(result2.current).toBe("div");

  // Undefined case
  const { result: result3 } = renderHook(() => {
    return useTagName(undefined, "button");
  });
  expect(result3.current).toBe("button");
});

test("useUpdateEffect", () => {
  const effectFunction = jest.fn();
  const { rerender } = renderHook((someDep?: any) => {
    useUpdateEffect(() => {
      effectFunction();
    }, [someDep]);
  });
  expect(effectFunction).toBeCalledTimes(0);
  rerender("some val");
  expect(effectFunction).toBeCalledTimes(1);
  rerender("some val");
  expect(effectFunction).toBeCalledTimes(1);
  rerender("some val2");
  expect(effectFunction).toBeCalledTimes(2);
});

test("useUpdateLayoutEffect", () => {
  const effectFunction = jest.fn();
  const { rerender } = renderHook((someDep?: any) => {
    useUpdateLayoutEffect(() => {
      effectFunction();
    }, [someDep]);
  });
  expect(effectFunction).toBeCalledTimes(0);
  rerender("some val");
  expect(effectFunction).toBeCalledTimes(1);
  rerender("some val");
  expect(effectFunction).toBeCalledTimes(1);
  rerender("some val2");
  expect(effectFunction).toBeCalledTimes(2);
});

test("useControlledState", () => {
  const { result } = renderHook(() => useControlledState("initial value"));
  const [value, setValue] = result.current;
  expect(value).toBe("initial value");
  expect(typeof setValue).toBe("function");

  // Case where state and setState are defined
  const { result: result2, rerender } = renderHook(
    (props: { valueToUpdate: string; controlled: boolean }) => {
      const { valueToUpdate, controlled } = props;
      const [state, setState] = useState(valueToUpdate);
      const [controlledState, setControlledState] = useControlledState(
        "default state",
        controlled ? state : undefined,
        controlled ? setState : undefined
      );

      useEffect(() => {
        setControlledState(valueToUpdate);
      }, [valueToUpdate]);

      return [controlledState, setControlledState];
    },
    { initialProps: { valueToUpdate: "initial value2", controlled: true } }
  );
  expect(result2.current[0]).toBe("initial value2");
  expect(typeof result2.current[1]).toBe("function");
  rerender({ valueToUpdate: "new value", controlled: true });
  expect(result2.current[0]).toBe("new value");
  rerender({ valueToUpdate: "new value2", controlled: true });
  expect(result2.current[0]).toBe("new value2");

  // Case where state and setState are not defined
  rerender({ valueToUpdate: "new value3", controlled: false });
  expect(result2.current[0]).toBe("new value3");
});

test("useForceUpdate", () => {
  const someFunction = jest.fn();
  let updateCount = 0;

  const { rerender } = renderHook(
    (maxUpdateCount: number) => {
      const [state, forceUpdateFunc] = useForceUpdate();

      someFunction();
      useEffect(() => {
        if (updateCount !== maxUpdateCount) {
          forceUpdateFunc();
          updateCount = maxUpdateCount;
        }
      }, [maxUpdateCount]);

      return [state, forceUpdateFunc];
    },
    { initialProps: 0 }
  );
  expect(someFunction).toBeCalledTimes(1);
  rerender(updateCount + 1);
  expect(someFunction).toBeCalledTimes(3);
});

test("useBooleanEvent", () => {
  const { result } = renderHook(() => useBooleanEvent(() => true));
  expect(typeof result.current).toBe("function");
  expect(result.current()).toBe(true);

  // Case where its a boolean
  const { result: result2 } = renderHook(() => useBooleanEvent(true));
  expect(typeof result2.current).toBe("function");
  expect(result2.current()).toBe(true);
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
