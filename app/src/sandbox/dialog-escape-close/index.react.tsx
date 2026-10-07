import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

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

// The popups that use this style have a backdrop and stay above it.
const noteStyle = {
  ...popupStyle,
  position: "fixed",
  right: 24,
  bottom: 24,
} as const;

// The controls that use this style stay above the backdrop of a popup, so the
// pointer can reach them while that popup is open.
const raisedStyle = {
  position: "relative",
  zIndex: 1,
} as const;

// The popups that use this function close only on a click on their backdrop.
function isBackdropEvent(event: Event) {
  const target = event.target;
  if (!(target instanceof Element)) return false;
  return target.hasAttribute("data-backdrop");
}

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

// The recipe renders another element when the field has a value, so its element
// changes while the popover is open. The send button appears with the value,
// after the popover opened, so clicking it must not count as an interaction
// outside the popover.
function RecipeDialog() {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  return (
    <section>
      <Ariakit.Button onClick={() => setOpen(true)}>Open recipe</Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        hideOnInteractOutside={false}
        render={comment ? <section /> : <div />}
        style={popupStyle}
      >
        <Ariakit.DialogHeading>Recipe</Ariakit.DialogHeading>
        <p>Serves four.</p>
      </Ariakit.Dialog>
      <Ariakit.PopoverProvider>
        <Ariakit.PopoverDisclosure>Add comment</Ariakit.PopoverDisclosure>
        <Ariakit.Popover style={popupStyle}>
          <Ariakit.PopoverHeading>Comments</Ariakit.PopoverHeading>
          <input
            aria-label="Comment text"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </Ariakit.Popover>
      </Ariakit.PopoverProvider>
      {comment && <Ariakit.Button>Send comment</Ariakit.Button>}
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

// The coupon renders in a portal when the field has a value, so it moves out of
// the counter to a new portal node while both popups are open. The coupon must
// keep its place in the open order, and the listbox must mark the new portal
// node, so one Escape must still close only the listbox.
function CouponDialog() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <section aria-label="Jam counter">
      <Ariakit.Button onClick={() => setOpen(true)}>Open coupon</Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        portal={!!value}
        hideOnInteractOutside={false}
        style={popupStyle}
      >
        <Ariakit.DialogHeading>Coupon</Ariakit.DialogHeading>
        <p>Jams are two for one today.</p>
      </Ariakit.Dialog>
      <Ariakit.ComboboxProvider value={value} setValue={setValue}>
        <Ariakit.ComboboxLabel>Jam</Ariakit.ComboboxLabel>
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

// The voucher renders in a slot of the counter when the field is empty, and in
// the default portal when the field has a value. Its portal stays on, so the
// voucher keeps its place in the open order, but its portal node is new. The
// listbox must mark the new portal node, so one Escape must still close only
// the listbox.
function VoucherDialog() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  return (
    <section aria-label="Syrup counter">
      <Ariakit.Button onClick={() => setOpen(true)}>
        Open voucher
      </Ariakit.Button>
      <div ref={setSlot} />
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        portal
        portalElement={value ? null : slot}
        hideOnInteractOutside={false}
        style={popupStyle}
      >
        <Ariakit.DialogHeading>Voucher</Ariakit.DialogHeading>
        <p>Syrups are free with pancakes.</p>
      </Ariakit.Dialog>
      <Ariakit.ComboboxProvider value={value} setValue={setValue}>
        <Ariakit.ComboboxLabel>Syrup</Ariakit.ComboboxLabel>
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

// The ticket renders in a portal when the field in the settings has a value, so
// it moves out of the counter to a new portal node while both dialogs are open.
// The settings are modal, so they must disable the new portal node too, and one
// Escape must still close only the settings.
function TicketDialog() {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <section aria-label="Honey counter">
      <Ariakit.Button onClick={() => setOpen(true)}>Open ticket</Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        portal={!!value}
        hideOnInteractOutside={false}
        style={popupStyle}
      >
        <Ariakit.DialogHeading>Ticket</Ariakit.DialogHeading>
        <p>Honey is sold by the jar.</p>
      </Ariakit.Dialog>
      <Ariakit.Button onClick={() => setSettingsOpen(true)}>
        Open settings
      </Ariakit.Button>
      <Ariakit.Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        style={dialogStyle}
      >
        <Ariakit.DialogHeading>Settings</Ariakit.DialogHeading>
        <label>
          Honey
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
      </Ariakit.Dialog>
    </section>
  );
}

// The tip renders in a portal while the field is empty, so it moves out of the
// portal to the counter while both popups are open. A popover renders its
// element in a wrapper, and the wrapper in the counter is new. The listbox must
// mark the tip in that wrapper, so one Escape must still close only the
// listbox.
function TipPopover() {
  const [value, setValue] = useState("");
  return (
    <section aria-label="Tea counter">
      <Ariakit.PopoverProvider>
        <Ariakit.PopoverDisclosure>Open tip</Ariakit.PopoverDisclosure>
        <Ariakit.Popover
          portal={!value}
          hideOnInteractOutside={false}
          style={popupStyle}
        >
          <Ariakit.PopoverHeading>Tip</Ariakit.PopoverHeading>
          <p>Teas steep for three minutes.</p>
        </Ariakit.Popover>
      </Ariakit.PopoverProvider>
      <Ariakit.ComboboxProvider value={value} setValue={setValue}>
        <Ariakit.ComboboxLabel>Tea</Ariakit.ComboboxLabel>
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

// The menu renders in a portal while the field is empty, so it moves out of the
// portal to the counter while both popups are open. A menu renders its element
// in a wrapper, like a popover. The listbox must mark the menu in the new
// wrapper, so one Escape must still close only the listbox.
function ExtrasMenu() {
  const [value, setValue] = useState("");
  return (
    <section aria-label="Juice counter">
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Extras</Ariakit.MenuButton>
        <Ariakit.Menu
          portal={!value}
          hideOnInteractOutside={false}
          style={popupStyle}
        >
          <Ariakit.MenuItem>Ice</Ariakit.MenuItem>
          <Ariakit.MenuItem>Mint</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      <Ariakit.ComboboxProvider value={value} setValue={setValue}>
        <Ariakit.ComboboxLabel>Juice</Ariakit.ComboboxLabel>
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

// The receipt renders in a portal while the field in the preferences is empty,
// so it moves out of the portal to the counter while both popups are open. The
// preferences are modal and render in the counter too, so the new wrapper of
// the receipt is next to them. They must disable the receipt in that wrapper,
// and one Escape must still close only the preferences.
function ReceiptPopover() {
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <section aria-label="Cider counter">
      <Ariakit.PopoverProvider>
        <Ariakit.PopoverDisclosure>Open receipt</Ariakit.PopoverDisclosure>
        <Ariakit.Popover
          portal={!value}
          hideOnInteractOutside={false}
          style={popupStyle}
        >
          <Ariakit.PopoverHeading>Receipt</Ariakit.PopoverHeading>
          <p>Cider is sold by the bottle.</p>
        </Ariakit.Popover>
      </Ariakit.PopoverProvider>
      <Ariakit.Button onClick={() => setPreferencesOpen(true)}>
        Open preferences
      </Ariakit.Button>
      <Ariakit.Dialog
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        portal={false}
        style={dialogStyle}
      >
        <Ariakit.DialogHeading>Preferences</Ariakit.DialogHeading>
        <label>
          Cider
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
      </Ariakit.Dialog>
    </section>
  );
}

// The flyer has a backdrop and renders in a portal while the field is empty, so
// it moves out of the portal to the counter while both popups are open. A
// dialog renders its backdrop next to its element, and the backdrop in the
// counter is new. The listbox must mark that backdrop too, so a click on it
// must close both popups.
function FlyerDialog() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <section aria-label="Milk counter">
      <Ariakit.Button onClick={() => setOpen(true)}>Open flyer</Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        portal={!value}
        backdrop={<div />}
        hideOnInteractOutside={isBackdropEvent}
        style={noteStyle}
      >
        <Ariakit.DialogHeading>Flyer</Ariakit.DialogHeading>
        <p>Milk is delivered every morning.</p>
      </Ariakit.Dialog>
      <Ariakit.ComboboxProvider value={value} setValue={setValue}>
        <Ariakit.ComboboxLabel>Milk</Ariakit.ComboboxLabel>
        <Ariakit.Combobox style={raisedStyle} />
        <Ariakit.ComboboxPopover style={popupStyle}>
          {fruits.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </section>
  );
}

// The leaflet is a popover with a backdrop, and it renders in a portal while
// the field is empty, so it moves out of the portal to the counter while both
// popups are open. A popover renders its backdrop next to its wrapper, and the
// backdrop in the counter is new. The listbox must mark that backdrop too, so a
// click on it must close both popups.
function LeafletPopover() {
  const [value, setValue] = useState("");
  return (
    <section aria-label="Butter counter">
      <Ariakit.PopoverProvider>
        <Ariakit.PopoverDisclosure>Open leaflet</Ariakit.PopoverDisclosure>
        <Ariakit.Popover
          portal={!value}
          backdrop={<div />}
          hideOnInteractOutside={isBackdropEvent}
          style={popupStyle}
        >
          <Ariakit.PopoverHeading>Leaflet</Ariakit.PopoverHeading>
          <p>Butter is churned on site.</p>
        </Ariakit.Popover>
      </Ariakit.PopoverProvider>
      <Ariakit.ComboboxProvider value={value} setValue={setValue}>
        <Ariakit.ComboboxLabel>Butter</Ariakit.ComboboxLabel>
        <Ariakit.Combobox style={raisedStyle} />
        <Ariakit.ComboboxPopover style={popupStyle}>
          {fruits.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </section>
  );
}

// The poster has a backdrop and renders in a portal while the field in the
// options is empty, so it moves out of the portal to the counter while both
// popups are open. The options are modal and render in the counter too, so the
// new backdrop of the poster is next to them. They have no backdrop, so the
// pointer can reach the backdrop of the poster. The options must disable that
// backdrop too, so a click on it must not close the poster.
function PosterDialog() {
  const [open, setOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <section aria-label="Cream counter">
      <Ariakit.Button onClick={() => setOpen(true)}>Open poster</Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        portal={!value}
        backdrop={<div />}
        hideOnInteractOutside={isBackdropEvent}
        style={noteStyle}
      >
        <Ariakit.DialogHeading>Poster</Ariakit.DialogHeading>
        <p>Cream is whipped to order.</p>
      </Ariakit.Dialog>
      <Ariakit.Button onClick={() => setOptionsOpen(true)} style={raisedStyle}>
        Open options
      </Ariakit.Button>
      <Ariakit.Dialog
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        portal={false}
        backdrop={false}
        style={dialogStyle}
      >
        <Ariakit.DialogHeading>Options</Ariakit.DialogHeading>
        <label>
          Cream
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
      </Ariakit.Dialog>
    </section>
  );
}

interface ShadowRootProps {
  name: string;
  children: ReactNode;
}

// Renders its children in a shadow root. The container is created when the host
// mounts, so the children render after that.
function ShadowRoot({ name, children }: ShadowRootProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const setHost = useCallback((host: HTMLDivElement | null) => {
    if (!host) {
      setContainer(null);
      return;
    }
    const shadowRoot = host.shadowRoot || host.attachShadow({ mode: "open" });
    const element =
      shadowRoot.querySelector<HTMLElement>("[data-shadow-container]") ||
      host.ownerDocument.createElement("div");
    element.dataset.shadowContainer = "";
    if (!element.isConnected) {
      shadowRoot.append(element);
    }
    setContainer(element);
  }, []);
  return (
    <>
      <div ref={setHost} data-shadow-host={name} />
      {container && createPortal(children, container)}
    </>
  );
}

// The dialog in the shadow root has the same id as the one in the document,
// which is allowed because ids are unique only in their root. The popups in the
// document don't mark it, so one Escape must still close only the listbox, and
// the next one must close only the dialog in the document.
function MemoDialog() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <Ariakit.Button onClick={() => setOpen(true)}>Open memo</Ariakit.Button>
      <Ariakit.Dialog
        id="memo"
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        hideOnInteractOutside={false}
        style={popupStyle}
      >
        <Ariakit.DialogHeading>Memo</Ariakit.DialogHeading>
        <p>Cheese is served after 5pm.</p>
      </Ariakit.Dialog>
      <Ariakit.ComboboxProvider>
        <Ariakit.ComboboxLabel>Cheese</Ariakit.ComboboxLabel>
        <Ariakit.Combobox />
        <Ariakit.ComboboxPopover style={popupStyle}>
          {fruits.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <ShadowRoot name="memo">
        <Ariakit.DialogProvider>
          <Ariakit.DialogDisclosure>Open shadow memo</Ariakit.DialogDisclosure>
          <Ariakit.Dialog
            id="memo"
            modal={false}
            hideOnEscape={false}
            hideOnInteractOutside={false}
            style={popupStyle}
          >
            <Ariakit.DialogHeading>Shadow memo</Ariakit.DialogHeading>
            <p>Escape is disabled in this dialog.</p>
          </Ariakit.Dialog>
        </Ariakit.DialogProvider>
      </ShadowRoot>
    </section>
  );
}

// The popover renders in the document, but its disclosure is in the shadow
// root, so the popover marks the dialog around the disclosure from another
// root. One Escape must close only the popover.
function ShadowOrderDialog() {
  return (
    <section>
      <ShadowRoot name="order">
        <Ariakit.DialogProvider>
          <Ariakit.DialogDisclosure>Open shadow order</Ariakit.DialogDisclosure>
          <Ariakit.Dialog modal={false} style={dialogStyle}>
            <Ariakit.DialogHeading>Shadow order</Ariakit.DialogHeading>
            <Ariakit.PopoverProvider>
              <Ariakit.PopoverDisclosure>Crust</Ariakit.PopoverDisclosure>
              <Ariakit.Popover portal style={popupStyle}>
                <Ariakit.PopoverHeading>Crust</Ariakit.PopoverHeading>
                <p>Thin or thick.</p>
              </Ariakit.Popover>
            </Ariakit.PopoverProvider>
          </Ariakit.Dialog>
        </Ariakit.DialogProvider>
      </ShadowRoot>
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
      <RecipeDialog />
      <BannerDialog />
      <CouponDialog />
      <VoucherDialog />
      <TicketDialog />
      <TipPopover />
      <ExtrasMenu />
      <ReceiptPopover />
      <FlyerDialog />
      <LeafletPopover />
      <PosterDialog />
      <MemoDialog />
      <ShadowOrderDialog />
    </div>
  );
}
