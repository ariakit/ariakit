import * as React from "react";
import { renderHook, act } from "@testing-library/react-hooks";
import { jestSerializerStripFunctions } from "reakit-utils/jestSerializerStripFunctions";
import { useRoverState } from "../RoverState";

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
      "orientation": undefined,
      "stops": Array [],
      "unstable_moves": 0,
      "unstable_pastId": null,
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
      "orientation": undefined,
      "stops": Array [],
      "unstable_moves": 0,
      "unstable_pastId": null,
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
      "orientation": undefined,
      "stops": Array [],
      "unstable_moves": 0,
      "unstable_pastId": null,
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
              "stops": Array [],
              "unstable_moves": 0,
              "unstable_pastId": null,
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
      "orientation": undefined,
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
      "unstable_moves": 0,
      "unstable_pastId": null,
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
      "orientation": undefined,
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
      "unstable_moves": 0,
      "unstable_pastId": null,
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
      "orientation": undefined,
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
      "unstable_moves": 0,
      "unstable_pastId": null,
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
      "orientation": undefined,
      "stops": Array [],
      "unstable_moves": 0,
      "unstable_pastId": null,
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
      "orientation": undefined,
      "stops": Array [],
      "unstable_moves": 0,
      "unstable_pastId": null,
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
      "orientation": undefined,
      "stops": Array [],
      "unstable_moves": 0,
      "unstable_pastId": null,
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
      unstable_pastId: null
    },
    `
    Object {
      "currentId": "b",
      "loop": false,
      "orientation": undefined,
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
      "unstable_moves": 1,
      "unstable_pastId": null,
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
      "orientation": undefined,
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
      "unstable_moves": 1,
      "unstable_pastId": null,
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
      unstable_pastId: "a"
    },
    `
    Object {
      "currentId": "b",
      "loop": false,
      "orientation": undefined,
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
      "unstable_moves": 2,
      "unstable_pastId": "a",
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
      unstable_pastId: null
    },
    `
    Object {
      "currentId": "b",
      "loop": false,
      "orientation": undefined,
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
      "unstable_moves": 2,
      "unstable_pastId": null,
    }
  `
  );
});

test("move to null", () => {
  const result = render();
  act(() => result.current.register("a", createRef("a")));
  act(() => result.current.register("b", createRef("b")));
  act(() => result.current.move("b"));
  act(() => result.current.move(null));
  expect(result.current).toMatchInlineSnapshot(
    {
      currentId: null,
      unstable_pastId: "b"
    },
    `
    Object {
      "currentId": null,
      "loop": false,
      "orientation": undefined,
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
      "unstable_moves": 2,
      "unstable_pastId": "b",
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
      unstable_pastId: "a"
    },
    `
    Object {
      "currentId": "b",
      "loop": false,
      "orientation": undefined,
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
      "unstable_moves": 2,
      "unstable_pastId": "a",
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
      unstable_pastId: "b"
    },
    `
    Object {
      "currentId": "c",
      "loop": false,
      "orientation": undefined,
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
      "unstable_moves": 3,
      "unstable_pastId": "b",
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
      unstable_pastId: "c"
    },
    `
    Object {
      "currentId": "a",
      "loop": true,
      "orientation": undefined,
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
      "unstable_moves": 4,
      "unstable_pastId": "c",
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
      unstable_pastId: "b"
    },
    `
    Object {
      "currentId": "a",
      "loop": false,
      "orientation": undefined,
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
      "unstable_moves": 2,
      "unstable_pastId": "b",
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
      unstable_pastId: "a"
    },
    `
    Object {
      "currentId": "c",
      "loop": true,
      "orientation": undefined,
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
      "unstable_moves": 2,
      "unstable_pastId": "a",
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
      unstable_pastId: null
    },
    `
    Object {
      "currentId": "a",
      "loop": false,
      "orientation": undefined,
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
      "unstable_moves": 1,
      "unstable_pastId": null,
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
      unstable_pastId: null
    },
    `
    Object {
      "currentId": "b",
      "loop": false,
      "orientation": undefined,
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
      "unstable_moves": 1,
      "unstable_pastId": null,
    }
  `
  );
});

test("orientate", () => {
  const result = render();
  act(() => result.current.unstable_orientate("horizontal"));
  expect(result.current).toMatchInlineSnapshot(
    {
      orientation: "horizontal"
    },
    `
            Object {
              "currentId": null,
              "loop": false,
              "orientation": "horizontal",
              "stops": Array [],
              "unstable_moves": 0,
              "unstable_pastId": null,
            }
      `
  );
});
