import { useMemo, useState } from "react";
import { useEvent } from "@ariakit/react-core/utils/hooks";
import type { UpdateItem } from "updates.js";
import useLocalStorageState from "use-local-storage-state";

export interface UseUpdatesProps {
  defaultValue?: string;
  updates?: UpdateItem[];
}

export function useUpdates({
  defaultValue = "2017-01-01",
  updates,
}: UseUpdatesProps = {}) {
  const [previousSeenAt, setPreviousSeenAt] = useState(defaultValue);
  const [seenAt, setSeenAt] = useLocalStorageState("seenAt", { defaultValue });
  // const [seenAt, setSeenAt] = useState(defaultValue);

  const seeNow = useEvent(() => {
    setPreviousSeenAt(seenAt);
    setSeenAt(updates?.[0]?.dateTime || new Date().toISOString());
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
