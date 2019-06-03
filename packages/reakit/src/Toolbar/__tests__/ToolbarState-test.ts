import { renderHook } from "react-hooks-testing-library";
import { jestSerializerStripFunctions } from "reakit-utils/jestSerializerStripFunctions";
import { useToolbarState } from "../ToolbarState";

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
      "orientation": "horizontal",
      "stops": Array [],
      "unstable_pastId": null,
    }
  `);
});
