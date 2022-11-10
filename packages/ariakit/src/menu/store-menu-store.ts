import { useContext, useMemo } from "react";
import {
  MenuStore as CoreMenuStore,
  MenuStoreProps as CoreMenuStoreProps,
  MenuStoreState,
  createMenuStore,
} from "ariakit-core/menu/menu-store";
import { useEvent } from "ariakit-react-utils/hooks";
import {
  ParentStore,
  Store,
  useStore,
  useStoreState,
  useStoreSync,
} from "ariakit-react-utils/store2";
import { MenuBarContext, MenuContext } from "./__store-utils";

type Values = MenuStoreState["values"];

export function useMenuStore<V extends Values = Values>(
  props: MenuStoreProps<V> = {}
): MenuStore<V> {
  const parentMenu = useContext(MenuContext);
  const parentMenuBar = useContext(MenuBarContext);

  const placement = useStoreState(
    parentMenu || parentMenuBar,
    (state) =>
      props.placement ||
      (state.orientation === "vertical" ? "right-start" : "bottom-start")
  );

  const parentIsMenuBar = !!parentMenuBar && !parentMenu;

  const timeout = parentIsMenuBar ? 0 : 150;

  const getAnchorRect = useEvent(props.getAnchorRect);
  const renderCallback = useEvent(props.renderCallback);
  const store = useStore(() =>
    createMenuStore({
      ...props.getState?.(),
      ...props,
      placement: props.placement ?? props.getState?.()?.placement ?? placement,
      timeout: props.timeout ?? props.getState?.()?.timeout ?? timeout,
      values: props.values ?? props.getState?.()?.values ?? props.defaultValues,
      items: props.items ?? props.getState?.()?.items ?? props.defaultItems,
      activeId:
        props.activeId ?? props.getState?.()?.activeId ?? props.defaultActiveId,
      open: props.open ?? props.getState?.().open ?? props.defaultOpen,
      getAnchorRect: props.getAnchorRect ? getAnchorRect : undefined,
      renderCallback: props.renderCallback ? renderCallback : undefined,
    })
  );

  useStoreSync(store, props, "open", "setOpen");
  useStoreSync(store, props, "animated");
  useStoreSync(store, props, "animating");
  useStoreSync(store, props, "placement", undefined, placement);
  useStoreSync(store, props, "fixed");
  useStoreSync(store, props, "gutter");
  useStoreSync(store, props, "flip");
  useStoreSync(store, props, "shift");
  useStoreSync(store, props, "slide");
  useStoreSync(store, props, "overlap");
  useStoreSync(store, props, "sameWidth");
  useStoreSync(store, props, "fitViewport");
  useStoreSync(store, props, "arrowPadding");
  useStoreSync(store, props, "overflowPadding");

  useStoreSync(store, props, "timeout", undefined, timeout);
  useStoreSync(store, props, "showTimeout");
  useStoreSync(store, props, "hideTimeout");

  useStoreSync(store, props, "items", "setItems");
  useStoreSync(store, props, "activeId", "setActiveId");
  useStoreSync(store, props, "includesBaseElement");
  useStoreSync(store, props, "virtualFocus");
  useStoreSync(store, props, "orientation");
  useStoreSync(store, props, "rtl");
  useStoreSync(store, props, "focusLoop");
  useStoreSync(store, props, "focusWrap");
  useStoreSync(store, props, "focusShift");
  useStoreSync(store, props, "moves");

  useStoreSync(store, props, "values", "setValues");
  useStoreSync(store, props, "initialFocus");

  const hideAll = useEvent(() => {
    store.hide();
    parentMenu?.hideAll();
  });

  return useMemo(() => ({ ...store, hideAll }), [store, hideAll]);
}

export type { MenuStoreState };

export type MenuStoreProps<V extends Values = Values> = CoreMenuStoreProps<V> &
  ParentStore<MenuStoreState<V>> & {
    defaultOpen?: MenuStoreState<V>["open"];
    setOpen?: (open: MenuStoreState<V>["open"]) => void;
    defaultItems?: MenuStoreState<V>["items"];
    setItems?: (items: MenuStoreState<V>["items"]) => void;
    defaultActiveId?: MenuStoreState<V>["activeId"];
    setActiveId?: (activeId: MenuStoreState<V>["activeId"]) => void;
    setMoves?: (moves: MenuStoreState<V>["moves"]) => void;
    defaultValues?: MenuStoreState<V>["values"];
    setValues?: (values: MenuStoreState<V>["values"]) => void;
  };

export type MenuStore<V extends Values = Values> = Store<CoreMenuStore<V>> & {
  hideAll: () => void;
};
