import { renderHook } from "@testing-library/react-hooks";
import { jestSerializerStripFunctions } from "reakit-utils/jestSerializerStripFunctions";
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
      "loop": true,
      "manual": false,
      "orientation": undefined,
      "selectedId": null,
      "stops": Array [],
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "unstable_moves": 0,
      "unstable_pastId": null,
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
      "loop": true,
      "manual": false,
      "orientation": undefined,
      "selectedId": "a",
      "stops": Array [],
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "unstable_moves": 0,
      "unstable_pastId": null,
    }
  `
  );
});
