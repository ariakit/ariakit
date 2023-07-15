"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useEvent } from "@ariakit/react-core/utils/hooks";
import invariant from "tiny-invariant";
import { useLocalStorageState } from "utils/use-local-storage-state.js";

function useUpdates({ defaultValue = "2017-01-01" } = {}) {
  const [previousSeenAt, setPreviousSeenAt] = useState(defaultValue);
  const [seenAt, setSeenAt] = useLocalStorageState("seenAt", { defaultValue });
  // const [seenAt, setSeenAt] = useState(defaultValue);

  const seeNow = useEvent(() => {
    setPreviousSeenAt(seenAt);
    setSeenAt(new Date().toISOString());
  });

  const previousSeen = useMemo(
    () => new Date(previousSeenAt),
    [previousSeenAt],
  );
  const seen = useMemo(() => new Date(seenAt), [seenAt]);

  return useMemo(
    () => ({ previousSeen, seen, seeNow }),
    [previousSeen, seen, seeNow],
  );
}

const UpdatesContext = createContext<ReturnType<typeof useUpdates> | null>(
  null,
);

export function useUpdatesContext() {
  const context = useContext(UpdatesContext);
  invariant(context);
  return context;
}

export function UpdatesProvider(props: {
  children: ReactNode;
  defaultValue?: string;
}) {
  const value = useUpdates(props);
  return (
    <UpdatesContext.Provider value={value}>
      {props.children}
    </UpdatesContext.Provider>
  );
}
