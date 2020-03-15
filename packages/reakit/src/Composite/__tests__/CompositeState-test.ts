import * as React from "react";
import { renderHook, act } from "reakit-test-utils/hooks";
import { jestSerializerStripFunctions } from "reakit-test-utils/jestSerializerStripFunctions";
import {
  unstable_useCompositeState as useCompositeState,
  unstable_CompositeInitialState as CompositeInitialState
} from "../CompositeState";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render({
  baseId = "base",
  ...initialState
}: CompositeInitialState = {}) {
  return renderHook(() => useCompositeState({ baseId, ...initialState }))
    .result;
}

function createRef() {
  const ref = React.createRef() as React.MutableRefObject<HTMLElement>;
  ref.current = document.createElement("div");
  return ref;
}

test("initial state", () => {
  const result = render();
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "baseId": "base",
      "currentId": null,
      "focusWrap": false,
      "groups": Array [],
      "items": Array [],
      "loop": false,
      "orientation": undefined,
      "rtl": false,
      "unstable_focusStrategy": "roving-tabindex",
      "unstable_hasActiveWidget": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "unstable_moves": 0,
    }
  `);
});

test("setRTL", () => {
  const result = render();
  expect(result.current.rtl).not.toBe(true);
  act(() => result.current.setRTL(true));
  expect(result.current.rtl).toBe(true);
});

test("setOrientation", () => {
  const result = render();
  expect(result.current.orientation).not.toBe("horizontal");
  act(() => result.current.setOrientation("horizontal"));
  expect(result.current.orientation).toBe("horizontal");
});

test("setCurrentId", () => {
  const result = render();
  act(() => result.current.setCurrentId("a"));
  expect(result.current.currentId).toBe("a");
});

test("setLoop", () => {
  const result = render();
  expect(result.current.loop).not.toBe(true);
  act(() => result.current.setLoop(true));
  expect(result.current.loop).toBe(true);
});

test("setWrap", () => {
  const result = render();
  expect(result.current.focusWrap).not.toBe(true);
  act(() => result.current.setFocusWrap(true));
  expect(result.current.focusWrap).toBe(true);
});

test("registerItem", () => {
  const result = render();
  act(() => result.current.registerItem({ id: "1", ref: createRef() }));
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "baseId": "base",
      "currentId": "1",
      "focusWrap": false,
      "groups": Array [],
      "items": Array [
        Object {
          "groupId": undefined,
          "id": "1",
          "ref": Object {
            "current": <div />,
          },
        },
      ],
      "loop": false,
      "orientation": undefined,
      "rtl": false,
      "unstable_focusStrategy": "roving-tabindex",
      "unstable_hasActiveWidget": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "unstable_moves": 0,
    }
  `);
});

test("unregisterItem", () => {
  const result = render();
  act(() => result.current.registerItem({ id: "1", ref: createRef() }));
  act(() => result.current.registerItem({ id: "2", ref: createRef() }));
  act(() => result.current.unregisterItem("1"));
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "baseId": "base",
      "currentId": "2",
      "focusWrap": false,
      "groups": Array [],
      "items": Array [
        Object {
          "groupId": undefined,
          "id": "2",
          "ref": Object {
            "current": <div />,
          },
        },
      ],
      "loop": false,
      "orientation": undefined,
      "rtl": false,
      "unstable_focusStrategy": "roving-tabindex",
      "unstable_hasActiveWidget": false,
      "unstable_idCountRef": Object {
        "current": 0,
      },
      "unstable_moves": 0,
    }
  `);
});
