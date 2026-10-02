import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = ["Apple", "Banana", "Orange"];
const blocks = ["Paragraph", "Heading", "List"];

const popupStyle = {
  background: "white",
  border: "1px solid gray",
  padding: 8,
};

const dialogStyle = {
  ...popupStyle,
  position: "fixed",
  top: 24,
  left: 24,
} as const;

// The popups outside OrderDialog keep themselves open and count the close
// requests they get, like a popup that asks the user to confirm before it
// closes.
function useCloseRequests() {
  const [count, setCount] = useState(0);
  const onClose = (event: Event) => {
    event.preventDefault();
    setCount((count) => count + 1);
  };
  return [count, onClose] as const;
}

interface CloseRequestsProps {
  label: string;
  count: number;
}

function CloseRequests({ label, count }: CloseRequestsProps) {
  return <p>{`${label} close requests: ${count}`}</p>;
}

function ActionsMenu() {
  const [count, onClose] = useCloseRequests();
  return (
    <section>
      <CloseRequests label="Actions" count={count} />
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Actions</Ariakit.MenuButton>
        <Ariakit.Menu onClose={onClose} style={popupStyle}>
          <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
          <Ariakit.MenuItem>Share</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
    </section>
  );
}

function ProfileHovercard() {
  const [count, onClose] = useCloseRequests();
  return (
    <section>
      <CloseRequests label="Profile" count={count} />
      <Ariakit.HovercardProvider>
        <Ariakit.HovercardAnchor href="#profile">
          @ariakit
        </Ariakit.HovercardAnchor>
        <Ariakit.Hovercard onClose={onClose} style={popupStyle}>
          <Ariakit.HovercardHeading>Ariakit profile</Ariakit.HovercardHeading>
          <p>Toolkit for building accessible web apps.</p>
        </Ariakit.Hovercard>
      </Ariakit.HovercardProvider>
    </section>
  );
}

function BoldTooltip() {
  const [count, onClose] = useCloseRequests();
  return (
    <section>
      <CloseRequests label="Bold" count={count} />
      <Ariakit.TooltipProvider>
        <Ariakit.TooltipAnchor render={<Ariakit.Button />}>
          Bold
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip onClose={onClose} style={popupStyle}>
          Make the text bold
        </Ariakit.Tooltip>
      </Ariakit.TooltipProvider>
    </section>
  );
}

function FruitComboboxSelect() {
  const [count, onClose] = useCloseRequests();
  return (
    <section>
      <CloseRequests label="Fruit" count={count} />
      <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
        <Ariakit.ComboboxSelectLabel>Fruit</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover onClose={onClose} style={popupStyle}>
          {fruits.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </section>
  );
}

function FruitSelect() {
  const [count, onClose] = useCloseRequests();
  return (
    <section>
      <CloseRequests label="Dessert" count={count} />
      <Ariakit.SelectProvider defaultValue="Apple">
        <Ariakit.SelectLabel>Dessert</Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover onClose={onClose} style={popupStyle}>
          {fruits.map((value) => (
            <Ariakit.SelectItem key={value} value={value} />
          ))}
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </section>
  );
}

function FruitCombobox() {
  const [count, onClose] = useCloseRequests();
  return (
    <section>
      <CloseRequests label="Snack" count={count} />
      <Ariakit.ComboboxProvider>
        <Ariakit.ComboboxLabel>Snack</Ariakit.ComboboxLabel>
        <Ariakit.Combobox />
        <Ariakit.ComboboxPopover onClose={onClose} style={popupStyle}>
          {fruits.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </section>
  );
}

function SearchableFruitComboboxSelect() {
  const [count, onClose] = useCloseRequests();
  return (
    <section>
      <CloseRequests label="Smoothie" count={count} />
      <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
        <Ariakit.ComboboxSelectLabel>Smoothie</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover onClose={onClose} style={popupStyle}>
          <Ariakit.ComboboxInput aria-label="Search fruits" />
          <Ariakit.ComboboxList>
            {fruits.map((value) => (
              <Ariakit.ComboboxItem key={value} value={value} />
            ))}
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </section>
  );
}

function BlockMenuCombobox() {
  const [count, onClose] = useCloseRequests();
  return (
    <section>
      <CloseRequests label="Add block" count={count} />
      <Ariakit.ComboboxProvider>
        <Ariakit.MenuProvider>
          <Ariakit.MenuButton>Add block</Ariakit.MenuButton>
          <Ariakit.Menu onClose={onClose} style={popupStyle}>
            <Ariakit.Combobox autoSelect aria-label="Search blocks" />
            <Ariakit.ComboboxList>
              {blocks.map((value) => (
                <Ariakit.ComboboxItem
                  key={value}
                  value={value}
                  focusOnHover
                  setValueOnClick={false}
                />
              ))}
            </Ariakit.ComboboxList>
          </Ariakit.Menu>
        </Ariakit.MenuProvider>
      </Ariakit.ComboboxProvider>
    </section>
  );
}

// The popovers here close normally, so one Escape must close only the topmost
// popover and keep the dialog open.
function OrderDialog() {
  return (
    <Ariakit.DialogProvider>
      <Ariakit.DialogDisclosure>Open order</Ariakit.DialogDisclosure>
      <Ariakit.Dialog style={dialogStyle}>
        <Ariakit.DialogHeading>Order</Ariakit.DialogHeading>
        <Ariakit.ComboboxProvider>
          <Ariakit.ComboboxLabel>Topping</Ariakit.ComboboxLabel>
          <Ariakit.Combobox />
          <Ariakit.ComboboxPopover style={popupStyle}>
            {fruits.map((value) => (
              <Ariakit.ComboboxItem key={value} value={value} />
            ))}
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
          <Ariakit.ComboboxSelectLabel>Side</Ariakit.ComboboxSelectLabel>
          <Ariakit.ComboboxSelect />
          <Ariakit.ComboboxPopover style={popupStyle}>
            {fruits.map((value) => (
              <Ariakit.ComboboxItem key={value} value={value} />
            ))}
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  );
}

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 24, justifyItems: "start" }}>
      <ActionsMenu />
      <ProfileHovercard />
      <BoldTooltip />
      <FruitComboboxSelect />
      <FruitSelect />
      <FruitCombobox />
      <SearchableFruitComboboxSelect />
      <BlockMenuCombobox />
      <OrderDialog />
    </div>
  );
}
