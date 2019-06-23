import { renderHook } from "@testing-library/react-hooks";
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
      "unstable_moves": 0,
      "unstable_pastId": null,
    }
  `);
});
