import { renderHook, act } from "react-hooks-testing-library";
import { useCheckboxState } from "../CheckboxState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(...args: Parameters<typeof useCheckboxState>) {
  return renderHook(() => useCheckboxState(...args)).result;
}

test("initial state", () => {
  const result = render();
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "currentValue": false,
}
`);
});

test("initial state currentValue", () => {
  const result = render({ currentValue: true });
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "currentValue": true,
}
`);
});

test("initial state array currentValue", () => {
  const result = render({ currentValue: ["a", "b"] });
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "currentValue": Array [
    "a",
    "b",
  ],
}
`);
});

test("setValue", () => {
  const result = render();
  act(() => result.current.setValue(true));
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "currentValue": true,
}
`);
});
