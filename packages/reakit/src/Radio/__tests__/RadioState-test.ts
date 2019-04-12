import { renderHook } from "react-hooks-testing-library";
import { useRadioState } from "../RadioState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

test("initial state", () => {
  const { result } = renderHook(() => useRadioState());
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "currentId": null,
      "currentValue": undefined,
      "unstable_loop": true,
      "unstable_pastId": null,
      "unstable_stops": Array [],
    }
  `);
});
