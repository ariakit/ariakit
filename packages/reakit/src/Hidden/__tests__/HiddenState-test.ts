import { renderHook, act } from "react-hooks-testing-library";

import { useHiddenState } from "../HiddenState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(...args: Parameters<typeof useHiddenState>) {
  return renderHook(() => useHiddenState(...args)).result;
}

test("initial state", () => {
  const result = render({ hiddenId: "test" });
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "hiddenId": "test",
  "visible": false,
}
`);
});

test("initial state visible", () => {
  const result = render({ hiddenId: "test", visible: true });
  expect(result.current).toMatchInlineSnapshot(
    {
      visible: true
    },
    `
Object {
  "hiddenId": "test",
  "visible": true,
}
`
  );
});

test("initial state lazy", () => {
  const result = render(() => ({ hiddenId: "test", visible: true }));
  expect(result.current).toMatchInlineSnapshot(
    {
      visible: true
    },
    `
Object {
  "hiddenId": "test",
  "visible": true,
}
`
  );
});

test("show", () => {
  const result = render({ hiddenId: "test" });
  act(result.current.show);
  expect(result.current).toMatchInlineSnapshot(
    { visible: true },
    `
Object {
  "hiddenId": "test",
  "visible": true,
}
`
  );
});

test("hide", () => {
  const result = render({ hiddenId: "test", visible: true });
  act(result.current.hide);
  expect(result.current).toMatchInlineSnapshot(
    { visible: false },
    `
Object {
  "hiddenId": "test",
  "visible": false,
}
`
  );
});

test("toggle", () => {
  const result = render({ hiddenId: "test" });
  act(result.current.toggle);
  expect(result.current).toMatchInlineSnapshot(
    { visible: true },
    `
Object {
  "hiddenId": "test",
  "visible": true,
}
`
  );
});
