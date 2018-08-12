import { initialState } from "../TabsContainer";

test("initialState", () => {
  expect(initialState).toEqual({
    loop: true,
    current: 0
  });
});
