import * as Ariakit from "@ariakit/react";
import { useEffect } from "react";

// App-wide shortcuts open each popup without passing through its trigger, so
// focus stays wherever the user left it.
// A button that refuses focus would not do: Safari falls back to the last
// mousedown target for the disclosure element, so the open would carry an
// opener there and not in the other engines.
// The keys are the function keys that Chrome, Firefox, and Safari all leave
// unassigned, so pressing them reaches the page instead of the browser.
function useShortcut(key: string | undefined, show: () => void) {
  useEffect(() => {
    if (!key) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== key) return;
      show();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [key, show]);
}

function SharePopover() {
  const store = Ariakit.usePopoverStore();
  const open = Ariakit.useStoreState(store, "open");
  useShortcut("F2", store.show);

  return (
    <Ariakit.PopoverProvider store={store}>
      {/* TODO: Remove once the trigger derives this on its own.
      https://github.com/ariakit/ariakit/issues/7083 */}
      <Ariakit.PopoverDisclosure aria-expanded={open}>
        Share
      </Ariakit.PopoverDisclosure>
      <Ariakit.Popover>
        <Ariakit.PopoverHeading>Share note</Ariakit.PopoverHeading>
        <Ariakit.PopoverDismiss>Close share</Ariakit.PopoverDismiss>
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  );
}

function SettingsDialog() {
  const store = Ariakit.useDialogStore();
  const open = Ariakit.useStoreState(store, "open");
  useShortcut("F4", store.show);

  return (
    <Ariakit.DialogProvider store={store}>
      {/* TODO: Remove once the trigger derives this on its own.
      https://github.com/ariakit/ariakit/issues/7083 */}
      <Ariakit.DialogDisclosure aria-expanded={open}>
        Settings
      </Ariakit.DialogDisclosure>
      {/* A modal dialog marks everything outside it `aria-hidden`, which would
      take the trigger out of the accessibility tree along with the state it
      announces. */}
      <Ariakit.Dialog modal={false}>
        <Ariakit.DialogHeading>Settings</Ariakit.DialogHeading>
        <Ariakit.DialogDismiss>Close settings</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  );
}

interface MenubarMenuProps {
  label: string;
  items: string[];
  shortcut?: string;
}

// Rendered inside Menubar so the store picks the menubar up from context, which
// is what makes the triggers read each other's announced state on hover.
function MenubarMenu({ label, items, shortcut }: MenubarMenuProps) {
  const store = Ariakit.useMenuStore();
  const open = Ariakit.useStoreState(store, "open");
  useShortcut(shortcut, store.show);

  return (
    <Ariakit.MenuProvider store={store}>
      {/* TODO: Remove once the trigger derives this on its own.
      https://github.com/ariakit/ariakit/issues/7083 */}
      <Ariakit.MenuItem render={<Ariakit.MenuButton />} aria-expanded={open}>
        {label}
      </Ariakit.MenuItem>
      <Ariakit.Menu>
        {items.map((item) => (
          <Ariakit.MenuItem key={item}>{item}</Ariakit.MenuItem>
        ))}
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

// Two triggers for one section, which is the case the issue asks to settle:
// both control the same content, so neither can be the one that gets to
// announce it.
function RevisionHistory() {
  const store = Ariakit.useDisclosureStore();
  const open = Ariakit.useStoreState(store, "open");

  // TODO: Remove the override on both triggers below once they derive this on
  // their own. https://github.com/ariakit/ariakit/issues/7083
  return (
    <Ariakit.DisclosureProvider store={store}>
      <Ariakit.Disclosure aria-expanded={open}>
        Revision history
      </Ariakit.Disclosure>
      <Ariakit.DisclosureContent>
        <p>Edited 3 times.</p>
      </Ariakit.DisclosureContent>
      <Ariakit.Disclosure aria-expanded={open}>
        Toggle revision history
      </Ariakit.Disclosure>
    </Ariakit.DisclosureProvider>
  );
}

function StatusSelect() {
  const store = Ariakit.useSelectStore({ defaultValue: "Draft" });
  const open = Ariakit.useStoreState(store, "open");
  useShortcut("F9", store.show);

  return (
    <Ariakit.SelectProvider store={store}>
      <Ariakit.SelectLabel>Status</Ariakit.SelectLabel>
      {/* TODO: Remove once the trigger derives this on its own.
      https://github.com/ariakit/ariakit/issues/7083 */}
      <Ariakit.Select aria-expanded={open} />
      <Ariakit.SelectPopover>
        <Ariakit.SelectItem value="Draft" />
        <Ariakit.SelectItem value="Published" />
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}

export default function Example() {
  return (
    <div>
      <p>
        Press F2 to share, F4 for settings, F8 for the format menu, and F9 for
        the status picker.
      </p>
      <label>
        Note
        <input type="text" />
      </label>
      <Ariakit.Menubar>
        <MenubarMenu label="Format" shortcut="F8" items={["Bold", "Italic"]} />
        <MenubarMenu label="Insert" items={["Image", "Table"]} />
      </Ariakit.Menubar>
      <SharePopover />
      <SettingsDialog />
      <RevisionHistory />
      <StatusSelect />
    </div>
  );
}
