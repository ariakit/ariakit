import getSelector from "../getSelector";

test("getClassName", () => {
  expect(getSelector({})).toBe("");
  expect(getSelector({ styledComponentId: "foo" })).toBe(".foo");
});
