import { renderHook } from "react-hooks-testing-library";
import { useTabState } from "../TabState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(...args: Parameters<typeof useTabState>) {
  return renderHook(() => useTabState(...args)).result;
}

test("initial state", () => {
  const result = render({ baseId: "base" });
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "baseId": "base",
  "currentId": null,
  "loop": true,
  "manual": false,
  "pastId": null,
  "selectedId": null,
  "stops": Array [],
}
`);
});

test("initial state selectedId", () => {
  const result = render({ baseId: "base", selectedId: "a" });
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
  "pastId": null,
  "selectedId": "a",
  "stops": Array [],
}
`
  );
});
