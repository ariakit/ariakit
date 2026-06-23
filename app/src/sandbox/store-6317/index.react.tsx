import * as Ariakit from "@ariakit/react";
import { createStore, subscribe, sync } from "@ariakit/store";
import { useEffect, useState } from "react";

export default function Example() {
  const [likes] = useState(() => createStore({ count: 0 }));
  const [count, setCount] = useState(() => likes.getState().count);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    let unsubscribeLogger: (() => void) | undefined;
    let loggerAttached = false;

    // TODO: Remove once https://github.com/ariakit/ariakit/issues/6317 is
    // fixed. This forces the slow notification path, which delivers the
    // in-flight dispatch to all-keys listeners registered during it.
    const unsubscribeFastPathWorkaround = subscribe(likes, null, () => {});

    // Keep the rendered count in sync and lazily attach the whole-store logger
    // on the first user change. The logger should still observe the dispatch
    // that attached it.
    const unsubscribeCount = sync(likes, ["count"], (state) => {
      setCount(state.count);
      if (loggerAttached) return;
      if (!state.count) return;
      loggerAttached = true;
      unsubscribeLogger = subscribe(likes, null, (state, prevState) => {
        setLog((entries) => [
          ...entries,
          `${prevState.count} -> ${state.count}`,
        ]);
      });
    });

    return () => {
      unsubscribeCount();
      unsubscribeLogger?.();
      unsubscribeFastPathWorkaround();
    };
  }, [likes]);

  return (
    <div>
      <Ariakit.Button
        onClick={() => likes.setState("count", (count) => count + 1)}
      >
        Like ({count})
      </Ariakit.Button>
      <p>
        Activity log:{" "}
        <output>{log.length ? log.join(", ") : "No activity yet"}</output>
      </p>
    </div>
  );
}
