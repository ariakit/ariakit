import { renderHook } from "react-hooks-testing-library";
import { useTabState } from "../TabState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

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
      "selectedId": null,
      "unstable_baseId": "base",
      "unstable_pastId": null,
      "unstable_stops": Array [],
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
      "selectedId": "a",
      "unstable_baseId": "base",
      "unstable_pastId": null,
      "unstable_stops": Array [],
    }
  `
  );
});
