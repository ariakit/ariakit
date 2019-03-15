import { renderHook, act } from "react-hooks-testing-library";
import { useRoverState } from "../RoverState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(props?: Parameters<typeof useRoverState>[0]) {
  return renderHook(useRoverState, {
    initialProps: props
  }).result;
}

test("initial state", () => {
  const result = render();
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "activeRef": null,
  "enabled": Array [],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [],
}
`);
});

test("initial state activeRef", () => {
  const result = render({ activeRef: "a" });
  expect(result.current).toMatchInlineSnapshot(
    { activeRef: "a" },
    `
Object {
  "activeRef": "a",
  "enabled": Array [],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [],
}
`
  );
});

test("initial state loop", () => {
  const result = render({ loop: true });
  expect(result.current).toMatchInlineSnapshot(
    { loop: true },
    `
Object {
  "activeRef": null,
  "enabled": Array [],
  "lastActiveRef": null,
  "loop": true,
  "orientation": undefined,
  "refs": Array [],
}
`
  );
});

test("initial state orientation", () => {
  const result = render({ orientation: "vertical" });
  expect(result.current).toMatchInlineSnapshot(
    { orientation: "vertical" },
    `
Object {
  "activeRef": null,
  "enabled": Array [],
  "lastActiveRef": null,
  "loop": false,
  "orientation": "vertical",
  "refs": Array [],
}
`
  );
});

test("register", () => {
  const result = render();
  act(() => result.current.register("a"));
  expect(result.current).toMatchInlineSnapshot(
    {
      refs: ["a"],
      enabled: [true]
    },
    `
Object {
  "activeRef": null,
  "enabled": Array [
    true,
  ],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
  ],
}
`
  );
});

test("register disabled", () => {
  const result = render();
  act(() => result.current.register("a", true));
  expect(result.current).toMatchInlineSnapshot(
    {
      refs: ["a"],
      enabled: [false]
    },
    `
Object {
  "activeRef": null,
  "enabled": Array [
    false,
  ],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
  ],
}
`
  );
});

test("register already registered", () => {
  const result = render();
  act(() => result.current.register("a"));
  act(() => result.current.register("a", true));
  expect(result.current).toMatchInlineSnapshot(
    {
      refs: ["a"],
      enabled: [false]
    },
    `
Object {
  "activeRef": null,
  "enabled": Array [
    false,
  ],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
  ],
}
`
  );
});

test("register activeRef", () => {
  const result = render({ activeRef: "a" });
  act(() => result.current.register("a"));
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "a",
      refs: ["a"],
      enabled: [true]
    },
    `
Object {
  "activeRef": "a",
  "enabled": Array [
    true,
  ],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
  ],
}
`
  );
});

test("register disabled activeRef", () => {
  const result = render({ activeRef: "a" });
  act(() => result.current.register("a", true));
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: null,
      refs: ["a"],
      enabled: [false]
    },
    `
Object {
  "activeRef": null,
  "enabled": Array [
    false,
  ],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
  ],
}
`
  );
});

test("register disabled lastActiveRef", () => {
  const result = render({ activeRef: "a" });
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.moveTo("b"));
  act(() => result.current.register("a", true));
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "b",
      refs: ["a", "b"],
      enabled: [false, true],
      lastActiveRef: null
    },
    `
Object {
  "activeRef": "b",
  "enabled": Array [
    false,
    true,
  ],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
    "b",
  ],
}
`
  );
});

test("unregister", () => {
  const result = render();
  act(() => result.current.register("a"));
  act(() => result.current.unregister("a"));
  expect(result.current).toMatchInlineSnapshot(
    {
      refs: [],
      enabled: []
    },
    `
Object {
  "activeRef": null,
  "enabled": Array [],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [],
}
`
  );
});

test("unregister inexistent", () => {
  const result = render();
  act(() => result.current.unregister("a"));
  expect(result.current).toMatchInlineSnapshot(
    {
      refs: [],
      enabled: []
    },
    `
Object {
  "activeRef": null,
  "enabled": Array [],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [],
}
`
  );
});

test("unregister activeRef", () => {
  const result = render({ activeRef: "a" });
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.moveTo("b"));
  act(() => result.current.unregister("a"));
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "b",
      refs: ["b"],
      enabled: [true],
      lastActiveRef: null
    },
    `
Object {
  "activeRef": "b",
  "enabled": Array [
    true,
  ],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "b",
  ],
}
`
  );
});

test("unregister lastActiveRef", () => {
  const result = render({ activeRef: "a" });
  act(() => result.current.register("a"));
  act(() => result.current.unregister("a"));
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: null,
      refs: [],
      enabled: []
    },
    `
Object {
  "activeRef": null,
  "enabled": Array [],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [],
}
`
  );
});

test("moveTo", () => {
  const result = render();
  act(() => result.current.register("a"));
  act(() => result.current.moveTo("a"));
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "a",
      refs: ["a"],
      enabled: [true]
    },
    `
Object {
  "activeRef": "a",
  "enabled": Array [
    true,
  ],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
  ],
}
`
  );
});

test("moveTo disabled", () => {
  const result = render();
  act(() => result.current.register("a", true));
  act(() => result.current.moveTo("a"));
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: null,
      refs: ["a"],
      enabled: [false]
    },
    `
Object {
  "activeRef": null,
  "enabled": Array [
    false,
  ],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
  ],
}
`
  );
});

test("moveTo twice", () => {
  const result = render();
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.moveTo("a"));
  act(() => result.current.moveTo("b"));
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "b",
      refs: ["a", "b"],
      enabled: [true, true],
      lastActiveRef: "a"
    },
    `
Object {
  "activeRef": "b",
  "enabled": Array [
    true,
    true,
  ],
  "lastActiveRef": "a",
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
    "b",
  ],
}
`
  );
});

test("moveTo the same ref", () => {
  const result = render();
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.moveTo("b"));
  act(() => result.current.moveTo("b"));
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "b",
      refs: ["a", "b"],
      enabled: [true, true],
      lastActiveRef: null
    },
    `
Object {
  "activeRef": "b",
  "enabled": Array [
    true,
    true,
  ],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
    "b",
  ],
}
`
  );
});

test("moveTo then disable", () => {
  const result = render();
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.moveTo("a"));
  act(() => result.current.register("a", true));
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "b",
      refs: ["a", "b"],
      enabled: [false, true],
      lastActiveRef: null
    },
    `
Object {
  "activeRef": "b",
  "enabled": Array [
    false,
    true,
  ],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
    "b",
  ],
}
`
  );
});

test("next", () => {
  const result = render();
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.register("c"));
  act(() => result.current.moveTo("a"));
  act(() => result.current.next());
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "b",
      refs: ["a", "b", "c"],
      enabled: [true, true, true],
      lastActiveRef: "a"
    },
    `
Object {
  "activeRef": "b",
  "enabled": Array [
    true,
    true,
    true,
  ],
  "lastActiveRef": "a",
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
    "b",
    "c",
  ],
}
`
  );
});

test("next thrice", () => {
  const result = render();
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.register("c"));
  act(() => result.current.moveTo("a"));
  act(() => result.current.next());
  act(() => result.current.next());
  act(() => result.current.next());
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "c",
      refs: ["a", "b", "c"],
      enabled: [true, true, true],
      lastActiveRef: "b"
    },
    `
Object {
  "activeRef": "c",
  "enabled": Array [
    true,
    true,
    true,
  ],
  "lastActiveRef": "b",
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
    "b",
    "c",
  ],
}
`
  );
});

test("next thrice loop", () => {
  const result = render({ loop: true });
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.register("c"));
  act(() => result.current.moveTo("a"));
  act(() => result.current.next());
  act(() => result.current.next());
  act(() => result.current.next());
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "a",
      refs: ["a", "b", "c"],
      enabled: [true, true, true],
      lastActiveRef: "c"
    },
    `
Object {
  "activeRef": "a",
  "enabled": Array [
    true,
    true,
    true,
  ],
  "lastActiveRef": "c",
  "loop": true,
  "orientation": undefined,
  "refs": Array [
    "a",
    "b",
    "c",
  ],
}
`
  );
});

test("previous", () => {
  const result = render();
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.register("c"));
  act(() => result.current.moveTo("b"));
  act(() => result.current.previous());
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "a",
      refs: ["a", "b", "c"],
      enabled: [true, true, true],
      lastActiveRef: "b"
    },
    `
Object {
  "activeRef": "a",
  "enabled": Array [
    true,
    true,
    true,
  ],
  "lastActiveRef": "b",
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
    "b",
    "c",
  ],
}
`
  );
});

test("previous loop", () => {
  const result = render({ loop: true });
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.register("c"));
  act(() => result.current.moveTo("a"));
  act(() => result.current.previous());
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "c",
      refs: ["a", "b", "c"],
      enabled: [true, true, true],
      lastActiveRef: "a"
    },
    `
Object {
  "activeRef": "c",
  "enabled": Array [
    true,
    true,
    true,
  ],
  "lastActiveRef": "a",
  "loop": true,
  "orientation": undefined,
  "refs": Array [
    "a",
    "b",
    "c",
  ],
}
`
  );
});

test("first", () => {
  const result = render();
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.first());
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "a",
      refs: ["a", "b"],
      enabled: [true, true],
      lastActiveRef: null
    },
    `
Object {
  "activeRef": "a",
  "enabled": Array [
    true,
    true,
  ],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
    "b",
  ],
}
`
  );
});

test("last", () => {
  const result = render();
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.last());
  expect(result.current).toMatchInlineSnapshot(
    {
      activeRef: "b",
      refs: ["a", "b"],
      enabled: [true, true],
      lastActiveRef: null
    },
    `
Object {
  "activeRef": "b",
  "enabled": Array [
    true,
    true,
  ],
  "lastActiveRef": null,
  "loop": false,
  "orientation": undefined,
  "refs": Array [
    "a",
    "b",
  ],
}
`
  );
});

test("orientate", () => {
  const result = render();
  act(() => result.current.orientate("horizontal"));
  expect(result.current).toMatchInlineSnapshot(
    {
      orientation: "horizontal"
    },
    `
Object {
  "activeRef": null,
  "enabled": Array [],
  "lastActiveRef": null,
  "loop": false,
  "orientation": "horizontal",
  "refs": Array [],
}
`
  );
});

test("getNext", () => {
  const result = render();
  expect(result.current.getNext()).toBe(null);
});

test("getNext registered", () => {
  const result = render();
  act(() => result.current.register("a"));
  expect(result.current.getNext()).toBe("a");
});

test("getNext with activeRef initial state", () => {
  const result = render({ activeRef: "b" });
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.register("c"));
  expect(result.current.getNext()).toBe("c");
});

test("getNext loop", () => {
  const result = render({ activeRef: "b", loop: true });
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  expect(result.current.getNext()).toBe("a");
});

test("getNext with different activeRef", () => {
  const result = render({ activeRef: "b" });
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  expect(result.current.getNext("a")).toBe("b");
});

test("getNext when the next is disabled", () => {
  const result = render({ activeRef: "a" });
  act(() => result.current.register("a"));
  act(() => result.current.register("b", true));
  expect(result.current.getNext()).toBe(null);
  act(() => result.current.register("c"));
  expect(result.current.getNext()).toBe("c");
});

test("getPrevious", () => {
  const result = render();
  expect(result.current.getPrevious()).toBe(null);
});

test("getPrevious registered", () => {
  const result = render();
  act(() => result.current.register("a"));
  expect(result.current.getPrevious()).toBe("a");
});

test("getPrevious with activeRef initial state", () => {
  const result = render({ activeRef: "b" });
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.register("c"));
  expect(result.current.getPrevious()).toBe("a");
});

test("getPrevious loop", () => {
  const result = render({ activeRef: "a", loop: true });
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  expect(result.current.getPrevious()).toBe("b");
});

test("getPrevious with different activeRef", () => {
  const result = render({ activeRef: "a" });
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  expect(result.current.getPrevious("b")).toBe("a");
});

test("getPrevious when the next is disabled", () => {
  const result = render({ activeRef: "b" });
  act(() => result.current.register("a", true));
  act(() => result.current.register("b"));
  expect(result.current.getPrevious()).toBe(null);
  act(() => result.current.register("a"));
  expect(result.current.getPrevious()).toBe("a");
});

test("getFirst", () => {
  const result = render();
  expect(result.current.getFirst()).toBe(null);
});

test("getFirst registered", () => {
  const result = render();
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.register("c"));
  expect(result.current.getFirst()).toBe("a");
});

test("getFirst when the first is disabled", () => {
  const result = render();
  act(() => result.current.register("a", true));
  act(() => result.current.register("b"));
  act(() => result.current.register("c"));
  expect(result.current.getFirst()).toBe("b");
});

test("getLast", () => {
  const result = render();
  expect(result.current.getLast()).toBe(null);
});

test("getLast registered", () => {
  const result = render();
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.register("c"));
  expect(result.current.getLast()).toBe("c");
});

test("getLast when the last is disabled", () => {
  const result = render();
  act(() => result.current.register("a"));
  act(() => result.current.register("b"));
  act(() => result.current.register("c", true));
  expect(result.current.getLast()).toBe("b");
});
