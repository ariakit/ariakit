import { renderHook, act } from "react-hooks-testing-library";
import { useRadioState } from "../RadioState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(...args: Parameters<typeof useRadioState>) {
  return renderHook(() => useRadioState(...args)).result;
}

test("initial state", () => {
  const result = render();
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "currentId": null,
  "currentValue": undefined,
  "loop": false,
  "pastId": null,
  "stops": Array [],
}
`);
});
