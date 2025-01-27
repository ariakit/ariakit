import type { AnyObject } from "@ariakit/core/utils/types";
import { createComputed, createRoot, createSignal, mergeProps } from "solid-js";
import { $ } from "../props.ts";
import { createHook as _createHook } from "../system.tsx";

function root(testFn: () => void | Promise<void>) {
  return () => createRoot(() => testFn());
}

function createHook(useHook: any) {
  return _createHook<any, any>(useHook) as (props?: AnyObject) => AnyObject;
}

describe("props", () => {
  describe("passed through", () => {
    test(
      "static input",
      root(() => {
        const useHook = createHook(function useHook(props: any) {
          return props;
        });
        const props = useHook({ a: 1, b: 2 });

        expect(Object.keys(props)).toEqual(["a", "b"]);
        expect(props.a).toBe(1);
        expect(props.b).toBe(2);
        expect(props.unknown).toBe(undefined);
      }),
    );

    test(
      "dynamic input",
      root(() => {
        const useHook = createHook(function useHook(props: any) {
          return props;
        });
        const [a, setA] = createSignal(1);
        const props = useHook({
          get a() {
            return a();
          },
        });

        expect(Object.keys(props)).toEqual(["a"]);
        expect(props.a).toBe(1);
        expect(props.unknown).toBe(undefined);

        setA(3);

        expect(Object.keys(props)).toEqual(["a"]);
        expect(props.a).toBe(3);
        expect(props.unknown).toBe(undefined);
      }),
    );

    test(
      "proxy input",
      root(() => {
        const useHook = createHook(function useHook(props: any) {
          return props;
        });

        const [a, setA] = createSignal(1);
        const [proxyProps, setProxyProps] = createSignal<any>({
          get a() {
            return a();
          },
          removed: "GOODBYE",
        });
        const props = useHook(mergeProps({}, proxyProps));

        expect(Object.keys(props)).toEqual(["a", "removed"]);
        expect(props.a).toBe(1);
        expect(props.removed).toBe("GOODBYE");
        expect(props.added).toBe(undefined);
        expect(props.unknown).toBe(undefined);

        setProxyProps({
          get a() {
            return a();
          },
          added: "HELLO",
        });

        expect(Object.keys(props)).toEqual(["a", "added"]);
        expect(props.a).toBe(1);
        expect(props.removed).toBe(undefined);
        expect(props.added).toBe("HELLO");
        expect(props.unknown).toBe(undefined);

        setA(3);

        expect(Object.keys(props)).toEqual(["a", "added"]);
        expect(props.a).toBe(3);
        expect(props.removed).toBe(undefined);
        expect(props.added).toBe("HELLO");
        expect(props.unknown).toBe(undefined);
      }),
    );
  });

  describe("reactive", () => {
    test(
      "dynamic input",
      root(() => {
        const useHook = createHook(function useHook(props: any) {
          return props;
        });

        const [a, setA] = createSignal(1);
        const props = useHook({
          get a() {
            return a();
          },
        });

        const fn = vitest.fn();
        createComputed(() => fn(props.a));
        expect(fn).toHaveBeenCalledWith(1);
        setA(2);
        expect(fn).toHaveBeenCalledWith(2);
      }),
    );

    test(
      "proxy input",
      root(() => {
        const useHook = createHook(function useHook(props: any) {
          return props;
        });

        const [a, setA] = createSignal(1);
        const [proxyProps, setProxyProps] = createSignal<any>({
          get a() {
            return a();
          },
        });

        const props = useHook(mergeProps({}, proxyProps));

        const fnA = vitest.fn();
        createComputed(() => fnA(props.a));
        expect(fnA).toHaveBeenCalledWith(1);
        setA(2);
        expect(fnA).toHaveBeenCalledWith(2);

        const fnB = vitest.fn();
        createComputed(() => fnB(props.b));
        expect(fnB).toHaveBeenCalledWith(undefined);
        const [b, setB] = createSignal(3);
        setProxyProps({
          get a() {
            return a();
          },
          get b() {
            return b();
          },
        });
        expect(fnB).toHaveBeenCalledWith(3);
        setB(4);
        expect(fnB).toHaveBeenCalledWith(4);
      }),
    );
  });
});

describe("$ (prop chaining)", () => {
  describe("defaults are applied", () => {
    test(
      "static input",
      root(() => {
        const useHook = createHook(function useHook(props: any) {
          $(props, { a: "DEFAULT" });
          return props;
        });

        const props1 = useHook({ a: "VALUE" });

        expect(Object.keys(props1)).toEqual(["a"]);
        expect(props1.a).toBe("VALUE");

        const props2 = useHook();

        expect(Object.keys(props2)).toEqual(["a"]);
        expect(props2.a).toBe("DEFAULT");
      }),
    );

    test(
      "dynamic input",
      root(() => {
        const useHook = createHook(function useHook(props: any) {
          $(props, { a: "DEFAULT" });
          return props;
        });

        const [a, setA] = createSignal<any>(undefined);
        const props = useHook({
          get a() {
            return a();
          },
        });

        expect(Object.keys(props)).toEqual(["a"]);
        expect(props.a).toBe("DEFAULT");

        setA("VALUE");

        expect(Object.keys(props)).toEqual(["a"]);
        expect(props.a).toBe("VALUE");

        setA(undefined);

        expect(Object.keys(props)).toEqual(["a"]);
        expect(props.a).toBe("DEFAULT");
      }),
    );

    test(
      "proxy input",
      root(() => {
        const useHook = createHook(function useHook(props: any) {
          $(props, { a: "DEFAULT A", b: "DEFAULT B" });
          return props;
        });

        const [a, setA] = createSignal<any>(undefined);
        const [proxyProps, setProxyProps] = createSignal<any>({
          get a() {
            return a();
          },
        });

        const props = useHook(mergeProps({}, proxyProps));

        expect(Object.keys(props)).toEqual(["a", "b"]);
        expect(props.a).toBe("DEFAULT A");
        expect(props.b).toBe("DEFAULT B");

        setA("VALUE A");

        expect(Object.keys(props)).toEqual(["a", "b"]);
        expect(props.a).toBe("VALUE A");
        expect(props.b).toBe("DEFAULT B");

        const [b, setB] = createSignal<any>(undefined);
        setProxyProps({
          get a() {
            return a();
          },
          get b() {
            return b();
          },
        });

        expect(Object.keys(props)).toEqual(["a", "b"]);
        expect(props.a).toBe("VALUE A");
        expect(props.b).toBe("DEFAULT B");

        setB("VALUE B");

        expect(Object.keys(props)).toEqual(["a", "b"]);
        expect(props.a).toBe("VALUE A");
        expect(props.b).toBe("VALUE B");

        setB(undefined);

        expect(Object.keys(props)).toEqual(["a", "b"]);
        expect(props.a).toBe("VALUE A");
        expect(props.b).toBe("DEFAULT B");

        setA(undefined);

        expect(Object.keys(props)).toEqual(["a", "b"]);
        expect(props.a).toBe("DEFAULT A");
        expect(props.b).toBe("DEFAULT B");
      }),
    );
  });

  describe("defaults are reactive", () => {
    test(
      "dynamic input",
      root(() => {
        const useHook = createHook(function useHook(props: any) {
          $(props, { a: "DEFAULT A", b: "DEFAULT B" });
          return props;
        });

        const [a, setA] = createSignal<any>(undefined);
        const props = useHook({
          get a() {
            return a();
          },
        });

        const fn = vitest.fn();
        createComputed(() => fn(props.a));
        expect(fn).toHaveBeenCalledWith("DEFAULT A");
        setA("VALUE A");
        expect(fn).toHaveBeenCalledWith("VALUE A");
        setA(undefined);
        expect(fn).toHaveBeenCalledWith("DEFAULT A");
      }),
    );

    test(
      "proxy input",
      root(() => {
        const useHook = createHook(function useHook(props: any) {
          $(props, { a: "DEFAULT A", b: "DEFAULT B" });
          return props;
        });

        const [a, setA] = createSignal<any>(undefined);
        const [proxyProps, setProxyProps] = createSignal<any>({
          get a() {
            return a();
          },
        });

        const props = useHook(mergeProps({}, proxyProps));

        const fnA = vitest.fn();
        createComputed(() => fnA(props.a));
        expect(fnA).toHaveBeenCalledWith("DEFAULT A");
        setA("VALUE A");
        expect(fnA).toHaveBeenCalledWith("VALUE A");
        setA(undefined);
        expect(fnA).toHaveBeenCalledWith("DEFAULT A");

        const fnB = vitest.fn();
        createComputed(() => fnB(props.b));
        expect(fnB).toHaveBeenCalledWith("DEFAULT B");
        const [b, setB] = createSignal<any>(undefined);
        setProxyProps({
          get a() {
            return a();
          },
          get b() {
            return b();
          },
        });
        expect(fnB).toHaveBeenCalledWith("DEFAULT B");
        setB("VALUE B");
        expect(fnB).toHaveBeenCalledWith("VALUE B");
        setB(undefined);
        expect(fnB).toHaveBeenCalledWith("DEFAULT B");
      }),
    );
  });

  describe("overrides are applied", () => {
    test(
      "static input",
      root(() => {
        const useHook = createHook(function useHook(props: any) {
          $(props)({ a: "OVERRIDE" });
          return props;
        });

        const props1 = useHook({ a: "VALUE" });

        expect(Object.keys(props1)).toEqual(["a"]);
        expect(props1.a).toBe("OVERRIDE");

        const props2 = useHook();

        expect(Object.keys(props2)).toEqual(["a"]);
        expect(props1.a).toBe("OVERRIDE");
      }),
    );

    test(
      "dynamic input",
      root(() => {
        const [aOverride, setAOverride] = createSignal<any>(undefined);
        const useHook = createHook(function useHook(props: any) {
          $(props)({
            get a() {
              return aOverride();
            },
          });
          return props;
        });

        const [a, setA] = createSignal(1);
        const props = useHook({
          get a() {
            return a();
          },
        });

        expect(Object.keys(props)).toEqual(["a"]);
        expect(props.a).toBe(1);

        setA(2);
        expect(props.a).toBe(2);

        setAOverride("OVERRIDE");
        expect(props.a).toBe("OVERRIDE");

        setA(3);
        expect(props.a).toBe("OVERRIDE");

        setAOverride(undefined);
        expect(props.a).toBe(3);
      }),
    );

    test(
      "proxy input",
      root(() => {
        const [aOverride, setAOverride] = createSignal<any>(undefined);
        const [bOverride, setBOverride] = createSignal<any>(undefined);
        const useHook = createHook(function useHook(props: any) {
          $(props)({
            get a() {
              return aOverride();
            },
            get b() {
              return bOverride();
            },
          });
          return props;
        });

        const [a, setA] = createSignal(1);
        const [proxyProps, setProxyProps] = createSignal<any>({
          get a() {
            return a();
          },
        });

        const props = useHook(mergeProps({}, proxyProps));

        expect(Object.keys(props)).toEqual(["a", "b"]);
        expect(props.a).toBe(1);
        expect(props.b).toBe(undefined);

        setA(2);
        expect(props.a).toBe(2);
        expect(props.b).toBe(undefined);

        setAOverride("OVERRIDE A");
        expect(props.a).toBe("OVERRIDE A");
        expect(props.b).toBe(undefined);

        setA(3);
        expect(props.a).toBe("OVERRIDE A");
        expect(props.b).toBe(undefined);

        setAOverride(undefined);
        expect(props.a).toBe(3);
        expect(props.b).toBe(undefined);

        setBOverride("OVERRIDE B");
        expect(props.a).toBe(3);
        expect(props.b).toBe("OVERRIDE B");

        const [b, setB] = createSignal(4);
        setProxyProps({
          get a() {
            return a();
          },
          get b() {
            return b();
          },
        });

        expect(props.a).toBe(3);
        expect(props.b).toBe("OVERRIDE B");

        setB(5);
        expect(props.a).toBe(3);
        expect(props.b).toBe("OVERRIDE B");

        setBOverride(undefined);
        expect(props.a).toBe(3);
        expect(props.b).toBe(5);

        setB(6);
        expect(props.a).toBe(3);
        expect(props.b).toBe(6);

        setBOverride("OVERRIDE B");
        expect(props.a).toBe(3);
        expect(props.b).toBe("OVERRIDE B");
      }),
    );
  });

  describe("overrides are reactive", () => {
    test(
      "dynamic input",
      root(() => {
        const [aOverride, setAOverride] = createSignal<any>(undefined);
        const useHook = createHook(function useHook(props: any) {
          $(props)({
            get a() {
              return aOverride();
            },
          });
          return props;
        });

        const [a, setA] = createSignal(1);
        const props = useHook({
          get a() {
            return a();
          },
        });

        const fn = vitest.fn();
        createComputed(() => fn(props.a));
        expect(fn).toHaveBeenCalledWith(1);
        setA(2);
        expect(fn).toHaveBeenCalledWith(2);
        setAOverride("OVERRIDE");
        expect(fn).toHaveBeenCalledWith("OVERRIDE");
        setA(3);
        expect(fn).toHaveBeenCalledWith("OVERRIDE");
        setAOverride(undefined);
        expect(fn).toHaveBeenCalledWith(3);
      }),
    );

    test(
      "proxy input",
      root(() => {
        const [aOverride, setAOverride] = createSignal<any>(undefined);
        const [bOverride, setBOverride] = createSignal<any>(undefined);
        const useHook = createHook(function useHook(props: any) {
          $(props)({
            get a() {
              return aOverride();
            },
            get b() {
              return bOverride();
            },
          });
          return props;
        });

        const [a, setA] = createSignal(1);
        const [proxyProps, setProxyProps] = createSignal<any>({
          get a() {
            return a();
          },
        });
        const props = useHook(mergeProps({}, proxyProps));

        const fnA = vitest.fn();
        createComputed(() => fnA(props.a));
        expect(fnA).toHaveBeenCalledWith(1);
        setA(2);
        expect(fnA).toHaveBeenCalledWith(2);
        setAOverride("OVERRIDE A");
        expect(fnA).toHaveBeenCalledWith("OVERRIDE A");
        setA(3);
        expect(fnA).toHaveBeenCalledWith("OVERRIDE A");
        setAOverride(undefined);
        expect(fnA).toHaveBeenCalledWith(3);

        const fnB = vitest.fn();
        createComputed(() => fnB(props.b));
        expect(fnB).toHaveBeenCalledWith(undefined);
        const [b, setB] = createSignal(3);
        setProxyProps({
          get a() {
            return a();
          },
          get b() {
            return b();
          },
        });
        expect(fnB).toHaveBeenCalledWith(3);
        setB(4);
        expect(fnB).toHaveBeenCalledWith(4);
        setBOverride("OVERRIDE B");
        expect(fnB).toHaveBeenCalledWith("OVERRIDE B");
        setB(5);
        expect(fnB).toHaveBeenCalledWith("OVERRIDE B");
        setBOverride(undefined);
        expect(fnB).toHaveBeenCalledWith(5);
      }),
    );
  });

  test(
    "smoke test",
    root(() => {
      const [a, setA] = createSignal(1);
      const [b, setB] = createSignal<any>(undefined);
      const [c, setC] = createSignal("INITIAL C");
      const [proxyProps, setProxyProps] = createSignal<any>({
        get a() {
          return a();
        },
        get b() {
          return b();
        },
      });

      const useHook = createHook(function useHook(props: any) {
        $(props, { a: "DEFAULT A", b: "DEFAULT B" });
        $(props)({
          get c() {
            return c();
          },
        });
        $(props)({
          d: "STATIC D",
        });
        return props;
      });

      const props = useHook(mergeProps({}, proxyProps));

      expect(Object.keys(props).sort()).toEqual(["a", "b", "c", "d"]);
      expect(props.a).toBe(1);
      expect(props.b).toBe("DEFAULT B");
      expect(props.c).toBe("INITIAL C");
      expect(props.d).toBe("STATIC D");

      setA(2);
      expect(props.a).toBe(2);

      setB("VALUE B");
      expect(props.b).toBe("VALUE B");

      setC("UPDATED C");
      expect(props.c).toBe("UPDATED C");

      setProxyProps({
        get a() {
          return a();
        },
        get b() {
          return b();
        },
        e: "STATIC E",
      });

      expect(Object.keys(props).sort()).toEqual(["a", "b", "c", "d", "e"]);
      expect(props.a).toBe(2);
      expect(props.b).toBe("VALUE B");
      expect(props.c).toBe("UPDATED C");
      expect(props.d).toBe("STATIC D");
      expect(props.e).toBe("STATIC E");
    }),
  );

  test(
    "nested hooks",
    root(() => {
      const [a, setA] = createSignal(1);
      const [b, setB] = createSignal(2);
      const [c, setC] = createSignal(3);

      const useLevel3 = createHook(function useRoot(props: any) {
        $(props)({
          get c() {
            return c();
          },
        });
        return props;
      });
      const useLevel2 = createHook(function useRoot(props: any) {
        $(props)({
          get b() {
            return b();
          },
        });

        useLevel3(props);
        return props;
      });
      const useLevel1 = createHook(function useRoot(props: any) {
        $(props)({
          get a() {
            return a();
          },
        });
        useLevel2(props);
        return props;
      });

      const props = useLevel1();

      expect(Object.keys(props).sort()).toEqual(["a", "b", "c"]);
      expect(props.a).toBe(1);
      expect(props.b).toBe(2);
      expect(props.c).toBe(3);

      setA(4);
      expect(props.a).toBe(4);
      expect(props.b).toBe(2);
      expect(props.c).toBe(3);

      setB(5);
      expect(props.a).toBe(4);
      expect(props.b).toBe(5);
      expect(props.c).toBe(3);

      setC(6);
      expect(props.a).toBe(4);
      expect(props.b).toBe(5);
      expect(props.c).toBe(6);
    }),
  );

  describe("getter shorthands", () => {
    test(
      "defaults",
      root(() => {
        const [value, setValue] = createSignal<any>(undefined);
        const useHook = createHook(function useHook(props: any) {
          $(props, {
            $value: value,
          });
          return props;
        });
        const props = useHook();

        expect(props.value).toBe(undefined);
        setValue("VALUE");
        expect(props.value).toBe("VALUE");
      }),
    );

    test(
      "overrides",
      root(() => {
        const [value, setValue] = createSignal<any>(undefined);
        const useHook = createHook(function useHook(props: any) {
          $(props)({
            $value: (props) => {
              return { ...props.value, second: 2 };
            },
          });
          $(props)({
            $value: (props) => {
              return { ...props.value, third: 3 };
            },
          });
          return props;
        });
        const props = useHook({
          get value() {
            return value();
          },
        });
        expect(props.value).to.deep.equal({ second: 2, third: 3 });
        setValue({ first: 1 });
        expect(props.value).to.deep.equal({ first: 1, second: 2, third: 3 });
      }),
    );
  });
});

describe("prop freezing", () => {
  test(
    "static input",
    root(() => {
      const [override, setOverride] = createSignal<any>(undefined);
      let a: any;
      const useHook = createHook(function useHook(props: any) {
        const aProp = props.$a;
        a = () => aProp() ?? "FALLBACK";
        $(props, {
          get a() {
            return a();
          },
        })({
          get a() {
            return override();
          },
        });
        return props;
      });

      const [value, setValue] = createSignal<any>(undefined);
      const props = useHook({
        get a() {
          return value();
        },
      });

      expect(props.a).toBe("FALLBACK");
      expect(a()).toBe("FALLBACK");

      setValue("VALUE");
      expect(props.a).toBe("VALUE");
      expect(a()).toBe("VALUE");

      setValue(undefined);
      expect(props.a).toBe("FALLBACK");
      expect(a()).toBe("FALLBACK");

      setOverride("OVERRIDE");
      expect(props.a).toBe("OVERRIDE");
      expect(a()).toBe("FALLBACK");

      setValue("VALUE");
      expect(props.a).toBe("OVERRIDE");
      expect(a()).toBe("VALUE");

      setOverride(undefined);
      expect(props.a).toBe("VALUE");
      expect(a()).toBe("VALUE");
    }),
  );
});

// TODO:
// - prop splitting
// - prop splitting with shadowed props
// - optimizations:
//   - handle when input props are not proxy
//   - cache static values
//   - cache keys
//   - add memos
