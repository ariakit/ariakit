import { renderHook } from "react-hooks-testing-library";
import { unstable_useRadioState } from "../RadioState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

test("initial state", () => {
  const { result } = renderHook(() => unstable_useRadioState());
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "currentValue": undefined,
  "unstable_currentId": null,
  "unstable_loop": true,
  "unstable_pastId": null,
  "unstable_stops": Array [],
}
`);
});
