import { renderHook, act } from "react-hooks-testing-library";
import { useHiddenState } from "../HiddenState";

function render(props: Parameters<typeof useHiddenState>[0] = {}) {
  return renderHook(useHiddenState, {
    initialProps: { refId: "test", ...props }
  }).result;
}

test("render", () => {
  const result = render();
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "hide": [Function],
  "refId": "test",
  "show": [Function],
  "toggle": [Function],
  "visible": false,
}
`);
});

test("visible initial state", () => {
  const result = render({ visible: true });
  expect(result.current).toEqual(
    expect.objectContaining({
      visible: true
    })
  );
});

test("show", () => {
  const result = render();
  act(result.current.show);
  expect(result.current).toEqual(
    expect.objectContaining({
      visible: true
    })
  );
});

test("hide", () => {
  const result = render({ visible: true });
  act(result.current.hide);
  expect(result.current).toEqual(
    expect.objectContaining({
      visible: false
    })
  );
});

test("toggle", () => {
  const result = render();
  act(result.current.toggle);
  expect(result.current).toEqual(
    expect.objectContaining({
      visible: true
    })
  );
});
