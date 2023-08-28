import "./style.css";
import * as React from "react";
import * as Ariakit from "@ariakit/react";
import { ComboboxProvider } from "@ariakit/react-core/combobox/combobox-provider";
import { matchSorter } from "match-sorter";
import { getList, getValue } from "./list.js";
import {
  getAnchorRect,
  getSearchValue,
  getTrigger,
  getTriggerOffset,
  replaceValue,
} from "./utils.js";

export default function Example() {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = React.useState("");
  const [trigger, setTrigger] = React.useState<string | null>(null);
  const [caretOffset, setCaretOffset] = React.useState<number | null>(null);

  const combobox = Ariakit.useComboboxStore();

  const searchValue = combobox.useState("value");
  const mounted = combobox.useState("mounted");
  const deferredSearchValue = React.useDeferredValue(searchValue);

  const matches = React.useMemo(() => {
    return matchSorter(getList(trigger), deferredSearchValue, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    }).slice(0, 10);
  }, [trigger, deferredSearchValue]);

  const hasMatches = !!matches.length;

  React.useLayoutEffect(() => {
    combobox.setOpen(hasMatches);
  }, [combobox, hasMatches]);

  React.useLayoutEffect(() => {
    if (caretOffset != null) {
      ref.current?.setSelectionRange(caretOffset, caretOffset);
    }
  }, [caretOffset]);

  // Re-calculates the position of the combobox popover in case the changes on
  // the textarea value have shifted the trigger character.
  React.useEffect(combobox.render, [combobox, value]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      combobox.hide();
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const trigger = getTrigger(event.target);
    const searchValue = getSearchValue(event.target);
    // If there's a trigger character, we'll show the combobox popover. This can
    // be true both when the trigger character has just been typed and when
    // content has been deleted (e.g., with backspace) and the character right
    // before the caret is the trigger.
    if (trigger) {
      setTrigger(trigger);
      combobox.show();
    }
    // There will be no trigger and no search value if the trigger character has
    // just been deleted.
    else if (!searchValue) {
      setTrigger(null);
      combobox.hide();
    }
    // Sets our textarea value.
    setValue(event.target.value);
    // Sets the combobox value that will be used to search in the list.
    combobox.setValue(searchValue);
  };

  const onItemClick = (value: string) => () => {
    const textarea = ref.current;
    if (!textarea) return;
    const offset = getTriggerOffset(textarea);
    const displayValue = getValue(value, trigger);
    if (!displayValue) return;
    setTrigger(null);
    setValue(replaceValue(offset, searchValue, displayValue));
    const nextCaretOffset = offset + displayValue.length + 1;
    setCaretOffset(nextCaretOffset);
  };

  return (
    <div className="wrapper">
      <ComboboxProvider store={combobox}>
        <label className="label">
          Comment
          <Ariakit.Combobox
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
            className="combobox"
            render={
              <textarea
                ref={ref}
                rows={5}
                placeholder="Type @, # or :"
                // We need to re-calculate the position of the combobox popover
                // when the textarea contents are scrolled.
                onScroll={combobox.render}
                // Hide the combobox popover whenever the selection changes.
                onPointerDown={combobox.hide}
                onChange={onChange}
                onKeyDown={onKeyDown}
              />
            }
          />
        </label>
        {mounted && (
          <Ariakit.ComboboxPopover
            hidden={!hasMatches}
            fitViewport
            getAnchorRect={() => {
              const textarea = ref.current;
              if (!textarea) return null;
              return getAnchorRect(textarea);
            }}
            className="popover"
          >
            {matches.map((value) => (
              <Ariakit.ComboboxItem
                key={value}
                value={value}
                focusOnHover
                onClick={onItemClick(value)}
                className="combobox-item"
              >
                <span>{value}</span>
              </Ariakit.ComboboxItem>
            ))}
          </Ariakit.ComboboxPopover>
        )}
      </ComboboxProvider>
    </div>
  );
}
