import { renderHook } from "react-hooks-testing-library";
import { useToolbarState } from "../ToolbarState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(props?: Parameters<typeof useToolbarState>[0]) {
  return renderHook(useToolbarState, {
    initialProps: props
  }).result;
}

test("initial state", () => {
  const result = render();
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "activeRef": null,
  "enabled": Array [],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [],
}
`);
});
