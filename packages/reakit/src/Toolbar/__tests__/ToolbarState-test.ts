import { renderHook } from "reakit-test-utils/hooks";
import { jestSerializerStripFunctions } from "reakit-test-utils/jestSerializerStripFunctions";
import { useToolbarState, ToolbarInitialState } from "../ToolbarState";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render({
  baseId = "base",
  ...initialState
}: ToolbarInitialState = {}) {
  return renderHook(() => useToolbarState({ baseId, ...initialState })).result;
}

test("initial state", () => {
  const result = render();
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "baseId": "base",
      "currentId": null,
      "wrap": false,
      "groups": Array [],
      "items": Array [],
      "loop": false,
      "orientation": "horizontal",
      "rtl": false,
      "virtual": "roving-tabindex",
      "unstable_hasActiveWidget": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "moves": 0,
    }
  `);
});
