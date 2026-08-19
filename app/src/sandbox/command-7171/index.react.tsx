import * as Ariakit from "@ariakit/react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

// An event built in another realm fails `instanceof` against every constructor
// of the window checking it, so the interface and the realm have to be read
// separately. The constructor name is comparable across realms, while
// `instanceof ownerWindow.Event` answers only the realm question.
function isPointerEvent(event: globalThis.MouseEvent): event is PointerEvent {
  return "pointerId" in event;
}

function describeClickEvent(event: globalThis.MouseEvent, element: Element) {
  // The window that owns the element is the realm a listener sitting next to it
  // checks against, and the one browsers build the click in. A missing
  // `defaultView` reports "other window" instead of falling back to the ambient
  // window, which is the realm the reported bug builds its event in and would
  // hide the difference this fixture exists to show.
  const ownerWindow = element.ownerDocument.defaultView;
  const realm =
    ownerWindow && event instanceof ownerWindow.Event
      ? "own window"
      : "other window";
  const pointer = isPointerEvent(event)
    ? `pointerId ${event.pointerId}, pointerType "${event.pointerType}"`
    : "no pointer members";
  return `${event.constructor.name}, ${realm}, ${pointer}`;
}

function createClickReporter(setEvents: Dispatch<SetStateAction<string[]>>) {
  return (event: MouseEvent<HTMLElement>) => {
    const description = describeClickEvent(
      event.nativeEvent,
      event.currentTarget,
    );
    setEvents((events) => [...events, description]);
  };
}

export default function Example() {
  const [clickEvents, setClickEvents] = useState<string[]>([]);
  const [frameClickEvents, setFrameClickEvents] = useState<string[]>([]);
  const [frameBody, setFrameBody] = useState<HTMLElement | null>(null);

  const setFrame = useCallback((element: HTMLIFrameElement | null) => {
    setFrameBody(element?.contentDocument?.body ?? null);
  }, []);

  return (
    <main>
      <h1>Command keyboard click event</h1>

      {/* Both commands render a non-native element on purpose, because that is
          what makes `Command` synthesize the click for Enter and Space. On a
          native button the browser dispatches it, and `@ariakit/test` simulates
          it, so neither would exercise the code under test. */}
      <Ariakit.Command
        role="button"
        render={<div />}
        onClick={createClickReporter(setClickEvents)}
      >
        Report click
      </Ariakit.Command>
      <h2 id="document-click-events">Document click events</h2>
      <ul aria-labelledby="document-click-events" aria-live="polite">
        {clickEvents.map((description, index) => (
          <li key={index}>{description}</li>
        ))}
      </ul>

      {/* A same-origin frame owns its own constructors, so a listener inside it
          only recognizes events the frame's own window built. */}
      <iframe title="Command frame" ref={setFrame} />
      {frameBody
        ? createPortal(
            <Ariakit.Command
              role="button"
              render={<div />}
              onClick={createClickReporter(setFrameClickEvents)}
            >
              Frame command
            </Ariakit.Command>,
            frameBody,
          )
        : null}
      <h2 id="frame-click-events">Frame click events</h2>
      <ul aria-labelledby="frame-click-events" aria-live="polite">
        {frameClickEvents.map((description, index) => (
          <li key={index}>{description}</li>
        ))}
      </ul>
    </main>
  );
}
