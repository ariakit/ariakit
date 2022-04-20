import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import getCaretCoordinates from "textarea-caret";
import { defaultTriggers, getList, getValue } from "./list";
import "./style.css";

const useSafeLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Example() {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");
  const [trigger, setTrigger] = useState<string | null>(null);
  const [caretOffset, setCaretOffset] = useState<number | null>(null);

  const combobox = useComboboxState({
    limit: 10,
    fitViewport: true,
    getAnchorRect: () => {
      const textarea = ref.current;
      if (!textarea) return null;
      return getAnchorRect(textarea);
    },
  });

  const hasMatches = !!combobox.matches.length;

  useSafeLayoutEffect(() => {
    combobox.setVisible(hasMatches);
  }, [combobox.setVisible, hasMatches]);

  useSafeLayoutEffect(() => {
    combobox.setList(getList(trigger));
  }, [combobox.setList, trigger]);

  useSafeLayoutEffect(() => {
    if (caretOffset != null) {
      ref.current?.setSelectionRange(caretOffset, caretOffset);
    }
  }, [caretOffset]);

  // Re-calculates the position of the combobox popover in case the changes on
  // the textarea value have shifted the trigger character.
  useEffect(combobox.render, [value, combobox.render]);

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      combobox.hide();
    }
  };

  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setValue(value);
    const trigger = getTrigger(event.target);
    const searchValue = getSearchValue(event.target);
    // If there's a trigger character, we'll show the combobox popover.
    // This can be true both when the trigger character has just been
    // typed and when content has been deleted (e.g., with backspace)
    // and the character right before the caret is the trigger.
    if (trigger) {
      setTrigger(trigger);
      combobox.show();
    }
    // There will be no trigger and no search value if the trigger
    // character has just been deleted.
    else if (!searchValue) {
      setTrigger(null);
      combobox.hide();
    }
    // Sets our textarea value.
    setValue(value);
    // Sets the combobox value that will be used to search in the list.
    combobox.setValue(searchValue);
  };

  const onItemClick = (value: string) => () => {
    const textarea = ref.current;
    if (!textarea) return;
    const offset = getTriggerOffset(textarea);
    const searchValue = combobox.value;
    const displayValue = getValue(value, trigger);
    if (!displayValue) return;
    setTrigger(null);
    setValue(replaceValue(offset, searchValue, displayValue));
    const nextCaretOffset = offset + displayValue.length + 1;
    setCaretOffset(nextCaretOffset);
  };

  return (
    <div>
      <label className="label">
        Comment
        <Combobox
          ref={ref}
          as="textarea"
          state={combobox}
          rows={5}
          autoSelect
          value={value}
          // We'll overwrite how the combobox popover is shown, so we disable
          // the default behaviors.
          showOnChange={false}
          showOnKeyDown={false}
          showOnMouseDown={false}
          // To the combobox state, we'll only set the value after the trigger
          // character (the search value), so we disable the default behavior.
          setValueOnChange={false}
          // We need to re-calculate the position of the combobox popover when
          // the textarea contents are scrolled.
          onScroll={combobox.render}
          // Hide the combobox popover whenever the selection changes.
          onPointerDown={combobox.hide}
          onKeyDown={onKeyDown}
          onChange={onChange}
          className="combobox"
        />
      </label>
      {combobox.mounted && (
        <ComboboxPopover
          state={combobox}
          hidden={!hasMatches}
          className="popover"
        >
          {combobox.matches.map((value, i) => (
            <ComboboxItem
              key={value + i}
              value={value}
              onClick={onItemClick(value)}
              className="combobox-item"
            >
              <span>{value}</span>
            </ComboboxItem>
          ))}
        </ComboboxPopover>
      )}
    </div>
  );
}

function getTriggerOffset(
  element: HTMLTextAreaElement,
  triggers = defaultTriggers
) {
  const { value, selectionStart } = element;
  for (let i = selectionStart; i >= 0; i--) {
    const char = value[i];
    if (char && triggers.includes(char)) {
      return i;
    }
  }
  return -1;
}

function getTrigger(element: HTMLTextAreaElement, triggers = defaultTriggers) {
  const { value, selectionStart } = element;
  const previousChar = value[selectionStart - 1];
  if (!previousChar) return null;
  const secondPreviousChar = value[selectionStart - 2];
  const isIsolated = !secondPreviousChar || /\s/.test(secondPreviousChar);
  if (!isIsolated) return null;
  if (triggers.includes(previousChar)) return previousChar;
  return null;
}

function getSearchValue(
  element: HTMLTextAreaElement,
  triggers = defaultTriggers
) {
  const offset = getTriggerOffset(element, triggers);
  if (offset === -1) return "";
  return element.value.slice(offset + 1, element.selectionStart);
}

function getAnchorRect(
  element: HTMLTextAreaElement,
  triggers = defaultTriggers
) {
  const offset = getTriggerOffset(element, triggers);
  const { left, top, height } = getCaretCoordinates(element, offset + 1);
  const { x, y } = element.getBoundingClientRect();
  return {
    x: left + x - element.scrollLeft,
    y: top + y - element.scrollTop,
    height,
  };
}

function replaceValue(
  offset: number,
  searchValue: string,
  displayValue: string
) {
  return (prevValue: string) => {
    const nextValue =
      prevValue.slice(0, offset) +
      displayValue +
      " " +
      prevValue.slice(offset + searchValue.length + 1);
    return nextValue;
  };
}
