import { createStore } from "@ariakit/store";
import type { Store } from "@ariakit/store";
import { render } from "@ariakit/test/react";
import type { ReactNode } from "react";
import { expect, test } from "vitest";
import {
  createStoreContext,
  isProviderComponent,
  useStoreProp,
} from "./system.tsx";
import type { ProviderComponent } from "./system.tsx";

interface ProbeProps {
  store?: Store | ProviderComponent | null;
  fallbacks?: Array<Store | null | undefined>;
  onResolve: (store: Store | undefined) => void;
}

function Probe({ store, fallbacks = [], onResolve }: ProbeProps) {
  onResolve(useStoreProp(store, ...fallbacks));
  return null;
}

test("isProviderComponent matches only branded provider components", () => {
  const { createProviderComponent } = createStoreContext();
  const Provider = createProviderComponent(function Provider() {
    return null;
  });
  const PlainComponent = () => null;

  expect(isProviderComponent(Provider)).toBe(true);
  expect(isProviderComponent(PlainComponent)).toBe(false);
  expect(isProviderComponent(createStore({}))).toBe(false);
  expect(isProviderComponent(null)).toBe(false);
  expect(isProviderComponent(undefined)).toBe(false);
});

test("useStoreProp returns the store prop without reading fallbacks", async () => {
  const store = createStore({});
  const fallbackStore = createStore({});
  const resolved: Array<Store | undefined> = [];

  await render(
    <Probe
      store={store}
      fallbacks={[fallbackStore]}
      onResolve={(value) => resolved.push(value)}
    />,
  );

  expect(resolved.at(-1)).toBe(store);
});

test("useStoreProp falls back to the first truthy fallback in order", async () => {
  const firstStore = createStore({});
  const secondStore = createStore({});
  const resolved: Array<Store | undefined> = [];

  await render(
    <Probe
      fallbacks={[null, undefined, firstStore, secondStore]}
      onResolve={(value) => resolved.push(value)}
    />,
  );

  expect(resolved.at(-1)).toBe(firstStore);
});

test("useStoreProp resolves a provider component from its own context, ignoring fallbacks", async () => {
  const { ContextProvider, createProviderComponent } = createStoreContext();

  interface ProviderProps {
    store: Store;
    children?: ReactNode;
  }

  const Provider = createProviderComponent(function Provider({
    store,
    children,
  }: ProviderProps) {
    return <ContextProvider value={store}>{children}</ContextProvider>;
  });

  const providerStore = createStore({});
  const fallbackStore = createStore({});
  const resolved: Array<Store | undefined> = [];

  await render(
    <Provider store={providerStore}>
      <Probe
        store={Provider}
        fallbacks={[fallbackStore]}
        onResolve={(value) => resolved.push(value)}
      />
    </Provider>,
  );

  expect(resolved.at(-1)).toBe(providerStore);
});

test("useStoreProp resolves a provider component from an extending provider's context", async () => {
  const base = createStoreContext();
  const extending = createStoreContext([base.ContextProvider]);

  const BaseProvider = base.createProviderComponent(function BaseProvider() {
    return null;
  });

  interface ExtendingProviderProps {
    store: Store;
    children?: ReactNode;
  }

  // Mirrors how extending providers work (for example, PopoverProvider also
  // sets the dialog context): the extending ContextProvider composes the base
  // ContextProvider with the same store value.
  const ExtendingProvider = extending.createProviderComponent(
    function ExtendingProvider({ store, children }: ExtendingProviderProps) {
      return (
        <extending.ContextProvider value={store}>
          {children}
        </extending.ContextProvider>
      );
    },
  );

  const extendingStore = createStore({});
  const resolved: Array<Store | undefined> = [];

  await render(
    <ExtendingProvider store={extendingStore}>
      <Probe store={BaseProvider} onResolve={(value) => resolved.push(value)} />
    </ExtendingProvider>,
  );

  expect(resolved.at(-1)).toBe(extendingStore);
});

test("useStoreProp does not fall back when a provider component has no matching provider", async () => {
  const { createProviderComponent } = createStoreContext();
  const Provider = createProviderComponent(function Provider() {
    return null;
  });

  const fallbackStore = createStore({});
  const resolved: Array<Store | undefined> = [];

  await render(
    <Probe
      store={Provider}
      fallbacks={[fallbackStore]}
      onResolve={(value) => resolved.push(value)}
    />,
  );

  expect(resolved.at(-1)).toBeUndefined();
});
