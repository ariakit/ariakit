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

let sources: Array<PropsObject> | undefined;
let sink: unknown;

function ensure<T>(value: T) {
  if (!value) throw new Error("Missing value");
  return value;
}

function createPropsSink<T>(props: T) {
  const localSources: Array<PropsObject> = [props as PropsObject];
  sources = localSources;
  const isProxy = props && $PROXY in (props as PropsObject);
  // TODO: do something different if props is not a proxy
  const localSink = new Proxy(
    {
      get(property: string | number | symbol) {
        for (let i = localSources.length - 1; i >= 0; i--) {
          const v = ensure(localSources[i])[property];
          if (v !== undefined) return v;
        }
      },
      has(property: string | number | symbol) {
        for (let i = localSources.length - 1; i >= 0; i--) {
          if (property in ensure(localSources[i])) return true;
        }
        return false;
      },
      keys() {
        const keys = [];
        for (let i = 0; i < localSources.length; i++)
          keys.push(...Object.keys(ensure(localSources[i])));
        return [...new Set(keys)];
      },
    },
    propTraps,
  ) as T;
  sink = localSink;
  return localSink;
}

function cleanPropsSink() {
  sources = undefined;
  sink = undefined;
}

export function withPropsSink<T>(props: unknown, fn: (sink: any) => T) {
  const propsSink = createPropsSink(props);
  try {
    return fn(propsSink);
  } finally {
    cleanPropsSink();
  }
}

// props chain
// -----------

function expandDollarGetters<T extends JSX.HTMLAttributes<any>>(props: T) {
  for (const key in props) {
    if (key.startsWith("$")) {
      const get = props[key] as () => unknown;
      delete props[key];
      Object.defineProperty(props, key.substring(1), {
        get,
        enumerable: true,
        configurable: true,
      });
    }
  }
}

type HTMLAttributesWithDollarGetters<T> = {
  [K in keyof JSX.HTMLAttributes<T> as `$${K}`]: () => JSX.HTMLAttributes<T>[K];
};

export function chain<T extends JSX.HTMLAttributes<any>>(
  props: (T & HTMLAttributesWithDollarGetters<T>) | undefined,
  _originalProps: T,
  overrides?: T & HTMLAttributesWithDollarGetters<T>,
) {
  if (!sources || !sink) throw new Error("Missing props sources or sink");
  if (props) {
    expandDollarGetters(props);
    sources.push(props as PropsObject);
  }
  if (overrides) sources.unshift(overrides as PropsObject);
  return sink as T;
}
