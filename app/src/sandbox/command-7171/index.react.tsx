import * as Ariakit from "@ariakit/react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

// TODO: Remove once https://github.com/ariakit/ariakit/issues/7171 is fixed.
//
// `Command` builds the click it synthesizes for Enter and Space as a
// `MouseEvent` from the ambient window. Swap that event for the `PointerEvent`
// browsers dispatch, built by the window that owns the element, and copy the
// members `Command` already passed. Replacing the event instead of the
// activation leaves every rule `Command` applies to decide whether to click in
// place, including the disabled, self-target, text-field, `clickOnEnter`, and
// `clickOnSpace` guards.
//
// This belongs on the command element itself. It re-dispatches on
// `currentTarget`, so delegating it to an ancestor would retarget the click to
// that ancestor and the command's own `onClick` would never run.
function replaceSyntheticClick(event: MouseEvent<HTMLElement>) {
  const click = event.nativeEvent;
  // A real click already arrives as a `PointerEvent` from the right window, and
  // a trusted event cannot be re-dispatched as one anyway.
  if (click.isTrusted) return;
  // A non-cancelable click cannot be suppressed, so replacing it would run its
  // default behavior alongside the replacement's.
  if (!click.cancelable) return;
  const element = event.currentTarget;
  const { defaultView } = element.ownerDocument;
  // Resolve the constructor before canceling anything, so a missing
  // `PointerEvent` leaves the click alone rather than destroying it.
  const PointerEventConstructor = defaultView?.PointerEvent;
  if (!PointerEventConstructor) return;
  // Skip the replacement this handler already dispatched. Asking the element's
  // own window survives a `class PointerEvent extends MouseEvent {}` polyfill,
  // which a `pointerId` probe would not.
  if (click instanceof PointerEventConstructor) return;
  const replacement = new PointerEventConstructor("click", {
    altKey: click.altKey,
    bubbles: click.bubbles,
    button: click.button,
    buttons: click.buttons,
    cancelable: click.cancelable,
    clientX: click.clientX,
    clientY: click.clientY,
    ctrlKey: click.ctrlKey,
    detail: click.detail,
    metaKey: click.metaKey,
    // A click no pointer caused reports an unset pointer.
    pointerId: -1,
    pointerType: "",
    shiftKey: click.shiftKey,
  });
  // Built before anything is canceled, so a constructor that throws leaves the
  // original click alone rather than destroying the activation. Canceling it
  // keeps its default behavior, such as following a link, from running twice,
  // and stopping it keeps the original from continuing alongside the
  // replacement.
  event.preventDefault();
  event.stopPropagation();
  element.dispatchEvent(replacement);
}

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
        onClickCapture={replaceSyntheticClick}
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
              onClickCapture={replaceSyntheticClick}
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
