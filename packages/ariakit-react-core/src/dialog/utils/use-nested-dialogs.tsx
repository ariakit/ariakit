import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { chain } from "@ariakit/core/utils/misc";
import { useSafeLayoutEffect } from "../../utils/hooks.js";
import type { WrapElement } from "../../utils/types.js";
import type { DialogStore } from "../dialog-store.js";

const NestedDialogsContext = createContext<{
  store?: DialogStore;
  add?: (store: HTMLElement) => () => void;
}>({});

export function useNestedDialogs(store: DialogStore) {
  const context = useContext(NestedDialogsContext);
  const [dialogs, setDialogs] = useState<HTMLElement[]>([]);

  const add = useCallback(
    (dialog: HTMLElement) => {
      setDialogs((dialogs) => [...dialogs, dialog]);
      return chain(context.add?.(dialog), () => {
        setDialogs((dialogs) => dialogs.filter((d) => d !== dialog));
      });
    },
    [context]
  );

  // If it's a nested dialog, add it to the context
  useSafeLayoutEffect(() => {
    return store.sync(
      (state) => {
        if (!state.contentElement) return;
        return context.add?.(state.contentElement);
      },
      ["contentElement"]
    );
  }, [store, context]);

  // Close all nested dialogs when the parent dialog closes
  useSafeLayoutEffect(() => {
    return context.store?.sync(
      (state) => {
        if (state.open) return;
        store.hide();
      },
      ["open"]
    );
  }, [context, store]);

  // Provider
  const providerValue = useMemo(() => ({ store, add }), [store, add]);

  const wrapElement: WrapElement = useCallback(
    (element) => (
      <NestedDialogsContext.Provider value={providerValue}>
        {element}
      </NestedDialogsContext.Provider>
    ),
    [providerValue]
  );

  return { wrapElement, nestedDialogs: dialogs };
}
