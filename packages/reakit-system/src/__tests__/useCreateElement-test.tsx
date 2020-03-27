import * as React from "react";
import { renderHook } from "reakit-test-utils/hooks";
import { Provider } from "reakit/Provider";
import { useCreateElement } from "../useCreateElement";

test("useCreateElement", () => {
  const { result } = renderHook(() =>
    useCreateElement("div", { a: "a" }, "div")
  );
  expect(result.current).toMatchInlineSnapshot(`
    <div
      a="a"
    >
      div
    </div>
  `);
});

test("render props", () => {
  const { result } = renderHook(() =>
    useCreateElement("div", { a: "a" }, ({ a }: { a: string }) => (
      <div id={a}>div</div>
    ))
  );
  expect(result.current).toMatchInlineSnapshot(`
    <div
      id="a"
    >
      div
    </div>
  `);
});

test("context", () => {
  const { result } = renderHook(
    () => useCreateElement("div", { a: "a" }, "div"),
    {
      wrapper: ({ children }) => (
        <Provider
          unstable_system={{
            useCreateElement: (_, props, c) => <p {...props}>{c}</p>
          }}
        >
          {children}
        </Provider>
      )
    }
  );
  expect(result.current).toMatchInlineSnapshot(`
    <p
      a="a"
    >
      div
    </p>
  `);
});
