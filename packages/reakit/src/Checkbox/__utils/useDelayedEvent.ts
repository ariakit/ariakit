import * as React from "react";
import { useLiveRef } from "reakit-utils/useLiveRef";

// https://github.com/reakit/reakit/issues/393
export function useDelayedEvent<E extends React.SyntheticEvent>(
  event?: React.EventHandler<E>
) {
  const eventRef = useLiveRef(event);
  const [delayedEvent, setDelayedEvent] = React.useState<E | null>(null);

  React.useEffect(() => {
    if (delayedEvent && eventRef.current) {
      eventRef.current(delayedEvent);
      setDelayedEvent(null);
    }
  }, [delayedEvent]);

  return (syntheticEvent: E) => {
    syntheticEvent.persist();
    setDelayedEvent(syntheticEvent);
  };
}
