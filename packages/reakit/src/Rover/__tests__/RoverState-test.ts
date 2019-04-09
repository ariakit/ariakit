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
      "unstable_currentId": null,
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [],
    }
  `);
});

test("initial state activeRef", () => {
  const result = render({ unstable_currentId: "a" });
  expect(result.current).toMatchInlineSnapshot(
    { unstable_currentId: "a" },
    `
    Object {
      "unstable_currentId": "a",
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [],
    }
  `
  );
});

test("initial state loop", () => {
  const result = render({ unstable_loop: true });
  expect(result.current).toMatchInlineSnapshot(
    { unstable_loop: true },
    `
    Object {
      "unstable_currentId": null,
      "unstable_loop": true,
      "unstable_pastId": null,
      "unstable_stops": Array [],
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
      "orientation": "vertical",
      "unstable_currentId": null,
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [],
    }
  `
  );
});

test("register", () => {
  const result = render();
  act(() => result.current.unstable_register("a", createRef("a")));
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "unstable_currentId": null,
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [
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
  act(() => result.current.unstable_register("a", ref));
  act(() => result.current.unstable_register("a", ref));
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "unstable_currentId": null,
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [
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
  const result = render({ unstable_currentId: "a" });
  act(() => result.current.unstable_register("a", createRef("a")));
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "unstable_currentId": "a",
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [
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
  act(() => result.current.unstable_register("a", createRef("a")));
  act(() => result.current.unstable_unregister("a"));
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "unstable_currentId": null,
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [],
    }
  `);
});

test("unregister inexistent", () => {
  const result = render();
  act(() => result.current.unstable_unregister("a"));
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "unstable_currentId": null,
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [],
    }
  `);
});

test("unregister currentId", () => {
  const result = render({ unstable_currentId: "a" });
  act(() => result.current.unstable_register("a", createRef("a")));
  act(() => result.current.unstable_unregister("a"));
  expect(result.current).toMatchInlineSnapshot(
    {
      unstable_currentId: null,
      unstable_stops: []
    },
    `
    Object {
      "unstable_currentId": null,
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [],
    }
  `
  );
});

test("unregister pastId", () => {
  const result = render({ unstable_currentId: "a" });
  act(() => result.current.unstable_register("a", createRef("a")));
  act(() => result.current.unstable_register("b", createRef("b")));
  act(() => result.current.unstable_move("b"));
  act(() => result.current.unstable_unregister("a"));
  expect(result.current).toMatchInlineSnapshot(
    {
      unstable_currentId: "b",
      unstable_pastId: null
    },
    `
    Object {
      "unstable_currentId": "b",
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [
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
  act(() => result.current.unstable_register("a", createRef("a")));
  act(() => result.current.unstable_move("a"));
  expect(result.current).toMatchInlineSnapshot(
    {
      unstable_currentId: "a"
    },
    `
    Object {
      "unstable_currentId": "a",
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [
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
  act(() => result.current.unstable_register("a", createRef("a")));
  act(() => result.current.unstable_register("b", createRef("b")));
  act(() => result.current.unstable_move("a"));
  act(() => result.current.unstable_move("b"));
  expect(result.current).toMatchInlineSnapshot(
    {
      unstable_currentId: "b",
      unstable_pastId: "a"
    },
    `
    Object {
      "unstable_currentId": "b",
      "unstable_loop": false,
      "unstable_pastId": "a",
      "unstable_stops": Array [
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
  act(() => result.current.unstable_register("a", createRef("a")));
  act(() => result.current.unstable_register("b", createRef("b")));
  act(() => result.current.unstable_move("b"));
  act(() => result.current.unstable_move("b"));
  expect(result.current).toMatchInlineSnapshot(
    {
      unstable_currentId: "b",
      unstable_pastId: null
    },
    `
    Object {
      "unstable_currentId": "b",
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [
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

test("move to null", () => {
  const result = render();
  act(() => result.current.unstable_register("a", createRef("a")));
  act(() => result.current.unstable_register("b", createRef("b")));
  act(() => result.current.unstable_move("b"));
  act(() => result.current.unstable_move(null));
  expect(result.current).toMatchInlineSnapshot(
    {
      unstable_currentId: null,
      unstable_pastId: "b"
    },
    `
    Object {
      "unstable_currentId": null,
      "unstable_loop": false,
      "unstable_pastId": "b",
      "unstable_stops": Array [
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
  act(() => result.current.unstable_register("a", createRef("a")));
  act(() => result.current.unstable_register("b", createRef("b")));
  act(() => result.current.unstable_register("c", createRef("c")));
  act(() => result.current.unstable_move("a"));
  act(() => result.current.unstable_next());
  expect(result.current).toMatchInlineSnapshot(
    {
      unstable_currentId: "b",
      unstable_pastId: "a"
    },
    `
    Object {
      "unstable_currentId": "b",
      "unstable_loop": false,
      "unstable_pastId": "a",
      "unstable_stops": Array [
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
  act(() => result.current.unstable_register("a", createRef("a")));
  act(() => result.current.unstable_register("b", createRef("b")));
  act(() => result.current.unstable_register("c", createRef("c")));
  act(() => result.current.unstable_move("a"));
  act(() => result.current.unstable_next());
  act(() => result.current.unstable_next());
  act(() => result.current.unstable_next());
  expect(result.current).toMatchInlineSnapshot(
    {
      unstable_currentId: "c",
      unstable_pastId: "b"
    },
    `
    Object {
      "unstable_currentId": "c",
      "unstable_loop": false,
      "unstable_pastId": "b",
      "unstable_stops": Array [
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
  const result = render({ unstable_loop: true });
  act(() => result.current.unstable_register("a", createRef("a")));
  act(() => result.current.unstable_register("b", createRef("b")));
  act(() => result.current.unstable_register("c", createRef("c")));
  act(() => result.current.unstable_move("a"));
  act(() => result.current.unstable_next());
  act(() => result.current.unstable_next());
  act(() => result.current.unstable_next());
  expect(result.current).toMatchInlineSnapshot(
    {
      unstable_currentId: "a",
      unstable_pastId: "c"
    },
    `
    Object {
      "unstable_currentId": "a",
      "unstable_loop": true,
      "unstable_pastId": "c",
      "unstable_stops": Array [
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
  act(() => result.current.unstable_register("a", createRef("a")));
  act(() => result.current.unstable_register("b", createRef("b")));
  act(() => result.current.unstable_register("c", createRef("c")));
  act(() => result.current.unstable_move("b"));
  act(() => result.current.unstable_previous());
  expect(result.current).toMatchInlineSnapshot(
    {
      unstable_currentId: "a",
      unstable_pastId: "b"
    },
    `
    Object {
      "unstable_currentId": "a",
      "unstable_loop": false,
      "unstable_pastId": "b",
      "unstable_stops": Array [
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
  const result = render({ unstable_loop: true });
  act(() => result.current.unstable_register("a", createRef("a")));
  act(() => result.current.unstable_register("b", createRef("b")));
  act(() => result.current.unstable_register("c", createRef("c")));
  act(() => result.current.unstable_move("a"));
  act(() => result.current.unstable_previous());
  expect(result.current).toMatchInlineSnapshot(
    {
      unstable_currentId: "c",
      unstable_pastId: "a"
    },
    `
    Object {
      "unstable_currentId": "c",
      "unstable_loop": true,
      "unstable_pastId": "a",
      "unstable_stops": Array [
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
  act(() => result.current.unstable_register("a", createRef("a")));
  act(() => result.current.unstable_register("b", createRef("b")));
  act(() => result.current.unstable_first());
  expect(result.current).toMatchInlineSnapshot(
    {
      unstable_currentId: "a",
      unstable_pastId: null
    },
    `
    Object {
      "unstable_currentId": "a",
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [
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
  act(() => result.current.unstable_register("a", createRef("a")));
  act(() => result.current.unstable_register("b", createRef("b")));
  act(() => result.current.unstable_last());
  expect(result.current).toMatchInlineSnapshot(
    {
      unstable_currentId: "b",
      unstable_pastId: null
    },
    `
    Object {
      "unstable_currentId": "b",
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [
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
  act(() => result.current.unstable_orientate("horizontal"));
  expect(result.current).toMatchInlineSnapshot(
    {
      orientation: "horizontal"
    },
    `
    Object {
      "orientation": "horizontal",
      "unstable_currentId": null,
      "unstable_loop": false,
      "unstable_pastId": null,
      "unstable_stops": Array [],
    }
  `
  );
});
