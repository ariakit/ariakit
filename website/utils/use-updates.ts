import { useMemo, useState } from "react";
import { useEvent } from "@ariakit/react-core/utils/hooks";
import { useLocalStorageState } from "./use-local-storage-state.js";

export function useUpdates({ defaultValue = "2017-01-01" } = {}) {
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
