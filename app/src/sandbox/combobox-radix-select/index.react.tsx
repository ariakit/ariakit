import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  ComboboxProvider,
} from "@ariakit/react";
import * as RadixSelect from "@radix-ui/react-select";
import { matchSorter } from "match-sorter";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronUpDownIcon, SearchIcon } from "./icons.react.tsx";
import { languages } from "./languages.ts";

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
        compositeElementInFocusOrder={false}
        setValue={setSearchValue}
      >
        <RadixSelect.Trigger
          aria-label="Language"
          className="inline-flex h-10 items-center justify-center gap-1 rounded bg-white px-4 text-black shadow [color-scheme:light] hover:bg-violet-100 sm:h-9 sm:text-[15px]"
        >
          <RadixSelect.Value placeholder="Select a language" />
          <RadixSelect.Icon className="[translate:4px_0]">
            <ChevronUpDownIcon />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Content
          role="dialog"
          aria-label="Languages"
          position="popper"
          className="z-50 max-h-[min(var(--radix-select-content-available-height),336px)] overflow-hidden rounded-lg bg-white shadow-lg-dark [color-scheme:light]"
          sideOffset={4}
          alignOffset={-16}
        >
          <div className="relative flex items-center p-1 pb-0">
            <div className="pointer-events-none absolute left-2.5 text-black/60">
              <SearchIcon />
            </div>
            <Combobox
              autoSelect
              placeholder="Search languages"
              className="h-10 appearance-none rounded bg-black/5 pr-2 pl-7 text-black outline-none placeholder:text-black/60 sm:h-9 sm:text-[15px]"
              // Radix infers outside focus from captured focus/blur order.
              // Ariakit's virtual blur can arrive after focus and close the
              // Select, and SelectContent has no outside-interaction escape
              // hatch, so disable virtual blur here.
              // https://github.com/ariakit/ariakit/pull/3269
              onBlurCapture={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            />
          </div>
          <ComboboxList className="overflow-y-auto p-1">
            {matches.map(({ label, value }) => (
              <RadixSelect.Item
                key={value}
                value={value}
                asChild
                className="relative flex h-10 cursor-default scroll-my-1 items-center rounded px-7 text-black outline-none data-[active-item]:bg-violet-200 sm:h-9 sm:text-[15px]"
              >
                <ComboboxItem>
                  <RadixSelect.ItemText>{label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute left-1.5">
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
