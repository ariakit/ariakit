import * as React from "react";
import { renderHook } from "react-hooks-testing-library";
import { unstable_useToken } from "../useToken";
import {
  unstable_SystemProvider as SystemProvider,
  unstable_SystemProviderProps
} from "../SystemProvider";
import { unstable_SystemContextType } from "../SystemContext";

function render(
  system: unstable_SystemContextType,
  ...args: Parameters<typeof unstable_useToken>
) {
  return renderHook(() => unstable_useToken(...args), {
    wrapper: (props: unstable_SystemProviderProps) => (
      <SystemProvider unstable_system={system} {...props} />
    )
  }).result;
}

test("useToken", () => {
  const result = render({ a: "a" }, "a");
  expect(result.current).toBe("a");
});

test("default value", () => {
  const result = render({ a: "a" }, "b", "b");
  expect(result.current).toBe("b");
});
