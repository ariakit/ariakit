import * as React from "react";
import { renderHook, act } from "react-hooks-testing-library";
import { useRoverState } from "../RoverState";
import { jestSerializerStripFunctions } from "../../__utils/jestSerializerStripFunctions";

expect.addSnapshotSerializer(jestSerializerStripFunctions);

function render(...args: Parameters<typeof useRoverState>) {
  return renderHook(() => useRoverState(...args)).result;
}

function createRef(id: string) {
  const ref = React.createRef() as React.MutableRefObject<HTMLElement>;
  ref.current = document.createElement("div");
  ref.current.id = id;
  return ref;
}

test("initial state", () => {
  const result = render();
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "currentId": null,
  "loop": false,
  "pastId": null,
  "stops": Array [],
}
`);
});

test("initial state activeRef", () => {
  const result = render({ currentId: "a" });
  expect(result.current).toMatchInlineSnapshot(
    { currentId: "a" },
    `
Object {
  "currentId": "a",
  "loop": false,
  "pastId": null,
  "stops": Array [],
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
  "currentId": null,
  "loop": true,
  "pastId": null,
  "stops": Array [],
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
  "currentId": null,
  "loop": false,
  "orientation": "vertical",
  "pastId": null,
  "stops": Array [],
}
`
  );
});

test("register", () => {
  const result = render();
  act(() => result.current.register("a", createRef("a")));
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "currentId": null,
  "loop": false,
  "pastId": null,
  "stops": Array [
    Object {
      "id": "a",
      "ref": Object {
        "current": <div
          id="a"
        />,
      },
    },
  ],
}
`);
});

test("register already registered", () => {
  const result = render();
  const ref = createRef("a");
  act(() => result.current.register("a", ref));
  act(() => result.current.register("a", ref));
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "currentId": null,
  "loop": false,
  "pastId": null,
  "stops": Array [
    Object {
      "id": "a",
      "ref": Object {
        "current": <div
          id="a"
        />,
      },
    },
  ],
}
`);
});

test("register currentId", () => {
  const result = render({ currentId: "a" });
  act(() => result.current.register("a", createRef("a")));
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "currentId": "a",
  "loop": false,
  "pastId": null,
  "stops": Array [
    Object {
      "id": "a",
      "ref": Object {
        "current": <div
          id="a"
        />,
      },
    },
  ],
}
`);
});

test("unregister", () => {
  const result = render();
  act(() => result.current.register("a", createRef("a")));
  act(() => result.current.unregister("a"));
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "currentId": null,
  "loop": false,
  "pastId": null,
  "stops": Array [],
}
`);
});

test("unregister inexistent", () => {
  const result = render();
  act(() => result.current.unregister("a"));
  expect(result.current).toMatchInlineSnapshot(`
Object {
  "currentId": null,
  "loop": false,
  "pastId": null,
  "stops": Array [],
}
`);
});

test("unregister currentId", () => {
  const result = render({ currentId: "a" });
  act(() => result.current.register("a", createRef("a")));
  act(() => result.current.unregister("a"));
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: null,
      stops: []
    },
    `
Object {
  "currentId": null,
  "loop": false,
  "pastId": null,
  "stops": Array [],
}
`
  );
});

test("unregister pastId", () => {
  const result = render({ currentId: "a" });
  act(() => result.current.register("a", createRef("a")));
  act(() => result.current.register("b", createRef("b")));
  act(() => result.current.move("b"));
  act(() => result.current.unregister("a"));
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: "b",
      pastId: null
    },
    `
Object {
  "currentId": "b",
  "loop": false,
  "pastId": null,
  "stops": Array [
    Object {
      "id": "b",
      "ref": Object {
        "current": <div
          id="b"
        />,
      },
    },
  ],
}
`
  );
});

test("move", () => {
  const result = render();
  act(() => result.current.register("a", createRef("a")));
  act(() => result.current.move("a"));
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: "a"
    },
    `
Object {
  "currentId": "a",
  "loop": false,
  "pastId": null,
  "stops": Array [
    Object {
      "id": "a",
      "ref": Object {
        "current": <div
          id="a"
        />,
      },
    },
  ],
}
`
  );
});

test("move twice", () => {
  const result = render();
  act(() => result.current.register("a", createRef("a")));
  act(() => result.current.register("b", createRef("b")));
  act(() => result.current.move("a"));
  act(() => result.current.move("b"));
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: "b",
      pastId: "a"
    },
    `
Object {
  "currentId": "b",
  "loop": false,
  "pastId": "a",
  "stops": Array [
    Object {
      "id": "a",
      "ref": Object {
        "current": <div
          id="a"
        />,
      },
    },
    Object {
      "id": "b",
      "ref": Object {
        "current": <div
          id="b"
        />,
      },
    },
  ],
}
`
  );
});

test("move to the same ref", () => {
  const result = render();
  act(() => result.current.register("a", createRef("a")));
  act(() => result.current.register("b", createRef("b")));
  act(() => result.current.move("b"));
  act(() => result.current.move("b"));
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: "b",
      pastId: null
    },
    `
Object {
  "currentId": "b",
  "loop": false,
  "pastId": null,
  "stops": Array [
    Object {
      "id": "a",
      "ref": Object {
        "current": <div
          id="a"
        />,
      },
    },
    Object {
      "id": "b",
      "ref": Object {
        "current": <div
          id="b"
        />,
      },
    },
  ],
}
`
  );
});

test("next", () => {
  const result = render();
  act(() => result.current.register("a", createRef("a")));
  act(() => result.current.register("b", createRef("b")));
  act(() => result.current.register("c", createRef("c")));
  act(() => result.current.move("a"));
  act(() => result.current.next());
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: "b",
      pastId: "a"
    },
    `
Object {
  "currentId": "b",
  "loop": false,
  "pastId": "a",
  "stops": Array [
    Object {
      "id": "a",
      "ref": Object {
        "current": <div
          id="a"
        />,
      },
    },
    Object {
      "id": "b",
      "ref": Object {
        "current": <div
          id="b"
        />,
      },
    },
    Object {
      "id": "c",
      "ref": Object {
        "current": <div
          id="c"
        />,
      },
    },
  ],
}
`
  );
});

test("next thrice", () => {
  const result = render();
  act(() => result.current.register("a", createRef("a")));
  act(() => result.current.register("b", createRef("b")));
  act(() => result.current.register("c", createRef("c")));
  act(() => result.current.move("a"));
  act(() => result.current.next());
  act(() => result.current.next());
  act(() => result.current.next());
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: "c",
      pastId: "b"
    },
    `
Object {
  "currentId": "c",
  "loop": false,
  "pastId": "b",
  "stops": Array [
    Object {
      "id": "a",
      "ref": Object {
        "current": <div
          id="a"
        />,
      },
    },
    Object {
      "id": "b",
      "ref": Object {
        "current": <div
          id="b"
        />,
      },
    },
    Object {
      "id": "c",
      "ref": Object {
        "current": <div
          id="c"
        />,
      },
    },
  ],
}
`
  );
});

test("next thrice loop", () => {
  const result = render({ loop: true });
  act(() => result.current.register("a", createRef("a")));
  act(() => result.current.register("b", createRef("b")));
  act(() => result.current.register("c", createRef("c")));
  act(() => result.current.move("a"));
  act(() => result.current.next());
  act(() => result.current.next());
  act(() => result.current.next());
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: "a",
      pastId: "c"
    },
    `
Object {
  "currentId": "a",
  "loop": true,
  "pastId": "c",
  "stops": Array [
    Object {
      "id": "a",
      "ref": Object {
        "current": <div
          id="a"
        />,
      },
    },
    Object {
      "id": "b",
      "ref": Object {
        "current": <div
          id="b"
        />,
      },
    },
    Object {
      "id": "c",
      "ref": Object {
        "current": <div
          id="c"
        />,
      },
    },
  ],
}
`
  );
});

test("previous", () => {
  const result = render();
  act(() => result.current.register("a", createRef("a")));
  act(() => result.current.register("b", createRef("b")));
  act(() => result.current.register("c", createRef("c")));
  act(() => result.current.move("b"));
  act(() => result.current.previous());
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: "a",
      pastId: "b"
    },
    `
Object {
  "currentId": "a",
  "loop": false,
  "pastId": "b",
  "stops": Array [
    Object {
      "id": "a",
      "ref": Object {
        "current": <div
          id="a"
        />,
      },
    },
    Object {
      "id": "b",
      "ref": Object {
        "current": <div
          id="b"
        />,
      },
    },
    Object {
      "id": "c",
      "ref": Object {
        "current": <div
          id="c"
        />,
      },
    },
  ],
}
`
  );
});

test("previous loop", () => {
  const result = render({ loop: true });
  act(() => result.current.register("a", createRef("a")));
  act(() => result.current.register("b", createRef("b")));
  act(() => result.current.register("c", createRef("c")));
  act(() => result.current.move("a"));
  act(() => result.current.previous());
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: "c",
      pastId: "a"
    },
    `
Object {
  "currentId": "c",
  "loop": true,
  "pastId": "a",
  "stops": Array [
    Object {
      "id": "a",
      "ref": Object {
        "current": <div
          id="a"
        />,
      },
    },
    Object {
      "id": "b",
      "ref": Object {
        "current": <div
          id="b"
        />,
      },
    },
    Object {
      "id": "c",
      "ref": Object {
        "current": <div
          id="c"
        />,
      },
    },
  ],
}
`
  );
});

test("first", () => {
  const result = render();
  act(() => result.current.register("a", createRef("a")));
  act(() => result.current.register("b", createRef("b")));
  act(() => result.current.first());
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: "a",
      pastId: null
    },
    `
Object {
  "currentId": "a",
  "loop": false,
  "pastId": null,
  "stops": Array [
    Object {
      "id": "a",
      "ref": Object {
        "current": <div
          id="a"
        />,
      },
    },
    Object {
      "id": "b",
      "ref": Object {
        "current": <div
          id="b"
        />,
      },
    },
  ],
}
`
  );
});

test("last", () => {
  const result = render();
  act(() => result.current.register("a", createRef("a")));
  act(() => result.current.register("b", createRef("b")));
  act(() => result.current.last());
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: "b",
      pastId: null
    },
    `
Object {
  "currentId": "b",
  "loop": false,
  "pastId": null,
  "stops": Array [
    Object {
      "id": "a",
      "ref": Object {
        "current": <div
          id="a"
        />,
      },
    },
    Object {
      "id": "b",
      "ref": Object {
        "current": <div
          id="b"
        />,
      },
    },
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
  "currentId": null,
  "loop": false,
  "orientation": "horizontal",
  "pastId": null,
  "stops": Array [],
}
`
  );
});
