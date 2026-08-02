import type { Store } from "@ariakit/store";
import type { SetState } from "@ariakit/utils";
import type { CompositeStoreState } from "./composite-store.ts";

interface CompositeStoreSetters<S extends CompositeStoreState> {
  setState: Store<S>["setState"];
  setCompositeElement: SetState<S["compositeElement"]>;
  setBaseElement: SetState<S["baseElement"]>;
}

export function createCompositeStoreSetters<S extends CompositeStoreState>(
  store: Store<S>,
): CompositeStoreSetters<S> {
  const setState: Store<S>["setState"] = (key, value) => {
    if (key === "compositeElement" || key === "baseElement") {
      store.setState(key, value);
      if (key === "compositeElement") {
        store.setState("baseElement", store.getState().compositeElement);
      } else {
        store.setState("compositeElement", store.getState().baseElement);
      }
      return;
    }
    if (
      key === "compositeElementInFocusOrder" ||
      key === "includesBaseElement"
    ) {
      store.setState(key, value);
      if (key === "compositeElementInFocusOrder") {
        store.setState(
          "includesBaseElement",
          store.getState().compositeElementInFocusOrder,
        );
      } else {
        store.setState(
          "compositeElementInFocusOrder",
          store.getState().includesBaseElement,
        );
      }
      return;
    }
    store.setState(key, value);
  };

  return {
    setState,
    setCompositeElement: (element) => setState("compositeElement", element),
    setBaseElement: (element) => setState("compositeElement", element),
  };
}
