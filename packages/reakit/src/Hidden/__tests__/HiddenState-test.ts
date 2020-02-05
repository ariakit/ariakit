import { renderHook } from "reakit-test-utils/hooks";
import { useHiddenState } from "../HiddenState";

function render(...args: Parameters<typeof useHiddenState>) {
  return renderHook(() => useHiddenState(...args)).result;
}

test("initial state", () => {
  render({ baseId: "base" });
  expect(console).toHaveWarned();
});
