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
  const result = render({
    unstable_hiddenId: "test",
    unstable_isMounted: true
  });
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

test("show animated", () => {
  jest.useFakeTimers();
  const result = render({
    unstable_hiddenId: "test",
    unstable_isMounted: true,
    unstable_animated: 1000
  });
  act(result.current.show);
  expect(result.current).toMatchInlineSnapshot(
    { visible: true, unstable_animating: true },
    `
    Object {
      "unstable_animated": 1000,
      "unstable_animating": true,
      "unstable_hiddenId": "test",
      "visible": true,
    }
  `
  );
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(result.current).toMatchInlineSnapshot(
    { visible: true, unstable_animating: false },
    `
    Object {
      "unstable_animated": 1000,
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

test("hide animated", () => {
  jest.useFakeTimers();
  const result = render({
    unstable_hiddenId: "test",
    visible: true,
    unstable_animated: 1000
  });
  act(result.current.hide);
  expect(result.current).toMatchInlineSnapshot(
    { visible: false, unstable_animating: true },
    `
    Object {
      "unstable_animated": 1000,
      "unstable_animating": true,
      "unstable_hiddenId": "test",
      "visible": false,
    }
  `
  );
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(result.current).toMatchInlineSnapshot(
    { visible: false, unstable_animating: false },
    `
    Object {
      "unstable_animated": 1000,
      "unstable_animating": false,
      "unstable_hiddenId": "test",
      "visible": false,
    }
  `
  );
});

test("toggle", () => {
  const result = render({
    unstable_hiddenId: "test",
    unstable_isMounted: true
  });
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
