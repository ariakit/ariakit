import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import { FruitItems } from "./shared.tsx";

function AnimatedPopover() {
  return (
    <Ariakit.SelectPopover
      portal
      sameWidth
      unmountOnHide
      gutter={4}
      style={{
        opacity: 1,
        transition: "opacity 100ms, scale 100ms, translate 100ms",
      }}
    >
      <FruitItems />
    </Ariakit.SelectPopover>
  );
}

export function LegacyPublicSelectAnimatedCase() {
  return (
    <Ariakit.SelectProvider defaultValue="Apple">
      <Ariakit.SelectLabel>Animated favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select />
      <AnimatedPopover />
    </Ariakit.SelectProvider>
  );
}

export function LegacyPublicSelectAnimatedStoreCase() {
  const select = Ariakit.useSelectStore({ defaultValue: "Apple" });
  const mounted = Ariakit.useStoreState(select, "mounted");
  return (
    <>
      <Ariakit.SelectLabel store={select}>
        Animated store favorite fruit
      </Ariakit.SelectLabel>
      <Ariakit.Select store={select} />
      {mounted && (
        <Ariakit.SelectPopover
          store={select}
          portal
          sameWidth
          gutter={4}
          style={{
            opacity: 1,
            transition: "opacity 100ms, scale 100ms, translate 100ms",
          }}
        >
          <FruitItems />
        </Ariakit.SelectPopover>
      )}
    </>
  );
}

const positions = [
  ["Top Left", "Top Center", "Top Right"],
  ["Center Left", "Center", "Center Right"],
  ["Bottom Left", "Bottom Center", "Bottom Right"],
] as const;

interface PositionItemsProps {
  select: Ariakit.SelectStore;
}

function PositionItems({ select }: PositionItemsProps) {
  return (
    <>
      {positions.map((row) => (
        <Ariakit.SelectRow key={row[0]}>
          {row.map((value) => (
            <Ariakit.SelectItem
              key={value}
              role="gridcell"
              value={value}
              focusOnHover={(event) => {
                if (event.type === "mouseleave") return false;
                select.move(event.currentTarget.id);
                return true;
              }}
            >
              {value}
            </Ariakit.SelectItem>
          ))}
        </Ariakit.SelectRow>
      ))}
    </>
  );
}

interface PositionSelectProps {
  label: string;
  select: Ariakit.SelectStore;
}

function PositionSelect({ label, select }: PositionSelectProps) {
  const value = Ariakit.useStoreState(select, "value");
  return (
    <>
      <Ariakit.SelectLabel store={select}>{label}</Ariakit.SelectLabel>
      <Ariakit.Select store={select} showOnKeyDown={false}>
        {value}
        <Ariakit.SelectArrow />
      </Ariakit.Select>
      <Ariakit.SelectPopover store={select} role="grid">
        <PositionItems select={select} />
      </Ariakit.SelectPopover>
    </>
  );
}

export function LegacyPublicSelectGridCase() {
  const [value, setValue] = useState("Center");
  const select = Ariakit.useSelectStore({
    value,
    setValue,
    placement: "bottom",
    setValueOnMove: true,
  });
  return (
    <Ariakit.SelectProvider store={select}>
      <PositionSelect label="Controlled grid position" select={select} />
    </Ariakit.SelectProvider>
  );
}

export function LegacyPublicSelectGridStoreCase() {
  const select = Ariakit.useSelectStore({
    defaultValue: "Center",
    placement: "bottom",
    setValueOnMove: true,
  });
  return <PositionSelect label="Store grid position" select={select} />;
}

export function LegacyPublicSelectGroupCase() {
  return (
    <Ariakit.SelectProvider defaultValue="Apple">
      <Ariakit.SelectLabel>Grouped favorite food</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover gutter={4} sameWidth>
        <Ariakit.SelectGroup>
          <Ariakit.SelectGroupLabel>
            Fruits &amp; Vegetables
          </Ariakit.SelectGroupLabel>
          <Ariakit.SelectItem value="Apple" />
          <Ariakit.SelectItem value="Banana" />
        </Ariakit.SelectGroup>
        <Ariakit.SelectGroup>
          <Ariakit.SelectGroupLabel>Dairy</Ariakit.SelectGroupLabel>
          <Ariakit.SelectItem value="Milk" />
          <Ariakit.SelectItem value="Cheese" />
        </Ariakit.SelectGroup>
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}

const accounts = [
  ["harry.poe@example.com", "Harry Poe"],
  ["jane.doe@example.com", "Jane Doe"],
  ["john.doe@example.com", "John Doe"],
  ["sonia.poe@example.com", "Sonia Poe"],
] as const;

function Account({ email, name }: { email: string; name: string }) {
  return (
    <>
      <span>{name}</span>
      <small>{email}</small>
    </>
  );
}

export function LegacyPublicSelectItemCustomCase() {
  const [value, setValue] = useState("john.doe@example.com");
  const selected = accounts.find(([email]) => email === value) ?? accounts[0];
  return (
    <Ariakit.SelectProvider setValueOnMove value={value} setValue={setValue}>
      <Ariakit.SelectLabel>Legacy account</Ariakit.SelectLabel>
      <Ariakit.Select>
        <Account email={selected[0]} name={selected[1]} />
      </Ariakit.Select>
      <Ariakit.SelectPopover gutter={4} sameWidth>
        {accounts.map(([email, name]) => (
          <Ariakit.SelectItem key={email} value={email}>
            <Account email={email} name={name} />
          </Ariakit.SelectItem>
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}

export function LegacyPublicSelectListboxCase() {
  const select = Ariakit.useSelectStore({ open: true });
  return (
    <Ariakit.SelectList store={select}>
      <Ariakit.SelectItem
        focusOnHover={false}
        hideOnClick={false}
        value="Apple"
      />
      <Ariakit.SelectItem
        focusOnHover={false}
        hideOnClick={false}
        value="Banana"
      />
      <Ariakit.SelectItem
        focusOnHover={false}
        hideOnClick={false}
        value="Grape"
        disabled
      />
      <Ariakit.SelectItem
        focusOnHover={false}
        hideOnClick={false}
        value="Orange"
      />
    </Ariakit.SelectList>
  );
}
