import { renderHook } from "@testing-library/react-hooks";
import { jestSerializerStripFunctions } from "reakit-utils/jestSerializerStripFunctions";
import { useRadioState } from "../RadioState";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

test("initial state", () => {
  const { result } = renderHook(() => useRadioState({ baseId: "base" }));
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "baseId": "base",
      "currentId": null,
      "loop": true,
      "orientation": undefined,
      "state": undefined,
      "stops": Array [],
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "unstable_moves": 0,
      "unstable_pastId": null,
    }
  `);
});
