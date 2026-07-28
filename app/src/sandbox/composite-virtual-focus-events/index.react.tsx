import * as Ariakit from "@ariakit/react";
import type { SyntheticEvent } from "react";
import { useCallback, useState } from "react";

function getEventDescription(event: SyntheticEvent) {
  const target = event.target instanceof Element ? event.target.id : "";
  const relatedTarget =
    "relatedTarget" in event && event.relatedTarget instanceof Element
      ? event.relatedTarget.id
      : "";
  return [
    `event: ${event.type}`,
    `currentTarget: ${event.currentTarget.id}`,
    `target: ${target}`,
    relatedTarget ? `relatedTarget: ${relatedTarget}` : undefined,
  ]
    .filter(Boolean)
    .join(" | ");
}

export default function Example() {
  const [events, setEvents] = useState<string[]>([]);
  const onEvent = useCallback((event: SyntheticEvent) => {
    const description = getEventDescription(event);
    setEvents((currentEvents) => [...currentEvents, description]);
  }, []);
  const eventProps = {
    onFocus: onEvent,
    onBlur: onEvent,
    onKeyDown: onEvent,
    onKeyUp: onEvent,
  };
  return (
    <main>
      <h1>Composite virtual focus events</h1>
      <Ariakit.CompositeProvider virtualFocus>
        <Ariakit.Composite id="toolbar" role="toolbar" {...eventProps}>
          <Ariakit.CompositeItem id="item-1" {...eventProps}>
            item-1
          </Ariakit.CompositeItem>
          <Ariakit.CompositeItem id="item-2" {...eventProps}>
            item-2
          </Ariakit.CompositeItem>
          <Ariakit.CompositeItem id="item-3" {...eventProps}>
            item-3
          </Ariakit.CompositeItem>
        </Ariakit.Composite>
      </Ariakit.CompositeProvider>
      <button type="button">External button</button>
      <ol aria-label="Event log">
        {events.map((event, index) => (
          <li key={`${index}-${event}`}>{event}</li>
        ))}
      </ol>
    </main>
  );
}
