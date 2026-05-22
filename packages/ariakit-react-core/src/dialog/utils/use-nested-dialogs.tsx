import { useSafeLayoutEffect } from "@ariakit/react-utils";
import type { WrapElement } from "@ariakit/react-utils";
import { sync } from "@ariakit/store";
import { chain } from "@ariakit/utils";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { DialogStore } from "../dialog-store.ts";

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
