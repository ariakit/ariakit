import { renderHook } from "react-hooks-testing-library";
import { useToolbarState } from "../ToolbarState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(...args: Parameters<typeof useToolbarState>) {
  return renderHook(() => useToolbarState(...args)).result;
}

test("initial state", () => {
  const result = render();
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "unstable_currentId": null,
  "unstable_loop": false,
  "unstable_pastId": null,
  "unstable_stops": Array [],
}
`);
});
