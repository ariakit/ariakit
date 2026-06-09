import * as Ariakit from "@ariakit/react";
import type { ReactNode } from "react";
import { useState } from "react";

const fruits = ["Apple", "Banana", "Orange"];

interface FruitSelectProps {
  label: string;
  defaultSelectedValue?: string | string[];
  disabled?: boolean;
  fallback?: ReactNode;
  heading?: ReactNode;
  modal?: boolean;
  name?: string;
  required?: boolean;
  showOnKeyDown?: boolean;
  toggleOnClick?: boolean;
}

function FruitSelect({
  label,
  defaultSelectedValue,
  disabled,
  fallback,
  heading,
  modal,
  name,
  required,
  showOnKeyDown,
  toggleOnClick,
}: FruitSelectProps) {
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue={defaultSelectedValue}
      resetValueOnHide
    >
      <Ariakit.ComboboxLabel>{label}</Ariakit.ComboboxLabel>
      <Ariakit.ComboboxSelect
        disabled={disabled}
        fallback={fallback}
        name={name}
        required={required}
        showOnKeyDown={showOnKeyDown}
        toggleOnClick={toggleOnClick}
      />
      <Ariakit.ComboboxPopover modal={modal}>
        {heading && <Ariakit.PopoverHeading>{heading}</Ariakit.PopoverHeading>}
        <Ariakit.Combobox autoSelect placeholder={`Search ${label}`} />
        <Ariakit.ComboboxList>
          {fruits.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  const [favorite, setFavorite] = useState("None");
  const [requiredSubmitted, setRequiredSubmitted] = useState(false);

  return (
    <div>
      <button type="button">Outside action</button>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const value = data.get("fruit");
          setFavorite(typeof value === "string" ? value : "");
        }}
      >
        <FruitSelect
          label="Favorite fruit"
          name="fruit"
          defaultSelectedValue="Apple"
          required
        />
        <button type="submit">Submit favorite</button>
        <output>Favorite submitted: {favorite}</output>
      </form>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setRequiredSubmitted(true);
        }}
      >
        <FruitSelect
          label="Required fruit"
          name="requiredFruit"
          fallback="Choose fruit"
          required
        />
        <button type="submit">Submit required</button>
        <output>Required submitted: {requiredSubmitted ? "yes" : "no"}</output>
      </form>

      <FruitSelect
        label="Multiple fruit"
        name="multipleFruit"
        defaultSelectedValue={["Apple", "Banana"]}
      />
      <FruitSelect label="Empty fruit" fallback="Choose fruit" />
      <FruitSelect
        label="Keyboard fruit"
        defaultSelectedValue="Apple"
        showOnKeyDown={false}
      />
      <FruitSelect
        label="Click fruit"
        defaultSelectedValue="Apple"
        toggleOnClick={false}
      />
      <FruitSelect
        label="Disabled fruit"
        name="disabledFruit"
        defaultSelectedValue="Apple"
        disabled
      />
      <FruitSelect label="Modal fruit" defaultSelectedValue="Apple" modal />
      <FruitSelect
        label="Heading fruit"
        defaultSelectedValue="Apple"
        heading="Available fruits"
      />
    </div>
  );
}
