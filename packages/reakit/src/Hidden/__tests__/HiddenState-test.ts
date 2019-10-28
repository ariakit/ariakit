import { renderHook, act } from "@testing-library/react-hooks";
import { jestSerializerStripFunctions } from "reakit-utils/jestSerializerStripFunctions";
import { useHiddenState } from "../HiddenState";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(...args: Parameters<typeof useHiddenState>) {
  return renderHook(() => useHiddenState(...args)).result;
}

test("initial state", () => {
  const result = render({ baseId: "test" });
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "baseId": "test",
      "unstable_animated": false,
      "unstable_animating": false,
      "visible": false,
    }
  `);
});

test("initial state visible", () => {
  const result = render({ baseId: "test", visible: true });
  expect(result.current).toMatchInlineSnapshot(
    {
      visible: true
    },
    `
    Object {
      "baseId": "test",
      "unstable_animated": false,
      "unstable_animating": false,
      "visible": true,
    }
  `
  );
});

test("initial state lazy", () => {
  const result = render(() => ({ baseId: "test", visible: true }));
  expect(result.current).toMatchInlineSnapshot(
    {
      visible: true
    },
    `
    Object {
      "baseId": "test",
      "unstable_animated": false,
      "unstable_animating": false,
      "visible": true,
    }
  `
  );
});

test("show", () => {
  const result = render({
    baseId: "test",
    unstable_isMounted: true
  });
  act(result.current.show);
  expect(result.current).toMatchInlineSnapshot(
    { visible: true },
    `
    Object {
      "baseId": "test",
      "unstable_animated": false,
      "unstable_animating": false,
      "visible": true,
    }
  `
  );
});

test("show animated", () => {
  jest.useFakeTimers();
  const result = render({
    baseId: "test",
    unstable_isMounted: true,
    unstable_animated: 1000
  });
  act(result.current.show);
  expect(result.current).toMatchInlineSnapshot(
    { visible: true, unstable_animating: true },
    `
    Object {
      "baseId": "test",
      "unstable_animated": 1000,
      "unstable_animating": true,
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
      "baseId": "test",
      "unstable_animated": 1000,
      "unstable_animating": false,
      "visible": true,
    }
  `
  );
});

test("hide", () => {
  const result = render({ baseId: "test", visible: true });
  act(result.current.hide);
  expect(result.current).toMatchInlineSnapshot(
    { visible: false },
    `
    Object {
      "baseId": "test",
      "unstable_animated": false,
      "unstable_animating": false,
      "visible": false,
    }
  `
  );
});

test("hide animated", () => {
  jest.useFakeTimers();
  const result = render({
    baseId: "test",
    visible: true,
    unstable_animated: 1000
  });
  act(result.current.hide);
  expect(result.current).toMatchInlineSnapshot(
    { visible: false, unstable_animating: true },
    `
    Object {
      "baseId": "test",
      "unstable_animated": 1000,
      "unstable_animating": true,
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
      "baseId": "test",
      "unstable_animated": 1000,
      "unstable_animating": false,
      "visible": false,
    }
  `
  );
});

test("toggle", () => {
  const result = render({
    baseId: "test",
    unstable_isMounted: true
  });
  act(result.current.toggle);
  expect(result.current).toMatchInlineSnapshot(
    { visible: true },
    `
    Object {
      "baseId": "test",
      "unstable_animated": false,
      "unstable_animating": false,
      "visible": true,
    }
  `
  );
});
