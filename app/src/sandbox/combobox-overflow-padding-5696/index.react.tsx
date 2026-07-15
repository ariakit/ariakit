import * as Ariakit from "@ariakit/react";
import { useLayoutEffect, useState } from "react";
import "./style.css";

const overflowPadding = { top: 24, right: 32, left: 32 };

export default function Example() {
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(
    null,
  );

  useLayoutEffect(() => {
    // Popover exposes positioning styles on the content element's parent.
    const wrapper = contentElement?.parentElement;
    if (!wrapper) return;

    // The CSS variable is a single horizontal value, so use the widest side.
    const value = `${Math.max(overflowPadding.left, overflowPadding.right)}px`;
    const applyValue = () => {
      if (
        wrapper.style.getPropertyValue("--popover-overflow-padding") === value
      ) {
        return;
      }
      wrapper.style.setProperty("--popover-overflow-padding", value);
    };

    // TODO: Remove this workaround when
    // https://github.com/ariakit/ariakit/issues/5696 is fixed.
    applyValue();
    // Ariakit rewrites the variable when positioning restarts, including reopen.
    const OwnerMutationObserver =
      wrapper.ownerDocument.defaultView?.MutationObserver;
    // The initial correction still helps without MutationObserver support.
    if (!OwnerMutationObserver) return;
    const observer = new OwnerMutationObserver(applyValue);
    observer.observe(wrapper, { attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, [contentElement]);

  return (
    <Ariakit.ComboboxProvider defaultOpen>
      <Ariakit.ComboboxLabel>Favorite fruit</Ariakit.ComboboxLabel>
      <Ariakit.Combobox />
      <Ariakit.ComboboxPopover
        ref={setContentElement}
        className="popover"
        // @ts-expect-error #5696: Ariakit currently types this prop as number.
        overflowPadding={overflowPadding}
      >
        <Ariakit.ComboboxItem value="Apple" />
        <Ariakit.ComboboxItem value="Orange" />
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
