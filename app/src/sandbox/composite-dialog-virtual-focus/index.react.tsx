import * as Ariakit from "@ariakit/react";

const folders = ["Inbox", "Archive", "Trash"];

// A dialog whose element is also a virtual focus listbox. Rendering the
// composite through the dialog keeps the dialog's own tabindex="-1", so the
// dialog's initial focus falls through to whatever is tabbable inside it. The
// options are only rendered while the dialog is open, so they mount after the
// listbox element rather than with it. Nothing is selected up front, so
// opening the dialog should leave the list without a highlighted option until
// an arrow key is pressed.
export default function Example() {
  const dialog = Ariakit.useDialogStore();
  const open = Ariakit.useStoreState(dialog, "open");
  const composite = Ariakit.useCompositeStore({
    virtualFocus: true,
    defaultActiveId: null,
  });
  const highlighted = Ariakit.useStoreState(composite, (state) =>
    state.activeId ? composite.item(state.activeId)?.children : null,
  );

  return (
    <div className="flex flex-col items-start gap-3">
      <Ariakit.DialogDisclosure
        store={dialog}
        className="rounded bg-blue-600 px-3 py-1 text-white"
      >
        Move to folder
      </Ariakit.DialogDisclosure>
      <div role="status">Highlighted: {highlighted || "none"}</div>
      <Ariakit.Dialog
        store={dialog}
        modal={false}
        aria-label="Folders"
        render={<Ariakit.Composite store={composite} role="listbox" />}
        className="flex flex-col rounded border border-gray-300 bg-white p-1 shadow-lg"
      >
        {open &&
          folders.map((folder) => (
            <Ariakit.CompositeItem
              key={folder}
              role="option"
              className="rounded px-3 py-1 text-left data-active-item:bg-blue-600 data-active-item:text-white"
            >
              {folder}
            </Ariakit.CompositeItem>
          ))}
      </Ariakit.Dialog>
    </div>
  );
}
