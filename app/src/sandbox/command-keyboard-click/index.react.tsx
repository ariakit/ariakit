import * as Ariakit from "@ariakit/react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";
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

function describeClickMetadata(event: globalThis.MouseEvent, element: Element) {
  const ownerWindow = element.ownerDocument.defaultView;
  const view =
    event.view === ownerWindow
      ? "own window"
      : event.view
        ? "other window"
        : "null";
  return `view ${view}, composed ${event.composed}`;
}

function createClickReporter(
  setEvents: Dispatch<SetStateAction<string[]>>,
  setMetadata: Dispatch<SetStateAction<string[]>>,
) {
  return (event: MouseEvent<HTMLElement>) => {
    const description = describeClickEvent(
      event.nativeEvent,
      event.currentTarget,
    );
    setEvents((events) => [...events, description]);
    const metadata = describeClickMetadata(
      event.nativeEvent,
      event.currentTarget,
    );
    setMetadata((events) => [...events, metadata]);
  };
}

export default function Example() {
  const [clickEvents, setClickEvents] = useState<string[]>([]);
  const [clickMetadata, setClickMetadata] = useState<string[]>([]);
  const [frameClickEvents, setFrameClickEvents] = useState<string[]>([]);
  const [frameClickMetadata, setFrameClickMetadata] = useState<string[]>([]);
  const [frameBody, setFrameBody] = useState<HTMLElement | null>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const [outerShadowClicks, setOuterShadowClicks] = useState(0);

  const setFrame = useCallback((element: HTMLIFrameElement | null) => {
    setFrameBody(element?.contentDocument?.body ?? null);
  }, []);

  const setShadowHost = useCallback((element: HTMLDivElement | null) => {
    setShadowRoot(
      element?.shadowRoot ?? element?.attachShadow({ mode: "open" }) ?? null,
    );
  }, []);

  useEffect(() => {
    const host = shadowRoot?.host;
    const ownerDocument = host?.ownerDocument;
    if (!host || !ownerDocument) return;
    const onClick = (event: Event) => {
      if (!event.composedPath().includes(host)) return;
      setOuterShadowClicks((count) => count + 1);
    };
    ownerDocument.addEventListener("click", onClick);
    return () => ownerDocument.removeEventListener("click", onClick);
  }, [shadowRoot]);

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
        onClick={createClickReporter(setClickEvents, setClickMetadata)}
      >
        Report click
      </Ariakit.Command>
      <h2 id="document-click-events">Document click events</h2>
      <ul aria-labelledby="document-click-events" aria-live="polite">
        {clickEvents.map((description, index) => (
          <li key={index}>{description}</li>
        ))}
      </ul>
      <h2 id="document-click-metadata">Document click metadata</h2>
      <ul aria-labelledby="document-click-metadata" aria-live="polite">
        {clickMetadata.map((metadata, index) => (
          <li key={index}>{metadata}</li>
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
              onClick={createClickReporter(
                setFrameClickEvents,
                setFrameClickMetadata,
              )}
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
      <h2 id="frame-click-metadata">Frame click metadata</h2>
      <ul aria-labelledby="frame-click-metadata" aria-live="polite">
        {frameClickMetadata.map((metadata, index) => (
          <li key={index}>{metadata}</li>
        ))}
      </ul>

      <h2>Shadow boundary</h2>
      <div data-shadow-host ref={setShadowHost} />
      {shadowRoot
        ? createPortal(
            <Ariakit.Command role="button" render={<div />}>
              Shadow command
            </Ariakit.Command>,
            shadowRoot,
          )
        : null}
      <p role="status">Outer shadow clicks: {outerShadowClicks}</p>
    </main>
  );
}
