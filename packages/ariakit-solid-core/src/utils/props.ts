import { $PROXY, type JSX } from "solid-js";

// prop traps
// ----------

// Copied from solid repo - src/render/component.ts

function trueFn() {
  return true;
}

const propTraps: ProxyHandler<{
  get: (k: string | number | symbol) => any;
  has: (k: string | number | symbol) => boolean;
  keys: () => string[];
}> = {
  get(_, property, receiver) {
    if (property === $PROXY) return receiver;
    return _.get(property);
  },
  has(_, property) {
    if (property === $PROXY) return true;
    return _.has(property);
  },
  set: trueFn,
  deleteProperty: trueFn,
  getOwnPropertyDescriptor(_, property) {
    return {
      configurable: true,
      enumerable: true,
      get() {
        return _.get(property);
      },
      set: trueFn,
      deleteProperty: trueFn,
    };
  },
  ownKeys(_) {
    return _.keys();
  },
};

// props sink
// ----------

type PropsObject = Record<string | number | symbol, unknown>;
type Sources = Array<PropsObject>;
type SinkState = { sources: Sources; sink: unknown; offset: number };

let state: SinkState | undefined;

function getSinkState() {
  if (!state) throw new Error("Missing props sink state");
  return state;
}

function ensureSource(source?: PropsObject) {
  if (!source) throw new Error("Missing props source");
  return source;
}

function resolvePropValue(
  sources: Sources,
  property: string | number | symbol,
  { from = 0, to = sources.length }: { from?: number; to?: number } = {},
) {
  for (let i = from; i < to; i++) {
    const v = ensureSource(sources[i])[property];
    if (v !== undefined) return v;
  }
  return undefined;
}

function createAccessor<V = unknown>(property: string) {
  const frozenState = getSinkState();
  const frozenN = frozenState.sources.length;
  const frozenOffset = frozenState.offset;
  return () =>
    resolvePropValue(frozenState.sources, property, {
      from: frozenState.offset - frozenOffset,
      to: frozenN + frozenState.offset - frozenOffset,
    }) as V;
}

function createPropsSink<T>(props: T) {
  const sources: Array<PropsObject> = [props as PropsObject];
  // TODO: do something different if props is not a proxy
  // const isProxy = props && $PROXY in (props as PropsObject);
  const sink = new Proxy(
    {
      get(property: string | number | symbol) {
        if (typeof property === "string" && property.startsWith("$")) {
          return createAccessor(property.substring(1));
        }
        return resolvePropValue(sources, property);
      },
      has(property: string | number | symbol) {
        for (let i = 0; i < sources.length; i++) {
          if (property in ensureSource(sources[i])) return true;
        }
        return false;
      },
      keys() {
        const keys = [];
        for (let i = 0; i < sources.length; i++)
          keys.push(...Object.keys(ensureSource(sources[i])));
        return [...new Set(keys)];
      },
    },
    propTraps,
  ) as T;
  state = { sources, sink, offset: 0 };
  return sink;
}

function cleanPropsSink() {
  state = undefined;
}

export function withPropsSink<T>(props: unknown, fn: (sink: any) => T) {
  if (state) return fn(state.sink);
  const sink = createPropsSink(props);
  try {
    return fn(sink);
  } finally {
    cleanPropsSink();
    // TODO: re-throw error?
  }
}

// props chain
// -----------

function expandGetterShorthands<T extends JSX.HTMLAttributes<any>>(
  props: T,
  withPropPassthrough = false,
) {
  for (const key in props) {
    if (key.startsWith("$")) {
      let get: () => unknown;
      const property = key.substring(1);
      if (withPropPassthrough) {
        const inputGetter = props[key] as (props: unknown) => unknown;
        const frozenAccessor = createAccessor(key.substring(1));
        const stubProps = {};
        Object.defineProperty(stubProps, property, {
          get: frozenAccessor,
          enumerable: true,
          configurable: true,
        });
        get = () => inputGetter(stubProps);
      } else {
        get = props[key] as () => unknown;
      }
      delete props[key];
      Object.defineProperty(props, property, {
        get,
        enumerable: true,
        configurable: true,
      });
    }
  }
}

export type PropsSink<T> = T & {
  [K in keyof T as K extends string ? `$${K}` : never]-?: () => T[K];
};
export type UnwrapPropSinkProps<T> = {
  [K in keyof T as K extends `$${infer _}` ? never : K]: T[K];
};

type WithGetterShorthands<T, P = UnwrapPropSinkProps<T>> = P & {
  [K in keyof P as K extends string ? `$${K}` : never]?: () => P[K];
};
type WithGetterShorthandsWithPassthrough<T, P = UnwrapPropSinkProps<T>> = P & {
  [K in keyof P as K extends string ? `$${K}` : never]?: (
    props: Record<K, P[K]>,
  ) => P[K];
};

type Compute<T> = {
  [K in keyof T]: T[K];
};

export function $<P extends JSX.HTMLAttributes<any>>(
  _originalProps: P,
  props?: NoInfer<WithGetterShorthands<P>>,
) {
  const sinkState = getSinkState();
  if (props) {
    expandGetterShorthands(props);
    sinkState.sources.push(props as PropsObject);
  }
  return (overrides: WithGetterShorthandsWithPassthrough<P>) => {
    expandGetterShorthands(overrides, true);
    sinkState.sources.unshift(overrides as PropsObject);
    sinkState.offset++;
  };
}
