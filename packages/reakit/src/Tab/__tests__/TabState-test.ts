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
      "currentId": null,
      "focusWrap": false,
      "groups": Array [],
      "items": Array [],
      "loop": true,
      "manual": false,
      "orientation": undefined,
      "panels": Array [],
      "rtl": false,
      "selectedId": null,
      "unstable_focusStrategy": "roving-tabindex",
      "unstable_hasActiveWidget": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "unstable_moves": 0,
    }
  `);
});

test("initial state selectedId", () => {
  const result = render({ selectedId: "a" });
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: "a",
      selectedId: "a"
    },
    `
    Object {
      "baseId": "base",
      "currentId": "a",
      "focusWrap": false,
      "groups": Array [],
      "items": Array [],
      "loop": true,
      "manual": false,
      "orientation": undefined,
      "panels": Array [],
      "rtl": false,
      "selectedId": "a",
      "unstable_focusStrategy": "roving-tabindex",
      "unstable_hasActiveWidget": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "unstable_moves": 0,
    }
  `
  );
});
