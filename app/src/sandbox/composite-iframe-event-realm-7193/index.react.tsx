import * as Ariakit from "@ariakit/react";
import type { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

const tools = ["Bold", "Italic", "Underline"];

// `instanceof` is realm-bound, so the realm is read from the element the
// listener sits on rather than the ambient window, which is the realm the
// reported bug builds its events in and would hide the difference.
// https://github.com/ariakit/ariakit/issues/7193
function describeEvent(event: SyntheticEvent<Element>) {
  const ownerWindow = event.currentTarget.ownerDocument.defaultView;
  const realm =
    ownerWindow && event.nativeEvent instanceof ownerWindow.Event
      ? "own window"
      : "other window";
  return `${event.nativeEvent.constructor.name}, ${realm}`;
}

interface EmbeddedToolbarProps {
  setKeyboardEvents: Dispatch<SetStateAction<string[]>>;
  setBlurEvents: Dispatch<SetStateAction<string[]>>;
}

function EmbeddedToolbar({
  setKeyboardEvents,
  setBlurEvents,
}: EmbeddedToolbarProps) {
  // Virtual focus keeps DOM focus on the toolbar, so `Composite` forwards the
  // keyboard event to the active item and blurs the previous one itself.
  // Without it neither synthetic event exists and no item listener runs.
  const composite = Ariakit.useCompositeStore({ virtualFocus: true });
  return (
    <Ariakit.Composite store={composite} role="toolbar" aria-label="Formatting">
      {tools.map((tool) => (
        <Ariakit.CompositeItem
          key={tool}
          // React nulls `currentTarget` once dispatch ends, and a state updater
          // runs later, so the event has to be described before updating.
          onKeyDown={(event) => {
            const description = describeEvent(event);
            setKeyboardEvents((events) => [...events, description]);
          }}
          onBlur={(event) => {
            const description = describeEvent(event);
            setBlurEvents((events) => [...events, description]);
          }}
        >
          {tool}
        </Ariakit.CompositeItem>
      ))}
    </Ariakit.Composite>
  );
}

export default function Example() {
  const [keyboardEvents, setKeyboardEvents] = useState<string[]>([]);
  const [blurEvents, setBlurEvents] = useState<string[]>([]);
  const [frameBody, setFrameBody] = useState<HTMLElement | null>(null);

  const setFrame = useCallback((element: HTMLIFrameElement | null) => {
    setFrameBody(element?.contentDocument?.body ?? null);
  }, []);

  return (
    <main>
      <h1>Embedded formatting toolbar</h1>

      {/* A same-origin frame owns its own constructors, so a listener inside it
          only recognizes events the frame's own window built. */}
      <iframe title="Editor frame" ref={setFrame} />
      {frameBody
        ? createPortal(
            <EmbeddedToolbar
              setKeyboardEvents={setKeyboardEvents}
              setBlurEvents={setBlurEvents}
            />,
            frameBody,
          )
        : null}

      <h2 id="item-keyboard-events">Item keyboard events</h2>
      <ul aria-labelledby="item-keyboard-events" aria-live="polite">
        {keyboardEvents.map((description, index) => (
          <li key={index}>{description}</li>
        ))}
      </ul>

      <h2 id="item-blur-events">Item blur events</h2>
      <ul aria-labelledby="item-blur-events" aria-live="polite">
        {blurEvents.map((description, index) => (
          <li key={index}>{description}</li>
        ))}
      </ul>
    </main>
  );
}
