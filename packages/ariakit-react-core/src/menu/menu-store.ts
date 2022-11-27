import { useContext, useMemo } from "react";
import {
  MenuStore as CoreMenuStore,
  MenuStoreProps as CoreMenuStoreProps,
  MenuStoreState,
  MenuStoreValues,
  createMenuStore,
} from "@ariakit/core/menu/menu-store";
import { Store as CoreStore } from "@ariakit/core/utils/store";
import { BivariantCallback } from "@ariakit/core/utils/types";
import {
  CompositeStoreProps,
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store";
import {
  HovercardStoreProps,
  useHovercardStoreOptions,
  useHovercardStoreProps,
} from "../hovercard/hovercard-store";
import { Store, useStore, useStoreProps, useStoreState } from "../utils/store";
import { MenuBarContext, MenuContext } from "./menu-context";

export function useMenuStoreOptions<
  T extends MenuStoreValues = MenuStoreValues
>(props: MenuStoreProps<T>) {
  const parentMenu = useContext(MenuContext);
  const parentMenuBar = useContext(MenuBarContext);
  const placementProp = props.placement;

  const placement = useStoreState(
    parentMenu || parentMenuBar,
    (state) =>
      placementProp ||
      (state.orientation === "vertical" ? "right-start" : "bottom-start")
  );

  const parentIsMenuBar = !!parentMenuBar && !parentMenu;
  const timeout = parentIsMenuBar ? 0 : 150;

  return {
    ...useCompositeStoreOptions(props),
    ...useHovercardStoreOptions(props),
    values: props.values ?? props.getState?.().values ?? props.defaultValues,
    timeout: props.timeout ?? timeout,
    placement,
  };
}

export function useMenuStoreProps<T extends Omit<MenuStore, "hideAll">>(
  store: T,
  props: MenuStoreProps
) {
  const parentMenu = useContext(MenuContext);

  store = useCompositeStoreProps(store, props);
  store = useHovercardStoreProps(store, props);
  useStoreProps(store, props, "values", "setValues");

  return useMemo(
    () => ({
      ...store,
      hideAll: () => {
        store.hide();
        parentMenu?.hideAll();
      },
    }),
    [store]
  );
}

export function useMenuStore<T extends MenuStoreValues = MenuStoreValues>(
  props: MenuStoreProps<T> = {}
): MenuStore<T> {
  const options = useMenuStoreOptions(props);
  const store = useStore(() => createMenuStore({ ...props, ...options }));
  return useMenuStoreProps(store, props);
}

export type { MenuStoreState };

export type MenuStore<T extends MenuStoreValues = MenuStoreValues> = Store<
  CoreMenuStore<T>
> & {
  hideAll: () => void;
};

export type MenuStoreProps<T extends MenuStoreValues = MenuStoreValues> = Omit<
  CompositeStoreProps,
  keyof CoreStore
> &
  Omit<HovercardStoreProps, keyof CoreStore> &
  CoreMenuStoreProps<T> & {
    defaultValues?: MenuStoreState<T>["values"];
    setValues?: BivariantCallback<
      (values: MenuStoreState<T>["values"]) => void
    >;
  };
