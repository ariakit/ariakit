import * as React from "react";
import { renderHook } from "react-hooks-testing-library";
import { unstable_useCreateElement } from "../useCreateElement";
import { Provider } from "../Provider";

test("useCreateElement", () => {
  const { result } = renderHook(() =>
    unstable_useCreateElement("div", { a: "a" }, "div")
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
    unstable_useCreateElement("div", { a: "a" }, ({ a }: { a: string }) => (
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
    () => unstable_useCreateElement("div", { a: "a" }, "div"),
    {
      wrapper: ({ children }) => (
        <Provider
          system={{
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
