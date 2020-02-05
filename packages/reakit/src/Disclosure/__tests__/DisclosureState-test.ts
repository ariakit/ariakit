import { renderHook, act } from "reakit-test-utils/hooks";
import { jestSerializerStripFunctions } from "reakit-test-utils/jestSerializerStripFunctions";
import { useDisclosureState } from "../DisclosureState";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(...args: Parameters<typeof useDisclosureState>) {
  return renderHook(() => useDisclosureState(...args)).result;
}

test("initial state", () => {
  const result = render({ baseId: "base" });
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "baseId": "base",
      "unstable_animated": false,
      "unstable_animating": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "visible": false,
    }
  `);
});

test("initial state visible", () => {
  const result = render({ baseId: "base", visible: true });
  expect(result.current).toMatchInlineSnapshot(
    {
      visible: true
    },
    `
    Object {
      "baseId": "base",
      "unstable_animated": false,
      "unstable_animating": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "visible": true,
    }
  `
  );
});

test("initial state lazy", () => {
  const result = render(() => ({ baseId: "base", visible: true }));
  expect(result.current).toMatchInlineSnapshot(
    {
      visible: true
    },
    `
    Object {
      "baseId": "base",
      "unstable_animated": false,
      "unstable_animating": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "visible": true,
    }
  `
  );
});

test("show", () => {
  const result = render({
    baseId: "base",
    unstable_isMounted: true
  });
  act(result.current.show);
  expect(result.current).toMatchInlineSnapshot(
    { visible: true },
    `
    Object {
      "baseId": "base",
      "unstable_animated": false,
      "unstable_animating": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "visible": true,
    }
  `
  );
});

test("show animated", () => {
  jest.useFakeTimers();
  const result = render({
    baseId: "base",
    unstable_isMounted: true,
    unstable_animated: 1000
  });
  act(result.current.show);
  expect(result.current).toMatchInlineSnapshot(
    { visible: true, unstable_animating: true },
    `
    Object {
      "baseId": "base",
      "unstable_animated": 1000,
      "unstable_animating": true,
      "unstable_idCountRef": Object {
        "current": 0,
      },
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
      "baseId": "base",
      "unstable_animated": 1000,
      "unstable_animating": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "visible": true,
    }
  `
  );
  jest.useRealTimers();
});

test("hide", () => {
  const result = render({ baseId: "base", visible: true });
  act(result.current.hide);
  expect(result.current).toMatchInlineSnapshot(
    { visible: false },
    `
    Object {
      "baseId": "base",
      "unstable_animated": false,
      "unstable_animating": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "visible": false,
    }
  `
  );
});

test("hide animated", () => {
  jest.useFakeTimers();
  const result = render({
    baseId: "base",
    visible: true,
    unstable_animated: 1000
  });
  act(result.current.hide);
  expect(result.current).toMatchInlineSnapshot(
    { visible: false, unstable_animating: true },
    `
    Object {
      "baseId": "base",
      "unstable_animated": 1000,
      "unstable_animating": true,
      "unstable_idCountRef": Object {
        "current": 0,
      },
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
      "baseId": "base",
      "unstable_animated": 1000,
      "unstable_animating": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "visible": false,
    }
  `
  );
  jest.useRealTimers();
});

test("toggle", () => {
  const result = render({
    baseId: "base",
    unstable_isMounted: true
  });
  act(result.current.toggle);
  expect(result.current).toMatchInlineSnapshot(
    { visible: true },
    `
    Object {
      "baseId": "base",
      "unstable_animated": false,
      "unstable_animating": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "visible": true,
    }
  `
  );
});
