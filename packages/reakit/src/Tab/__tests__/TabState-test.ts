import { renderHook } from "react-hooks-testing-library";
import { useTabState } from "../TabState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(props?: Parameters<typeof useTabState>[0]) {
  return renderHook(useTabState, {
    initialProps: { baseId: "base", ...props }
  }).result;
}

test("initial state", () => {
  const result = render();
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "activeRef": null,
  "autoSelect": true,
  "baseId": "base",
  "enabled": Array [],
  "lastActiveRef": null,
  "loop": true,
  "orientation": undefined,
  "refs": Array [],
  "selectedRef": null,
}
`);
});

test("initial state selectedRef", () => {
  const result = render({ selectedRef: "a" });
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "a",
      selectedRef: "a"
    },
    `
Object {
  "activeRef": "a",
  "autoSelect": true,
  "baseId": "base",
  "enabled": Array [],
  "lastActiveRef": null,
  "loop": true,
  "orientation": undefined,
  "refs": Array [],
  "selectedRef": "a",
}
`
  );
});
