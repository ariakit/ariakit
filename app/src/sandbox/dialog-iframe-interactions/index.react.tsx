import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

function useFrameBody() {
  const [body, setBody] = useState<HTMLElement | null>(null);
  const ref = useCallback((element: HTMLIFrameElement | null) => {
    setBody(element?.contentDocument?.body ?? null);
  }, []);
  return [body, ref] as const;
}

function EmbeddedCombobox() {
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.ComboboxLabel>Favorite food</Ariakit.ComboboxLabel>
      <Ariakit.Combobox id="shared-active" />
      <Ariakit.ComboboxPopover aria-label="Suggestions">
        <Ariakit.ComboboxItem value="Apple" />
        <Ariakit.ComboboxItem value="Banana" />
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function CrossDocumentPopover({
  portalElement,
}: {
  portalElement: HTMLElement;
}) {
  return (
    <Ariakit.PopoverProvider>
      <Ariakit.PopoverDisclosure>
        Toggle iframe popover
      </Ariakit.PopoverDisclosure>
      <Ariakit.Popover
        aria-label="Iframe popover"
        portal
        portalElement={portalElement}
      >
        Iframe popover content
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  );
}

function RootPopover() {
  const [containedFrameBody, setContainedFrame] = useFrameBody();

  return (
    <Ariakit.PopoverProvider>
      <Ariakit.PopoverDisclosure>Open root popover</Ariakit.PopoverDisclosure>
      <Ariakit.Popover
        aria-label="Root popover"
        unmountOnHide={false}
        hideOnInteractOutside={(event) => event.type === "click"}
      >
        Root popover content
        {containedFrameBody
          ? createPortal(
              <button type="button">Contained frame target</button>,
              containedFrameBody,
            )
          : null}
        <iframe ref={setContainedFrame} title="Contained frame" tabIndex={-1} />
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  );
}

export default function Example() {
  const [embeddedFrameBody, setEmbeddedFrame] = useFrameBody();
  const [outsideFrameBody, setOutsideFrame] = useFrameBody();

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {embeddedFrameBody
        ? createPortal(<EmbeddedCombobox />, embeddedFrameBody)
        : null}
      {embeddedFrameBody ? (
        <CrossDocumentPopover portalElement={embeddedFrameBody} />
      ) : null}
      {outsideFrameBody
        ? createPortal(
            <>
              <input
                aria-activedescendant="shared-active"
                aria-controls="outside-options"
                aria-expanded="true"
                aria-label="Outside active descendant target"
                role="combobox"
              />
              <div id="outside-options" role="listbox">
                <div id="shared-active" role="option">
                  Outside option
                </div>
              </div>
              <input aria-label="Outside frame target" />
            </>,
            outsideFrameBody,
          )
        : null}
      <iframe
        ref={setEmbeddedFrame}
        title="Embedded combobox"
        style={{ border: "1px solid", height: 160, width: 320 }}
      />
      <input aria-label="Parent target" />
      <iframe ref={setOutsideFrame} title="Outside frame" tabIndex={-1} />
      <iframe src="/icon.svg" title="Outside SVG frame" tabIndex={-1} />
      <RootPopover />
    </div>
  );
}
