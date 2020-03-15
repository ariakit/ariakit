import { renderHook } from "reakit-test-utils/hooks";
import { jestSerializerStripFunctions } from "reakit-test-utils/jestSerializerStripFunctions";
import { useRadioState } from "../RadioState";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

test("initial state", () => {
  const { result } = renderHook(() => useRadioState({ baseId: "base" }));
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "baseId": "base",
      "currentId": null,
      "focusWrap": false,
      "groups": Array [],
      "items": Array [],
      "loop": true,
      "orientation": undefined,
      "rtl": false,
      "state": undefined,
      "unstable_focusStrategy": "roving-tabindex",
      "unstable_hasActiveWidget": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "unstable_moves": 0,
    }
  `);
});
