import * as React from "react";
import { renderHook } from "react-hooks-testing-library";
import { unstable_useProps } from "../useProps";
import {
  unstable_SystemProvider as SystemProvider,
  unstable_SystemProviderProps
} from "../SystemProvider";
import { unstable_SystemContextType } from "../SystemContext";

function render(
  system?: unstable_SystemContextType,
  ...args: Parameters<typeof unstable_useProps>
) {
  return renderHook(() => unstable_useProps(...args), {
    wrapper: (props: unstable_SystemProviderProps) => (
      <SystemProvider unstable_system={system} {...props} />
    )
  }).result;
}

test("useProps", () => {
  const result = render(
    {
      useAProps: (options: { a: string }) => options.a
    },
    "A",
    { a: "a" }
  );
  expect(result.current).toBe("a");
});

test("default return", () => {
  const result = render(undefined, "A", undefined, { id: "id" });
  expect(result.current).toEqual({ id: "id" });
});
