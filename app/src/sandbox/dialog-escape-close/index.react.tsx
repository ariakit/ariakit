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

// The update is in the page, hidden, when the hints popover opens. It renders
// another element when the compact option is on, so its element changes while
// both popups are open. The update opened last, so clicking inside it must
// still count as an interaction outside the hints popover.
function UpdateDialog() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  return (
    <section>
      {/*
       * The update is above the disclosure, so the popover doesn't cover it.
       */}
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        // The focus stays in the hints popover, which must have had focus.
        autoFocusOnShow={false}
        hideOnInteractOutside={false}
        render={compact ? <section /> : <div />}
        style={popupStyle}
      >
        <Ariakit.DialogHeading>Update</Ariakit.DialogHeading>
        <p>Update body</p>
      </Ariakit.Dialog>
      <Ariakit.PopoverProvider>
        <Ariakit.PopoverDisclosure>Open hints</Ariakit.PopoverDisclosure>
        <Ariakit.Popover style={popupStyle}>
          <Ariakit.PopoverHeading>Hints</Ariakit.PopoverHeading>
          <Ariakit.Button onClick={() => setOpen(true)}>
            Open update
          </Ariakit.Button>
          <label>
            <input
              type="checkbox"
              checked={compact}
              onChange={(event) => setCompact(event.target.checked)}
            />
            Compact
          </label>
        </Ariakit.Popover>
      </Ariakit.PopoverProvider>
    </section>
  );
}

// Both dialogs render another element each time the swap button is clicked, so
// their elements change in the same render, and again in the next one. The
// greek popover opened before them, so it must keep marking the new element of
// each dialog after every swap.
function GreekDialogs() {
  const [open, setOpen] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const render = swapped ? <section /> : <div />;
  return (
    <section>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        autoFocusOnShow={false}
        hideOnInteractOutside={false}
        render={render}
        style={popupStyle}
      >
        <Ariakit.DialogHeading>Alpha</Ariakit.DialogHeading>
        <p>Alpha body</p>
      </Ariakit.Dialog>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        autoFocusOnShow={false}
        hideOnInteractOutside={false}
        render={render}
        style={popupStyle}
      >
        <Ariakit.DialogHeading>Beta</Ariakit.DialogHeading>
        <p>Beta body</p>
      </Ariakit.Dialog>
      <Ariakit.PopoverProvider>
        <Ariakit.PopoverDisclosure>Open greek</Ariakit.PopoverDisclosure>
        <Ariakit.Popover style={popupStyle}>
          <Ariakit.PopoverHeading>Greek</Ariakit.PopoverHeading>
          <Ariakit.Button onClick={() => setOpen(true)}>
            Show dialogs
          </Ariakit.Button>
          <Ariakit.Button onClick={() => setSwapped((value) => !value)}>
            Swap dialogs
          </Ariakit.Button>
        </Ariakit.Popover>
      </Ariakit.PopoverProvider>
    </section>
  );
}

// The late dialog mounts after the notes popover opened, so the popover doesn't
// mark it, and it stays unmarked when its element changes. Clicking inside it
// must not count as an interaction outside the notes popover.
function LateDialog() {
  const [mounted, setMounted] = useState(false);
  const [swapped, setSwapped] = useState(false);
  return (
    <section>
      {mounted && (
        <Ariakit.Dialog
          open
          modal={false}
          autoFocusOnShow={false}
          hideOnInteractOutside={false}
          render={swapped ? <section /> : <div />}
          style={popupStyle}
        >
          <Ariakit.DialogHeading>Late</Ariakit.DialogHeading>
          <p>Late body</p>
        </Ariakit.Dialog>
      )}
      <Ariakit.PopoverProvider>
        <Ariakit.PopoverDisclosure>Open notes</Ariakit.PopoverDisclosure>
        <Ariakit.Popover style={popupStyle}>
          <Ariakit.PopoverHeading>Notes</Ariakit.PopoverHeading>
          <Ariakit.Button onClick={() => setMounted(true)}>
            Mount late
          </Ariakit.Button>
          <Ariakit.Button onClick={() => setSwapped((value) => !value)}>
            Swap late
          </Ariakit.Button>
        </Ariakit.Popover>
      </Ariakit.PopoverProvider>
    </section>
  );
}

// The bulletin renders in a portal node until the portal option is off, so its
// element moves out of the portal node while both popups are open. The pins
// popover opened after the bulletin, so it marked the bulletin through the
// portal node, and clicking inside the bulletin must still count as an
// interaction outside the pins popover.
function PortalDialog() {
  const [open, setOpen] = useState(false);
  const [portal, setPortal] = useState(true);
  return (
    <section>
      <Ariakit.Button onClick={() => setOpen(true)}>
        Open bulletin
      </Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        portal={portal}
        autoFocusOnShow={false}
        hideOnInteractOutside={false}
        style={popupStyle}
      >
        <Ariakit.DialogHeading>Bulletin</Ariakit.DialogHeading>
        <p>Bulletin body</p>
      </Ariakit.Dialog>
      <Ariakit.PopoverProvider>
        <Ariakit.PopoverDisclosure>Open pins</Ariakit.PopoverDisclosure>
        <Ariakit.Popover style={popupStyle}>
          <Ariakit.PopoverHeading>Pins</Ariakit.PopoverHeading>
          <label>
            <input
              type="checkbox"
              checked={portal}
              onChange={(event) => setPortal(event.target.checked)}
            />
            Portal
          </label>
        </Ariakit.Popover>
      </Ariakit.PopoverProvider>
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
      <UpdateDialog />
      <GreekDialogs />
      <LateDialog />
      <PortalDialog />
      <BannerDialog />
      <MemoDialog />
      <ShadowOrderDialog />
    </div>
  );
}
