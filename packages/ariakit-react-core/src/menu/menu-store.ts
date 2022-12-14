import { useContext, useMemo } from "react";
import * as Core from "@ariakit/core/menu/menu-store";
import { BivariantCallback, PickRequired } from "@ariakit/core/utils/types";
import {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store";
import {
  HovercardStoreFunctions,
  HovercardStoreOptions,
  HovercardStoreState,
  useHovercardStoreOptions,
  useHovercardStoreProps,
} from "../hovercard/hovercard-store";
import { Store, useStore, useStoreProps, useStoreState } from "../utils/store";
import { MenuBarContext, MenuContext } from "./menu-context";

type Values = Core.MenuStoreValues;

export function useMenuStoreOptions<T extends Values = Values>(
  props: MenuStoreProps<T>
) {
  const state = props.store?.getState?.();

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
    // TODO: Pass parent prop and remove these default values
    values: props.values ?? state?.values ?? props.defaultValues,
    timeout: props.timeout ?? state?.timeout ?? timeout,
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

export function useMenuStore<T extends Values = Values>(
  props: PickRequired<MenuStoreProps<T>, "values" | "defaultValues">
): MenuStore<T>;

export function useMenuStore(props?: MenuStoreProps): MenuStore;

export function useMenuStore(props: MenuStoreProps = {}): MenuStore {
  const options = useMenuStoreOptions(props);
  const store = useStore(() => Core.createMenuStore({ ...props, ...options }));
  return useMenuStoreProps(store, props);
}

export type MenuStoreValues = Core.MenuStoreValues;

export type MenuStoreState<T extends Values = Values> = Core.MenuStoreState<T> &
  CompositeStoreState &
  HovercardStoreState;

export type MenuStoreFunctions<T extends Values = Values> =
  Core.MenuStoreFunctions<T> &
    CompositeStoreFunctions &
    HovercardStoreFunctions & {
      hideAll: () => void;
    };

export type MenuStoreOptions<T extends Values = Values> =
  Core.MenuStoreOptions<T> &
    CompositeStoreOptions &
    HovercardStoreOptions & {
      setValues?: BivariantCallback<
        (values: MenuStoreState<T>["values"]) => void
      >;
    };

export type MenuStoreProps<T extends Values = Values> = MenuStoreOptions<T> &
  Core.MenuStoreProps<T>;

export type MenuStore<T extends Values = Values> = MenuStoreFunctions<T> &
  Store<Core.MenuStore<T>>;
