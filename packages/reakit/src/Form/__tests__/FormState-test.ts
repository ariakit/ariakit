import { renderHook } from "react-hooks-testing-library";
import { useFormState } from "../FormState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(...args: Parameters<typeof useFormState>) {
  return renderHook(() => useFormState(...args)).result;
}

test("initial state", () => {
  const result = render();
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "baseId": "form-377dah",
  "errors": Object {},
  "initialValues": Object {},
  "messages": Object {},
  "submitFailed": 0,
  "submitSucceed": 0,
  "submitting": false,
  "touched": Object {},
  "valid": true,
  "validating": false,
  "values": Object {},
}
`);
});

test.todo("initial state baseId");
test.todo("initial state initialValues");
test.todo("reset");
test.todo("validate");
test.todo("submit");
test.todo("update");
test.todo("blur");
test.todo("push");
test.todo("remove");
