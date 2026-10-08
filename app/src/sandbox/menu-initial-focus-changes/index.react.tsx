import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";

const menuStyle = { background: "white", border: "1px solid gray" };
const itemStyle = { display: "block" };
const disabledItemStyle = { ...itemStyle, opacity: 0.5 };

interface EditMenuProps {
  label: string;
  /**
   * Starts with something to undo.
   */
  history?: boolean;
  /**
   * Keeps Undo in the menu, disabled, while there is nothing to undo. Otherwise
   * Undo is only rendered while there is something to undo.
   */
  keepUndo?: boolean;
  /**
   * Adds a Paste special submenu whose action also creates history. The submenu
   * renders inside the menu element, or in a portal.
   */
  submenu?: "inline" | "portal";
  /**
   * Keeps DOM focus on the menu element while the user moves through the items.
   */
  virtualFocus?: boolean;
  modal?: boolean;
}

/**
 * An Edit menu whose first action depends on the history. Pasting creates
 * history, so Undo becomes the first action while the menu is open. Undo uses
 * up the history, and clearing the history also takes Undo away.
 */
function EditMenu({
  label,
  history = false,
  keepUndo = false,
  submenu,
  virtualFocus,
  modal,
}: EditMenuProps) {
  const [canUndo, setCanUndo] = useState(history);

  return (
    <Ariakit.MenuProvider virtualFocus={virtualFocus}>
      <Ariakit.MenuButton>{label}</Ariakit.MenuButton>
      <Ariakit.Menu modal={modal} style={menuStyle}>
        {(keepUndo || canUndo) && (
          <Ariakit.MenuItem
            disabled={!canUndo}
            hideOnClick={false}
            style={{ ...itemStyle, opacity: canUndo ? 1 : 0.5 }}
            onClick={() => setCanUndo(false)}
          >
            Undo
          </Ariakit.MenuItem>
        )}
        <Ariakit.MenuItem style={itemStyle}>Cut</Ariakit.MenuItem>
        <Ariakit.MenuItem style={itemStyle}>Copy</Ariakit.MenuItem>
        <Ariakit.MenuItem
          hideOnClick={false}
          style={itemStyle}
          onClick={() => setCanUndo(true)}
        >
          Paste
        </Ariakit.MenuItem>
        <Ariakit.MenuItem
          hideOnClick={false}
          style={itemStyle}
          onClick={() => setCanUndo(false)}
        >
          Clear history
        </Ariakit.MenuItem>
        {submenu && (
          <Ariakit.MenuProvider>
            <Ariakit.MenuButton render={<Ariakit.MenuItem style={itemStyle} />}>
              Paste special
            </Ariakit.MenuButton>
            <Ariakit.Menu portal={submenu === "portal"} style={menuStyle}>
              <Ariakit.MenuItem
                hideOnClick={false}
                style={itemStyle}
                onClick={() => setCanUndo(true)}
              >
                Paste as text
              </Ariakit.MenuItem>
            </Ariakit.Menu>
          </Ariakit.MenuProvider>
        )}
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

interface BookmarksMenuProps {
  label: string;
  /**
   * Gives focus to the Close button while the menu has no bookmark to focus.
   */
  focusClose?: boolean;
  /**
   * Renders the menu next to its button and removes it when it closes.
   */
  inline?: boolean;
  modal?: boolean;
}

/**
 * A menu that requests its items when it opens and when the user reloads them,
 * so it is open at times without an item that can take the initial focus. It
 * also has controls that are not items: a Close button, a filter input that
 * changes the items while it has focus, and a Clear button that disables itself
 * when there is nothing to clear.
 */
function BookmarksMenu({
  label,
  focusClose,
  inline,
  modal,
}: BookmarksMenuProps) {
  const menu = Ariakit.useMenuStore();
  const open = Ariakit.useStoreState(menu, "open");
  // The bookmarks are `null` while the request is pending.
  const [bookmarks, setBookmarks] = useState<string[] | null>(null);
  const [filter, setFilter] = useState("");
  const visibleBookmarks = bookmarks?.filter((bookmark) =>
    bookmark.toLowerCase().includes(filter.toLowerCase()),
  );

  useEffect(() => {
    if (!open) return;
    if (bookmarks) return;
    // Long enough for the menu to take its initial focus before the bookmarks
    // arrive.
    const timeout = setTimeout(() => setBookmarks(["Ariakit", "React"]), 1000);
    return () => clearTimeout(timeout);
  }, [open, bookmarks]);

  return (
    <Ariakit.MenuProvider store={menu}>
      <Ariakit.MenuButton>{label}</Ariakit.MenuButton>
      <Ariakit.Menu
        modal={modal}
        portal={inline ? false : undefined}
        unmountOnHide={inline}
        style={menuStyle}
      >
        <Ariakit.MenuDismiss autoFocus={focusClose}>Close</Ariakit.MenuDismiss>
        <input
          aria-label="Filter bookmarks"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
        {!bookmarks && (
          <Ariakit.MenuItem disabled style={disabledItemStyle}>
            Loading
          </Ariakit.MenuItem>
        )}
        {visibleBookmarks?.length === 0 && (
          <Ariakit.MenuItem disabled style={disabledItemStyle}>
            No bookmarks
          </Ariakit.MenuItem>
        )}
        {visibleBookmarks?.map((bookmark) => (
          <Ariakit.MenuItem key={bookmark} style={itemStyle}>
            {bookmark}
          </Ariakit.MenuItem>
        ))}
        {!!visibleBookmarks?.length && (
          <Ariakit.MenuItem
            hideOnClick={false}
            style={itemStyle}
            onClick={() => setBookmarks(null)}
          >
            Reload
          </Ariakit.MenuItem>
        )}
        <Ariakit.Button
          disabled={!bookmarks?.length}
          onClick={() => setBookmarks([])}
        >
          Clear
        </Ariakit.Button>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

/**
 * A modal menu with a second trigger that shows it through the store, as a
 * keyboard shortcut or a context menu would. That trigger does not turn auto
 * focus on, so the menu element takes focus, not an item.
 */
function RowActionsMenu() {
  const menu = Ariakit.useMenuStore();

  return (
    <Ariakit.MenuProvider store={menu}>
      <Ariakit.MenuButton>Row actions</Ariakit.MenuButton>
      <Ariakit.Button onClick={menu.show}>Open row actions</Ariakit.Button>
      <Ariakit.Menu modal style={menuStyle}>
        <Ariakit.MenuItem style={itemStyle}>Rename</Ariakit.MenuItem>
        <Ariakit.MenuItem style={itemStyle}>Duplicate</Ariakit.MenuItem>
        <Ariakit.MenuItem style={itemStyle}>Delete</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

export default function Example() {
  return (
    <main style={{ display: "flex", gap: 8 }}>
      <EditMenu label="Edit" />
      <EditMenu label="Edit with disabled Undo" keepUndo />
      <EditMenu label="Edit with submenu" submenu="inline" />
      <EditMenu label="Edit with portal submenu" submenu="portal" />
      <EditMenu label="Edit with virtual focus" virtualFocus />
      <EditMenu
        label="Edit with virtual focus and disabled Undo"
        virtualFocus
        keepUndo
      />
      <EditMenu label="Modal edit" modal />
      <EditMenu label="Modal edit with history" modal history />
      <EditMenu label="Modal edit with disabled Undo" modal keepUndo />
      <BookmarksMenu label="Bookmarks" />
      <BookmarksMenu label="Modal bookmarks" modal focusClose />
      <BookmarksMenu label="Inline modal bookmarks" modal inline focusClose />
      <RowActionsMenu />
    </main>
  );
}
