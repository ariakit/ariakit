import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  ComboboxProvider,
} from "@ariakit/react";
import * as RadixSelect from "@radix-ui/react-select";
import { matchSorter } from "match-sorter";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckIcon, ChevronUpDownIcon, SearchIcon } from "./icons.tsx";
import { languages } from "./languages.ts";
import "./style.css";

function useRadixSelectOpenState() {
  const [open, setOpen] = useState(false);
  const isWindowResizingRef = useRef(false);

  useEffect(() => {
    let resetTimer = 0;
    const onResize = () => {
      isWindowResizingRef.current = true;
      // Browsers may run microtasks between event listeners, so clear the
      // marker in the next task, after Radix handles this event.
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        isWindowResizingRef.current = false;
      }, 0);
    };
    // Mark the resize before Radix handles it, but let the event reach Floating
    // UI so the popover can reposition.
    window.addEventListener("resize", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize, true);
      window.clearTimeout(resetTimer);
    };
  }, []);

  const onOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen && isWindowResizingRef.current) return;
    setOpen(nextOpen);
  }, []);

  return { open, setOpen, onOpenChange };
}

export default function Example() {
  const { open, setOpen, onOpenChange } = useRadixSelectOpenState();
  const [value, setValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const matches = useMemo(() => {
    if (!searchValue) return languages;
    const keys = ["label", "value"];
    const matches = matchSorter(languages, searchValue, { keys });
    // Radix Select does not work if we don't render the selected item, so we
    // make sure to include it in the list of matches.
    const selectedLanguage = languages.find((lang) => lang.value === value);
    if (selectedLanguage && !matches.includes(selectedLanguage)) {
      matches.push(selectedLanguage);
    }
    return matches;
  }, [searchValue, value]);

  return (
    <RadixSelect.Root
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={onOpenChange}
    >
      <ComboboxProvider
        open={open}
        setOpen={setOpen}
        resetValueOnHide
        includesBaseElement={false}
        setValue={(value) => {
          startTransition(() => {
            setSearchValue(value);
          });
        }}
      >
        <RadixSelect.Trigger aria-label="Language" className="select">
          <RadixSelect.Value placeholder="Select a language" />
          <RadixSelect.Icon className="select-icon">
            <ChevronUpDownIcon />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Content
          role="dialog"
          aria-label="Languages"
          position="popper"
          className="popover"
          sideOffset={4}
          alignOffset={-16}
        >
          <div className="combobox-wrapper">
            <div className="combobox-icon">
              <SearchIcon />
            </div>
            <Combobox
              autoSelect
              placeholder="Search languages"
              className="combobox"
              // Ariakit's Combobox manually triggers a blur event on virtually
              // blurred items, making them work as if they had actual DOM
              // focus. These blur events might happen after the corresponding
              // focus events in the capture phase, leading Radix Select to
              // close the popover. This happens because Radix Select relies on
              // the order of these captured events to discern if the focus was
              // outside the element. Since we don't have access to the
              // onInteractOutside prop in the Radix SelectContent component to
              // stop this behavior, we can turn off Ariakit's behavior here.
              onBlurCapture={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            />
          </div>
          <ComboboxList className="listbox">
            {matches.map(({ label, value }) => (
              <RadixSelect.Item
                key={value}
                value={value}
                asChild
                className="item"
              >
                <ComboboxItem>
                  <RadixSelect.ItemText>{label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="item-indicator">
                    <CheckIcon />
                  </RadixSelect.ItemIndicator>
                </ComboboxItem>
              </RadixSelect.Item>
            ))}
          </ComboboxList>
        </RadixSelect.Content>
      </ComboboxProvider>
    </RadixSelect.Root>
  );
}
