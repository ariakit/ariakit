import { renderHook } from "reakit-test-utils/hooks";
import { jestSerializerStripFunctions } from "reakit-test-utils/jestSerializerStripFunctions";
import { useTabState, TabInitialState } from "../TabState";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render({ baseId = "base", ...initialState }: TabInitialState = {}) {
  return renderHook(() => useTabState({ baseId, ...initialState })).result;
}

test("initial state", () => {
  const result = render();
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "baseId": "base",
      "currentId": undefined,
      "groups": Array [],
      "items": Array [],
      "loop": true,
      "manual": false,
      "moves": 0,
      "orientation": undefined,
      "panels": Array [],
      "rtl": false,
      "selectedId": undefined,
      "unstable_hasActiveWidget": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "virtual": false,
      "wrap": false,
    }
  `);
});
