import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { chain } from "@ariakit/core/utils/misc";
import { sync } from "@ariakit/core/utils/store";
import { useSafeLayoutEffect } from "../../utils/hooks.js";
import type { WrapElement } from "../../utils/types.js";
import type { DialogStore } from "../dialog-store.js";

const NestedDialogsContext = createContext<{
  store?: DialogStore;
  add?: (store: DialogStore) => () => void;
}>({});

export function useNestedDialogs(store: DialogStore) {
  const context = useContext(NestedDialogsContext);
  const [dialogs, setDialogs] = useState<DialogStore[]>([]);

  const add = useCallback(
    (dialog: DialogStore) => {
      setDialogs((dialogs) => [...dialogs, dialog]);
      return chain(context.add?.(dialog), () => {
        setDialogs((dialogs) => dialogs.filter((d) => d !== dialog));
      });
    },
    [context],
  );

  // If it's a nested dialog, add it to the context
  useSafeLayoutEffect(() => {
    return sync(store, ["open", "contentElement"], (state) => {
      if (!state.open) return;
      if (!state.contentElement) return;
      return context.add?.(store);
    });
  }, [store, context]);

  // Close all nested dialogs when the parent dialog closes
  useSafeLayoutEffect(() => {
    return sync(context.store, ["open"], (state) => {
      if (state.open) return;
      // store.hide();
    });
  }, [context, store]);

  // Provider
  const providerValue = useMemo(() => ({ store, add }), [store, add]);

  const wrapElement: WrapElement = useCallback(
    (element) => (
      <NestedDialogsContext.Provider value={providerValue}>
        {element}
      </NestedDialogsContext.Provider>
    ),
    [providerValue],
  );

  return { wrapElement, nestedDialogs: dialogs };
}
