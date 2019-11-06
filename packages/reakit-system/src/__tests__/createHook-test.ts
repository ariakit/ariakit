import { HTMLAttributes } from "react";
import { createHook } from "../createHook";

type Options = {
  a: string;
};

test("useProps", () => {
  const useHook = createHook<Options, HTMLAttributes<any>>({
    useProps(options, htmlProps) {
      return {
        ...htmlProps,
        "data-a": options.a
      };
    }
  });
  expect(useHook({ a: "a" }, { id: "a" })).toMatchInlineSnapshot(`
    Object {
      "data-a": "a",
      "id": "a",
    }
  `);
});

test("compose useProps", () => {
  const useHook = createHook<Options, HTMLAttributes<any>>({
    useProps(options, htmlProps) {
      return {
        ...htmlProps,
        "data-a": options.a
      };
    }
  });
  type Options2 = Options & {
    b: string;
  };
  const useHook2 = createHook<Options2, HTMLAttributes<any>>({
    compose: [useHook],
    useProps(options, htmlProps) {
      return {
        ...htmlProps,
        "data-b": options.b
      };
    }
  });
  expect(useHook2({ a: "a", b: "b" }, { id: "a" })).toMatchInlineSnapshot(`
    Object {
      "data-a": "a",
      "data-b": "b",
      "id": "a",
    }
  `);
});

// test name and context
// test name and context with useProps
// test name and context with useOptions
// test name with function name
// test useOptions
// test compose with useOptions
// test useCompose
