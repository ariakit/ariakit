import { setRef } from "../misc";

test("setRef", () => {
  const ref = { current: null };
  setRef(ref, "value");
  expect(ref.current).toBe("value");

  const ref2 = (val: any) => (ref.current = val);
  setRef(ref2, "value2");
  expect(ref.current).toBe("value2");

  const ref3 = null;
  setRef(ref3, "value3");
  expect(ref3).toBe(null);
});
