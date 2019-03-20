import { renderHook } from "react-hooks-testing-library";

import { unstable_useId, unstable_IdProvider } from "../useId";

test("useId", () => {
  const { result } = renderHook(unstable_useId, {
    wrapper: unstable_IdProvider
  });
  expect(result.current).toBe("id-1");
});
