import * as Ariakit from "@ariakit/react";
import type { KeyboardEvent } from "react";
import { useRef, useState } from "react";

// A note editor where "Formatting" and "Quick format" both open the same popup.
// Typing "*" in a field opens it too and names "Formatting" as the opener, so
// that button is the one announced as expanded while the caret stays put, even
// when the writer last opened the popup from "Quick format".
//
// The other two entry points name nothing, and they cover the two shapes that
// leaves behind: "Suggest formatting" opens a popup that already has disclosure
// buttons of its own, while typing "/" opens the suggestions popup, which has
// none and so falls back to the field the caret is in.
// https://github.com/ariakit/ariakit/issues/7087
export default function Example() {
  const formatting = Ariakit.usePopoverStore();
  const suggestions = Ariakit.usePopoverStore();
  const formattingTriggerRef = useRef<HTMLButtonElement>(null);
  const [treeSnapshotKey, setTreeSnapshotKey] = useState(0);

  // TODO: Remove once https://github.com/ariakit/ariakit/issues/7087 is fixed.
  // Dialog overwrites the opener with the active element in a layout effect
  // right after the open, so put the intended one back in a microtask and bump
  // the tree snapshot key, which is what makes the popup recompute the outside
  // elements it already derived from the overwritten value. Calling this
  // without a trigger re-asserts whatever the store already held, standing in
  // for the library keeping a mounted button over the focused element.
  const showFormatting = (trigger?: HTMLButtonElement | null) => {
    const opener = trigger ?? formatting.getState().disclosureElement;
    formatting.show();
    queueMicrotask(() => {
      // The opener can be gone by now, and writing a detached element back
      // would position the popup against nothing.
      if (opener?.isConnected) {
        formatting.setDisclosureElement(opener);
      }
      setTreeSnapshotKey((key) => key + 1);
    });
  };

  // The markers stay in the text like they would in any markdown editor, so
  // these shortcuts intentionally don't prevent the default insertion.
  const onFieldKeyDown = (event: KeyboardEvent) => {
    if (event.key === "*") {
      showFormatting(formattingTriggerRef.current);
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
      {/* A plain button, so the open itself names no opener. Until the fix
          lands it goes through the workaround above, which re-asserts the
          button the store already held. */}
      <button
        type="button"
        onClick={() => showFormatting()}
        className="rounded border border-gray-300 px-3 py-1"
      >
        Suggest formatting
      </button>

      {/* Both popups leave the caret where it was so the shortcuts don't
          interrupt typing. */}
      <Ariakit.Popover
        store={formatting}
        autoFocusOnShow={false}
        portal
        unstable_treeSnapshotKey={treeSnapshotKey}
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

      <Ariakit.Popover
        store={suggestions}
        autoFocusOnShow={false}
        portal
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
