import { renderHook } from "react-hooks-testing-library";
import { useId, IdProvider } from "../useId";

test("useId", () => {
  const { result } = renderHook(useId, {
    wrapper: IdProvider
  });
  expect(result.current).toBe("id-1");
});
