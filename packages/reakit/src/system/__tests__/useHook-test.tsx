import * as React from "react";
import { renderHook } from "react-hooks-testing-library";

import { useHook } from "../useHook";
import {
  unstable_SystemProvider as SystemProvider,
  unstable_SystemProviderProps
} from "../SystemProvider";
import { unstable_SystemContextType } from "../SystemContext";

function render(
  system?: unstable_SystemContextType,
  ...args: Parameters<typeof useHook>
) {
  return renderHook(() => useHook(...args), {
    wrapper: (props: unstable_SystemProviderProps) => (
      <SystemProvider system={system} {...props} />
    )
  }).result;
}

test("useHook", () => {
  const result = render(
    {
      useA: (options: { a: string }) => options.a
    },
    "useA",
    { a: "a" }
  );
  expect(result.current).toBe("a");
});

test("default return", () => {
  const result = render(undefined, "useA", undefined, { id: "id" });
  expect(result.current).toEqual({ id: "id" });
});
