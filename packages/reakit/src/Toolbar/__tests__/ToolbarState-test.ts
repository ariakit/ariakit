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
  "currentId": null,
  "loop": false,
  "pastId": null,
  "stops": Array [],
}
`);
});
