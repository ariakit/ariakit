import * as Ariakit from "@ariakit/react";
import type { FormEvent } from "react";
import { useState } from "react";
import { BasicSelectPopover, foods, FruitItems } from "./shared.react.tsx";

export function LegacyPublicSelectCase() {
  return (
    <Ariakit.SelectProvider defaultValue="Apple">
      <Ariakit.SelectLabel>Standard favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select />
      <BasicSelectPopover />
    </Ariakit.SelectProvider>
  );
}

function renderFoodValue(value: string[]) {
  if (!value.length) return "No food selected";
  if (value.length === 1) return value[0];
  return `${value.length} food selected`;
}

export function LegacyPublicSelectMultipleCase() {
  const [value, setValue] = useState(["Apple", "Cake"]);
  return (
    <Ariakit.SelectProvider value={value} setValue={setValue}>
      <Ariakit.SelectLabel>Multiple favorite food</Ariakit.SelectLabel>
      <Ariakit.Select>
        {renderFoodValue(value)}
        <Ariakit.SelectArrow />
      </Ariakit.Select>
      <Ariakit.SelectPopover gutter={4} sameWidth unmountOnHide>
        {foods.map((item) => (
          <Ariakit.SelectItem key={item} value={item}>
            <Ariakit.SelectItemCheck />
            {item}
          </Ariakit.SelectItem>
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}

export function LegacyPublicSelectFormCase() {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    window.alert(data.get("legacy-public-fruit"));
  };
  return (
    <form onSubmit={onSubmit}>
      <Ariakit.SelectProvider defaultValue="Apple">
        <Ariakit.SelectLabel>Form favorite fruit</Ariakit.SelectLabel>
        <Ariakit.Select name="legacy-public-fruit" required />
        <BasicSelectPopover />
      </Ariakit.SelectProvider>
      <button type="submit">Submit legacy select form</button>
    </form>
  );
}

export function LegacyPublicSelectAutofillCase() {
  return (
    <form>
      <label htmlFor="legacy-public-email">Email</label>
      <input id="legacy-public-email" name="email" type="email" />
      <Ariakit.SelectProvider defaultValue="Student">
        <Ariakit.SelectLabel>Legacy role</Ariakit.SelectLabel>
        <Ariakit.Select name="legacy-public-role" />
        <Ariakit.SelectPopover sameWidth>
          <Ariakit.SelectItem value="Student" />
          <Ariakit.SelectItem value="Tutor" />
          <Ariakit.SelectItem value="Parent" />
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </form>
  );
}

export function LegacyPublicSelectFormDisabledCase() {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    window.alert(data.get("legacy-public-disabled-fruit"));
  };
  return (
    <form onSubmit={onSubmit}>
      <Ariakit.SelectProvider defaultValue="Apple">
        <Ariakit.SelectLabel>Disabled favorite fruit</Ariakit.SelectLabel>
        <Ariakit.Select
          name="legacy-public-disabled-fruit"
          disabled
          style={{ pointerEvents: "none" }}
        />
        <BasicSelectPopover />
      </Ariakit.SelectProvider>
      <button type="submit">Submit disabled legacy select</button>
    </form>
  );
}

export function LegacyPublicSelectItemsUnmountCase() {
  const items = [
    { id: "legacy-public-apple", value: "Apple" },
    { id: "legacy-public-banana", value: "Banana" },
    { id: "legacy-public-grape", value: "Grape", disabled: true },
    { id: "legacy-public-orange", value: "Orange" },
  ] satisfies Ariakit.SelectItemProps[];
  return (
    <Ariakit.SelectProvider defaultItems={items} defaultValue="Apple">
      <Ariakit.SelectLabel>Unmounting favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover sameWidth gutter={4} unmountOnHide>
        {items.map((item) => (
          <Ariakit.SelectItem key={item.id} {...item} />
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}

export function LegacyPublicSelectDefaultOpenCase() {
  const [open, setOpen] = useState(true);
  return (
    <Ariakit.SelectProvider open={open} setOpen={setOpen} defaultValue="Apple">
      <Ariakit.SelectLabel>Default-open favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover sameWidth gutter={4} unmountOnHide>
        <FruitItems />
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}

export function LegacyPublicSelectValuelessItemsCase() {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const fruit = Ariakit.useSelectStore({ defaultValue: "Cherry" });
  const color = Ariakit.useSelectStore({ defaultValue: "Green" });
  const shape = Ariakit.useSelectStore({
    defaultValue: "Triangle",
    focusLoop: true,
  });
  return (
    <>
      <div>
        <Ariakit.SelectLabel store={fruit}>
          Valueless favorite fruit
        </Ariakit.SelectLabel>
        <Ariakit.Select store={fruit} />
        <Ariakit.SelectPopover store={fruit}>
          <Ariakit.SelectItem value="Apple" />
          <Ariakit.SelectItem value="Banana" />
          <Ariakit.SelectItem value="Cherry" />
          <Ariakit.SelectItem hideOnClick onClick={() => fruit.setValue("")}>
            Clear selection
          </Ariakit.SelectItem>
          <Ariakit.SelectItem
            hideOnClick
            onClick={() => setShowCustomInput(true)}
          >
            Other fruit…
          </Ariakit.SelectItem>
        </Ariakit.SelectPopover>
        {showCustomInput && <input aria-label="Other fruit" />}
      </div>
      <div>
        <Ariakit.SelectLabel store={color}>
          Valueless favorite color
        </Ariakit.SelectLabel>
        <Ariakit.Select store={color} showOnKeyDown={false} />
        <Ariakit.SelectPopover store={color}>
          <Ariakit.SelectItem value="Red" />
          <Ariakit.SelectItem value="Green" />
          <Ariakit.SelectItem value="Blue" />
          <Ariakit.SelectItem hideOnClick onClick={() => color.setValue("")}>
            Clear selection
          </Ariakit.SelectItem>
        </Ariakit.SelectPopover>
      </div>
      <div>
        <Ariakit.SelectLabel store={shape}>
          Valueless favorite shape
        </Ariakit.SelectLabel>
        <Ariakit.Select store={shape} showOnKeyDown={false} />
        <Ariakit.SelectPopover store={shape}>
          <Ariakit.SelectItem value="Square" />
          <Ariakit.SelectItem value="Circle" />
          <Ariakit.SelectItem value="Triangle" />
          <Ariakit.SelectItem hideOnClick onClick={() => shape.setValue("")}>
            Clear selection
          </Ariakit.SelectItem>
        </Ariakit.SelectPopover>
      </div>
    </>
  );
}
