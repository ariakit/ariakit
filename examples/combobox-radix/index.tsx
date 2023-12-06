import "./style.css";
import { useRef, useState } from "react";
import {
  Combobox,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxProvider,
} from "@ariakit/react";
import * as RadixPopover from "@radix-ui/react-popover";

export default function Example() {
  const comboboxRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  return (
    <RadixPopover.Root open={open} onOpenChange={setOpen}>
      <ComboboxProvider open={open} setOpen={setOpen}>
        <ComboboxLabel className="label">Your favorite fruit</ComboboxLabel>
        <RadixPopover.Anchor asChild>
          <Combobox
            ref={comboboxRef}
            placeholder="e.g., Apple, Banana"
            className="combobox"
          />
        </RadixPopover.Anchor>
        <RadixPopover.Content
          asChild
          sideOffset={8}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            const target = event.target as Element | null;
            const isCombobox = target === comboboxRef.current;
            const inListbox = target && listboxRef.current?.contains(target);
            if (isCombobox || inListbox) {
              event.preventDefault();
            }
          }}
        >
          <ComboboxList ref={listboxRef} role="listbox" className="listbox">
            <ComboboxItem focusOnHover className="option" value="Apple">
              🍎 Apple
            </ComboboxItem>
            <ComboboxItem focusOnHover className="option" value="Grape">
              🍇 Grape
            </ComboboxItem>
            <ComboboxItem focusOnHover className="option" value="Orange">
              🍊 Orange
            </ComboboxItem>
            <ComboboxItem focusOnHover className="option" value="Strawberry">
              🍓 Strawberry
            </ComboboxItem>
            <ComboboxItem focusOnHover className="option" value="Watermelon">
              🍉 Watermelon
            </ComboboxItem>
          </ComboboxList>
        </RadixPopover.Content>
      </ComboboxProvider>
    </RadixPopover.Root>
  );
}
