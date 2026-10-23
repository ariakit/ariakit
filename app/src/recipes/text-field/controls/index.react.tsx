import {
  ComboboxDescription,
  ComboboxField,
  ComboboxItem,
  ComboboxPopover,
  ComboboxProvider,
  ComboboxSelect,
  ComboboxSelectLabel,
} from "@ariakit/ui/components/combobox.ariakit.react";
import {
  Input,
  InputDescription,
  InputField,
  InputGroup,
  InputLabel,
  InputSlot,
} from "@ariakit/ui/components/input.ariakit.react";
import { useId } from "react";

const countries = ["Argentina", "Brazil", "Canada", "Japan", "Portugal"];

export default function Example() {
  const id = useId();
  return (
    <div className="grid w-[30rem] max-w-full grid-cols-[repeat(auto-fill,minmax(min(100%,13rem),1fr))] gap-x-5 gap-y-6">
      <InputField>
        <InputLabel htmlFor={`${id}-website`}>Website</InputLabel>
        {/* The value continues the prefix text, so neither the group gap nor
            the slot margin separates them. */}
        <InputGroup $gap="none">
          <InputSlot aria-hidden $kind="text" $ink={60} $mx="md">
            https://
          </InputSlot>
          <Input id={`${id}-website`} defaultValue="ada.dev" />
        </InputGroup>
      </InputField>
      <ComboboxProvider defaultSelectedValue="Portugal">
        <ComboboxField>
          <ComboboxSelectLabel>Country</ComboboxSelectLabel>
          <ComboboxSelect aria-describedby={`${id}-country-hint`} />
          <ComboboxDescription id={`${id}-country-hint`}>
            Sets your currency.
          </ComboboxDescription>
        </ComboboxField>
        <ComboboxPopover unmountOnHide>
          {countries.map((country) => (
            <ComboboxItem key={country} value={country} />
          ))}
        </ComboboxPopover>
      </ComboboxProvider>
      <InputField className="col-span-full">
        <InputLabel htmlFor={`${id}-bio`}>Bio</InputLabel>
        <Input
          id={`${id}-bio`}
          render={<textarea rows={3} />}
          maxLength={160}
          defaultValue="Wrote the first published algorithm, for the Analytical Engine."
          aria-describedby={`${id}-bio-hint`}
        />
        <InputDescription id={`${id}-bio-hint`}>
          Up to 160 characters.
        </InputDescription>
      </InputField>
    </div>
  );
}
