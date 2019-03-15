import { renderHook, act } from "react-hooks-testing-library";
import { useHiddenState } from "../HiddenState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(props: Parameters<typeof useHiddenState>[0] = {}) {
  return renderHook(useHiddenState, {
    initialProps: { refId: "test", ...props }
  }).result;
}

test("initial state", () => {
  const result = render();
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "refId": "test",
  "visible": false,
}
`);
});

test("initial state visible", () => {
  const result = render({ visible: true });
  expect(result.current).toMatchInlineSnapshot(
    {
      visible: true
    },
    `
Object {
  "refId": "test",
  "visible": true,
}
`
  );
});

test("show", () => {
  const result = render();
  act(result.current.show);
  expect(result.current).toMatchInlineSnapshot(
    { visible: true },
    `
Object {
  "refId": "test",
  "visible": true,
}
`
  );
});

test("hide", () => {
  const result = render({ visible: true });
  act(result.current.hide);
  expect(result.current).toMatchInlineSnapshot(
    { visible: false },
    `
Object {
  "refId": "test",
  "visible": false,
}
`
  );
});

test("toggle", () => {
  const result = render();
  act(result.current.toggle);
  expect(result.current).toMatchInlineSnapshot(
    { visible: true },
    `
Object {
  "refId": "test",
  "visible": true,
}
`
  );
});
