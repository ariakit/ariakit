import { renderHook } from "reakit-test-utils/hooks";
import { useId, IdProvider } from "../useId";

test("useId", () => {
  const { result } = renderHook(useId, {
    wrapper: IdProvider
  });
  expect(result.current).toBe("id-1");
});
