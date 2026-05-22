import * as React from "react";
import type { Store } from "./store.tsx";

type StoreProvider<T extends Store> = React.ComponentType<{
  value: T | undefined;
  children?: React.ReactNode;
}>;

/**
 * Creates an Ariakit store context with hooks and provider components.
 */
export function createStoreContext<T extends Store>(
  providers: StoreProvider<T>[] = [],
  scopedProviders: StoreProvider<T>[] = [],
) {
  const context = React.createContext<T | undefined>(undefined);
  const scopedContext = React.createContext<T | undefined>(undefined);

  const useContext = () => React.useContext(context);

  const useScopedContext = (onlyScoped = false) => {
    const scoped = React.useContext(scopedContext);
    const store = useContext();
    if (onlyScoped) return scoped;
    return scoped || store;
  };

  const useProviderContext = () => {
    const scoped = React.useContext(scopedContext);
    const store = useContext();
    if (scoped && scoped === store) return;
    return store;
  };

  const ContextProvider = (
    props: React.ComponentPropsWithoutRef<typeof context.Provider>,
  ) => {
    return providers.reduceRight(
      (children, Provider) => <Provider {...props}>{children}</Provider>,
      <context.Provider {...props} />,
    );
  };

  const ScopedContextProvider = (
    props: React.ComponentPropsWithoutRef<typeof scopedContext.Provider>,
  ) => {
    return (
      <ContextProvider {...props}>
        {scopedProviders.reduceRight(
          (children, Provider) => (
            <Provider {...props}>{children}</Provider>
          ),
          <scopedContext.Provider {...props} />,
        )}
      </ContextProvider>
    );
  };

  return {
    context,
    scopedContext,
    useContext,
    useScopedContext,
    useProviderContext,
    ContextProvider,
    ScopedContextProvider,
  };
}
