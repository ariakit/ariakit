import { renderHook, act } from "@testing-library/react-hooks";
import { jestSerializerStripFunctions } from "reakit-utils/jestSerializerStripFunctions";
import { useHiddenState } from "../HiddenState";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(...args: Parameters<typeof useHiddenState>) {
  return renderHook(() => useHiddenState(...args)).result;
}

test("initial state", () => {
  const result = render({ unstable_hiddenId: "test" });
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "unstable_animated": false,
      "unstable_animating": false,
      "unstable_hiddenId": "test",
      "visible": false,
    }
  `);
});

test("initial state visible", () => {
  const result = render({ unstable_hiddenId: "test", visible: true });
  expect(result.current).toMatchInlineSnapshot(
    {
      visible: true
    },
    `
    Object {
      "unstable_animated": false,
      "unstable_animating": false,
      "unstable_hiddenId": "test",
      "visible": true,
    }
  `
  );
});

test("initial state lazy", () => {
  const result = render(() => ({ unstable_hiddenId: "test", visible: true }));
  expect(result.current).toMatchInlineSnapshot(
    {
      visible: true
    },
    `
    Object {
      "unstable_animated": false,
      "unstable_animating": false,
      "unstable_hiddenId": "test",
      "visible": true,
    }
  `
  );
});

test("show", () => {
  const result = render({ unstable_hiddenId: "test" });
  act(result.current.show);
  expect(result.current).toMatchInlineSnapshot(
    { visible: true },
    `
    Object {
      "unstable_animated": false,
      "unstable_animating": false,
      "unstable_hiddenId": "test",
      "visible": true,
    }
  `
  );
});

test("hide", () => {
  const result = render({ unstable_hiddenId: "test", visible: true });
  act(result.current.hide);
  expect(result.current).toMatchInlineSnapshot(
    { visible: false },
    `
    Object {
      "unstable_animated": false,
      "unstable_animating": false,
      "unstable_hiddenId": "test",
      "visible": false,
    }
  `
  );
});

test("toggle", () => {
  const result = render({ unstable_hiddenId: "test" });
  act(result.current.toggle);
  expect(result.current).toMatchInlineSnapshot(
    { visible: true },
    `
    Object {
      "unstable_animated": false,
      "unstable_animating": false,
      "unstable_hiddenId": "test",
      "visible": true,
    }
  `
  );
});
