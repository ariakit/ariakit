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
  store?: Ariakit.ComboboxStore;
  toggleOnClick?: boolean;
  unmountOnHide?: boolean;
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
  store,
  toggleOnClick,
  unmountOnHide,
}: FruitSelectProps) {
  return (
    <Ariakit.ComboboxProvider
      store={store}
      defaultSelectedValue={defaultSelectedValue}
      resetValueOnHide
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect
        disabled={disabled}
        fallback={fallback}
        name={name}
        required={required}
        showOnKeyDown={showOnKeyDown}
        toggleOnClick={toggleOnClick}
      />
      <Ariakit.ComboboxPopover modal={modal} unmountOnHide={unmountOnHide}>
        {heading && <Ariakit.PopoverHeading>{heading}</Ariakit.PopoverHeading>}
        <Ariakit.ComboboxInput autoSelect placeholder={`Search ${label}`} />
        <Ariakit.ComboboxList>
          {fruits.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function ProgrammaticFruitSelect() {
  const store = Ariakit.useComboboxStore({ defaultSelectedValue: "Apple" });
  return (
    <>
      <button type="button" onClick={store.show}>
        Show programmatic fruit
      </button>
      <FruitSelect label="Programmatic fruit" store={store} />
    </>
  );
}

function ToggleFruitSelect() {
  const [selectVisible, setSelectVisible] = useState(true);
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
      <Ariakit.ComboboxSelectLabel>Toggle fruit</Ariakit.ComboboxSelectLabel>
      {selectVisible && <Ariakit.ComboboxSelect />}
      <Ariakit.Combobox autoSelect placeholder="Search Toggle fruit" />
      <button type="button" onClick={() => setSelectVisible(!selectVisible)}>
        Toggle select
      </button>
      <Ariakit.ComboboxPopover aria-label="Toggle fruit popover">
        <Ariakit.ComboboxList>
          {fruits.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

interface PlainFruitSelectProps {
  label: string;
  defaultSelectedValue?: string | string[];
  showOnKeyDown?: boolean;
}

// A standard select without a filter input: the ComboboxSelect trigger keeps
// DOM focus and drives the listbox with virtual focus.
function PlainFruitSelect({
  label,
  defaultSelectedValue,
  showOnKeyDown,
}: PlainFruitSelectProps) {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue={defaultSelectedValue}>
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect showOnKeyDown={showOnKeyDown} />
      <Ariakit.ComboboxPopover>
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
      <PlainFruitSelect label="Plain fruit" defaultSelectedValue="Apple" />
      <PlainFruitSelect
        label="Closed fruit"
        defaultSelectedValue="Apple"
        showOnKeyDown={false}
      />

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
      <FruitSelect
        label="Unmount fruit"
        defaultSelectedValue="Banana"
        unmountOnHide
      />
      <ProgrammaticFruitSelect />
      <ToggleFruitSelect />
    </div>
  );
}
