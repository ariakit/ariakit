import { renderHook } from "react-hooks-testing-library";
import { jestSerializerStripFunctions } from "reakit-utils/jestSerializerStripFunctions";
import { useRadioState } from "../RadioState";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

test("initial state", () => {
  const { result } = renderHook(() => useRadioState());
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "currentId": null,
      "loop": true,
      "state": undefined,
      "stops": Array [],
      "unstable_pastId": null,
    }
  `);
});
