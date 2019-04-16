import { renderHook } from "react-hooks-testing-library";
import { unstable_useSealedState } from "../useSealedState";

test("useSealedState", () => {
  const { result } = renderHook(() =>
    unstable_useSealedState({ a: "a", b: "b" })
  );
  expect(result.current).toEqual({ a: "a", b: "b" });
});
