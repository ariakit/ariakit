import { renderHook } from "@testing-library/react-hooks";
import { jestSerializerStripFunctions } from "reakit-utils/jestSerializerStripFunctions";
import { useTabState } from "../TabState";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(...args: Parameters<typeof useTabState>) {
  return renderHook(() => useTabState(...args)).result;
}

test("initial state", () => {
  const result = render({ unstable_baseId: "base" });
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "currentId": null,
      "loop": true,
      "manual": false,
      "orientation": undefined,
      "selectedId": null,
      "stops": Array [],
      "unstable_baseId": "base",
      "unstable_moves": 0,
      "unstable_pastId": null,
    }
  `);
});

test("initial state selectedId", () => {
  const result = render({ unstable_baseId: "base", selectedId: "a" });
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: "a",
      selectedId: "a"
    },
    `
    Object {
      "currentId": "a",
      "loop": true,
      "manual": false,
      "orientation": undefined,
      "selectedId": "a",
      "stops": Array [],
      "unstable_baseId": "base",
      "unstable_moves": 0,
      "unstable_pastId": null,
    }
  `
  );
});
