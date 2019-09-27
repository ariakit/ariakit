import * as React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { Provider } from "reakit";
import * as system from "../..";
import { useContrast, useContrastRatio } from "../contrast";

function render<T extends (...args: any[]) => any>(
  useHook: T,
  ...args: Parameters<T>
) {
  return renderHook(() => useHook(...args), {
    wrapper: (props: { children: React.ReactNode }) => (
      <Provider unstable_system={system} {...props} />
    )
  }).result;
}

test("useContrastRatio", () => {
  expect(render(useContrastRatio, "#000", "#fff").current).toBe(21);
  expect(render(useContrastRatio, "red", "blue").current).toBeCloseTo(2.148);
});

test("useContrast", () => {
  expect(render(useContrast, "#000").current).toBe("#ffffff");
  expect(render(useContrast, "#fff").current).toBe("#212121");
  expect(render(useContrast).current).toBeUndefined();
});
