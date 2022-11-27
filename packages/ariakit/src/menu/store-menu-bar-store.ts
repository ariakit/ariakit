import {
  MenuBarStore as CoreMenuBarStore,
  MenuBarStoreProps as CoreMenuBarStoreProps,
  MenuBarStoreState,
  createMenuBarStore,
} from "@ariakit/core/menu/menu-bar-store2";
import {
  ParentStore,
  Store,
  useStore,
  useStoreSync,
} from "ariakit-react-utils/store2";

export function useMenuBarStore(props: MenuBarStoreProps = {}): MenuBarStore {
  const store = useStore(() =>
    createMenuBarStore({
      ...props.getState?.(),
      ...props,
      items: props.items ?? props.getState?.()?.items ?? props.defaultItems,
      activeId:
        props.activeId ?? props.getState?.()?.activeId ?? props.defaultActiveId,
    })
  );

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

  return store;
}

export type { MenuBarStoreState };

export type MenuBarStoreProps = CoreMenuBarStoreProps &
  ParentStore<MenuBarStoreState> & {
    defaultItems?: MenuBarStoreState["items"];
    setItems?: (items: MenuBarStoreState["items"]) => void;
    defaultActiveId?: MenuBarStoreState["activeId"];
    setActiveId?: (activeId: MenuBarStoreState["activeId"]) => void;
    setMoves?: (moves: MenuBarStoreState["moves"]) => void;
  };

export type MenuBarStore = Store<CoreMenuBarStore>;
