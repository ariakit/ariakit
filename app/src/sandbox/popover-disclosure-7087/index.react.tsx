import * as Ariakit from "@ariakit/react";
import type { KeyboardEvent } from "react";
import { useRef } from "react";

// A note editor where "Formatting" and "Quick format" both open the same popup.
// Typing "*" in a field opens it too and names "Formatting" as the opener, so
// that button is the one announced as expanded while the caret stays put, even
// when the writer last opened the popup from "Quick format".
//
// The other three entry points name nothing, and they cover the three shapes
// that leaves behind: "Suggest formatting" opens a popup that already has
// disclosure buttons of its own, typing "/" opens the suggestions popup, which
// has none and so falls back to the field the caret is in, and "Summarize note"
// drops focus first, so there is nothing to fall back to either.
// https://github.com/ariakit/ariakit/issues/7087
export default function Example() {
  const formatting = Ariakit.usePopoverStore();
  const suggestions = Ariakit.usePopoverStore();
  const formattingTriggerRef = useRef<HTMLButtonElement>(null);

  // The markers stay in the text like they would in any markdown editor, so
  // these shortcuts intentionally don't prevent the default insertion.
  const onFieldKeyDown = (event: KeyboardEvent) => {
    if (event.key === "*") {
      const trigger = formattingTriggerRef.current;
      if (!trigger) return;
      formatting.setDisclosureElement(trigger);
      formatting.show();
    }
    if (event.key === "/") {
      suggestions.show();
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      {/* Both fields sit above both buttons, so a popup anchored to a button
          never covers them. A popup anchored to a field does cover the field
          below it, so each test only clicks a field at or above the popup that
          is currently open. */}
      <input
        aria-label="Title"
        placeholder="Title"
        onKeyDown={onFieldKeyDown}
        className="w-72 rounded border border-gray-300 px-3 py-1"
      />
      <textarea
        aria-label="Note"
        placeholder={'Type "*" to format, "/" for suggestions'}
        onKeyDown={onFieldKeyDown}
        className="w-72 rounded border border-gray-300 px-3 py-1"
      />

      <Ariakit.PopoverDisclosure
        store={formatting}
        ref={formattingTriggerRef}
        className="rounded border border-gray-300 px-3 py-1 aria-expanded:bg-blue-600 aria-expanded:text-white"
      >
        Formatting
      </Ariakit.PopoverDisclosure>
      <Ariakit.PopoverDisclosure
        store={formatting}
        className="rounded border border-gray-300 px-3 py-1 aria-expanded:bg-blue-600 aria-expanded:text-white"
      >
        Quick format
      </Ariakit.PopoverDisclosure>
      {/* A plain button, so showing the popup from here names no opener at
          all. */}
      <button
        type="button"
        onClick={() => formatting.show()}
        className="rounded border border-gray-300 px-3 py-1"
      >
        Suggest formatting
      </button>
      {/* Drops focus before opening, standing in for the shortcuts and timers
          that open a popup while nothing is focused. There is no opener to fall
          back to then, so the popup must not treat the field it fell back to
          last time as one either. */}
      <button
        type="button"
        tabIndex={0}
        onClick={(event) => {
          event.currentTarget.blur();
          suggestions.show();
        }}
        className="rounded border border-gray-300 px-3 py-1"
      >
        Summarize note
      </button>

      {/* Both popups leave the caret where it was so the shortcuts don't
          interrupt typing. */}
      <Ariakit.Popover
        store={formatting}
        autoFocusOnShow={false}
        portal
        unmountOnHide
        className="flex flex-col items-start gap-2 rounded-lg border border-gray-300 bg-white p-4 shadow-lg"
      >
        <Ariakit.PopoverHeading className="font-medium">
          Formatting
        </Ariakit.PopoverHeading>
        <Ariakit.Button className="rounded border border-gray-300 px-3 py-1">
          Bold
        </Ariakit.Button>
        <Ariakit.PopoverDismiss className="rounded border border-gray-300 px-3 py-1">
          Done
        </Ariakit.PopoverDismiss>
      </Ariakit.Popover>

      {/* unmountOnHide so the popup is rebuilt on every open, which is when a
          fix that remembers the previous opener on the popup itself would lose
          track of it. */}
      <Ariakit.Popover
        store={suggestions}
        autoFocusOnShow={false}
        portal
        unmountOnHide
        className="flex flex-col items-start gap-2 rounded-lg border border-gray-300 bg-white p-4 shadow-lg"
      >
        <Ariakit.PopoverHeading className="font-medium">
          Suggestions
        </Ariakit.PopoverHeading>
        <Ariakit.Button className="rounded border border-gray-300 px-3 py-1">
          Add a summary
        </Ariakit.Button>
      </Ariakit.Popover>
    </div>
  );
}
