import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const menuStyle = { background: "white", border: "1px solid gray" };
const itemStyle = { display: "block" };

interface EditMenuProps {
  label: string;
  /**
   * Keeps Undo in the menu, disabled, while there is nothing to undo. Otherwise
   * Undo is only rendered while there is something to undo.
   */
  keepUndo?: boolean;
}

/**
 * An Edit menu whose first action depends on the history. Pasting creates
 * history, so Undo becomes the first action while the menu is open, and
 * clearing the history takes it away again.
 */
function EditMenu({ label, keepUndo = false }: EditMenuProps) {
  const menu = Ariakit.useMenuStore();
  const [canUndo, setCanUndo] = useState(false);

  return (
    <Ariakit.MenuProvider store={menu}>
      <Ariakit.MenuButton>{label}</Ariakit.MenuButton>
      <Ariakit.Menu
        style={menuStyle}
        // TODO: Remove this prop when
        // https://github.com/ariakit/ariakit/issues/7766 is fixed.
        autoFocusOnShow={() => {
          const { contentElement, activeId } = menu.getState();
          if (!contentElement) return true;
          const { activeElement } = contentElement.ownerDocument;
          // The menu element has DOM focus while the pointer makes an item
          // active, and also before the menu has an item that can take focus.
          if (activeElement === contentElement) {
            return activeId == null;
          }
          return !contentElement.contains(activeElement);
        }}
      >
        {(keepUndo || canUndo) && (
          <Ariakit.MenuItem
            disabled={!canUndo}
            style={{ ...itemStyle, opacity: canUndo ? 1 : 0.5 }}
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
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

export default function Example() {
  return (
    <main style={{ display: "flex", gap: 8 }}>
      <EditMenu label="Edit" />
      <EditMenu label="Edit with disabled Undo" keepUndo />
    </main>
  );
}
