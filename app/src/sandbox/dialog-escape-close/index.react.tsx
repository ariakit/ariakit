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

// The popups that use this hook keep themselves open and count the close
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

// Neither popup here is a React ancestor of the other one, and the listbox
// stays in the DOM while it's hidden. One Escape must close only the popup that
// opened last.
function NoticeDialog() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <Ariakit.Button onClick={() => setOpen(true)}>Open notice</Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        hideOnInteractOutside={false}
        style={popupStyle}
      >
        <Ariakit.DialogHeading>Notice</Ariakit.DialogHeading>
        <p>Drinks are served after 5pm.</p>
      </Ariakit.Dialog>
      <Ariakit.ComboboxProvider>
        <Ariakit.ComboboxLabel>Drink</Ariakit.ComboboxLabel>
        <Ariakit.Combobox />
        <Ariakit.ComboboxPopover style={popupStyle}>
          {fruits.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </section>
  );
}

// The tooltip and the listbox can open in either order, and both stay in the
// DOM while they're hidden. One Escape must close only the popup that opened
// last.
function GarnishTooltipCombobox() {
  return (
    <section>
      <Ariakit.TooltipProvider>
        <Ariakit.ComboboxProvider>
          <Ariakit.ComboboxLabel>Garnish</Ariakit.ComboboxLabel>
          <Ariakit.TooltipAnchor render={<Ariakit.Combobox />} />
          <Ariakit.Tooltip style={popupStyle}>Search garnishes</Ariakit.Tooltip>
          <Ariakit.ComboboxPopover style={popupStyle}>
            {fruits.map((value) => (
              <Ariakit.ComboboxItem key={value} value={value} />
            ))}
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
      </Ariakit.TooltipProvider>
    </section>
  );
}

// The dialog mounts when it opens, and the popover inside it is open from the
// start. Both open in the same render, where the effects of the popover run
// first. One Escape must still close only the popover.
function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <Ariakit.Button onClick={() => setOpen(true)}>
        Open welcome
      </Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        unmountOnHide
        style={popupStyle}
      >
        <Ariakit.DialogHeading>Welcome</Ariakit.DialogHeading>
        <Ariakit.PopoverProvider defaultOpen>
          <Ariakit.PopoverDisclosure>Tips</Ariakit.PopoverDisclosure>
          <Ariakit.Popover autoFocusOnShow={false} style={popupStyle}>
            <Ariakit.PopoverHeading>Tips</Ariakit.PopoverHeading>
            <p>Press Escape to close this popup.</p>
          </Ariakit.Popover>
        </Ariakit.PopoverProvider>
      </Ariakit.Dialog>
    </section>
  );
}

// The listbox renders another element when no item matches the value, so its
// element changes while it's open. One Escape must still close only the
// listbox.
function ReminderDialog() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const matches = fruits.filter((fruit) =>
    fruit.toLowerCase().includes(value.toLowerCase()),
  );
  return (
    <section>
      <Ariakit.Button onClick={() => setOpen(true)}>
        Open reminder
      </Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        hideOnInteractOutside={false}
        style={popupStyle}
      >
        <Ariakit.DialogHeading>Reminder</Ariakit.DialogHeading>
        <p>Sauces are made to order.</p>
      </Ariakit.Dialog>
      <Ariakit.ComboboxProvider value={value} setValue={setValue}>
        <Ariakit.ComboboxLabel>Sauce</Ariakit.ComboboxLabel>
        <Ariakit.Combobox />
        <Ariakit.ComboboxPopover
          render={matches.length ? <div /> : <section />}
          style={popupStyle}
        >
          {matches.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
          {!matches.length && <div>No results</div>}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </section>
  );
}

// The offer renders another element when the field has a value, so its element
// changes while both popups are open. The listbox opened last, so one Escape
// must still close only the listbox.
function OfferDialog() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <section>
      <Ariakit.Button onClick={() => setOpen(true)}>Open offer</Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        // TODO: Remove this workaround after the fix lands.
        // https://github.com/ariakit/ariakit/issues/7728
        portal
        hideOnInteractOutside={false}
        render={value ? <section /> : <div />}
        style={popupStyle}
      >
        <Ariakit.DialogHeading>Offer</Ariakit.DialogHeading>
        <p>Spreads are half price today.</p>
      </Ariakit.Dialog>
      <Ariakit.ComboboxProvider value={value} setValue={setValue}>
        <Ariakit.ComboboxLabel>Spread</Ariakit.ComboboxLabel>
        <Ariakit.Combobox />
        <Ariakit.ComboboxPopover style={popupStyle}>
          {fruits.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </section>
  );
}

// The banner moves to another region and gets another id when the field has a
// value, so its portal node and its id change while both popups are open. The
// banner must keep its place in the open order, so one Escape must still close
// only the listbox.
function BannerDialog() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [emptyRegion, setEmptyRegion] = useState<HTMLElement | null>(null);
  const [filledRegion, setFilledRegion] = useState<HTMLElement | null>(null);
  return (
    <section>
      <Ariakit.Button onClick={() => setOpen(true)}>Open banner</Ariakit.Button>
      <div ref={setEmptyRegion} />
      <div ref={setFilledRegion} />
      <Ariakit.Dialog
        id={value ? "banner-filled" : "banner-empty"}
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        portal
        portalElement={value ? filledRegion : emptyRegion}
        hideOnInteractOutside={false}
        style={popupStyle}
      >
        <Ariakit.DialogHeading>Banner</Ariakit.DialogHeading>
        <p>Dips are free today.</p>
      </Ariakit.Dialog>
      <Ariakit.ComboboxProvider value={value} setValue={setValue}>
        <Ariakit.ComboboxLabel>Dip</Ariakit.ComboboxLabel>
        <Ariakit.Combobox />
        <Ariakit.ComboboxPopover style={popupStyle}>
          {fruits.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </section>
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
      <NoticeDialog />
      <GarnishTooltipCombobox />
      <WelcomeDialog />
      <ReminderDialog />
      <OfferDialog />
      <BannerDialog />
    </div>
  );
}
