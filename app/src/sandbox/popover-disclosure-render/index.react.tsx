import * as Ariakit from "@ariakit/react";
import { usePopover } from "@ariakit/react-components/popover/popover";
import { useRef } from "react";

interface InstrumentedPopoverProps {
  label: string;
  modal?: boolean;
  portal?: boolean;
  preserveTabOrder?: boolean;
}

// Renders a popover through the usePopover hook so the component's own render
// count can be tracked. Disclosure element updates must not re-render the
// popover while its positioning anchor stays the same. The preserveTabOrder
// feature takes effect only on non-modal portals, so it must not introduce a
// separate subscription for a modal popover, a plain non-portaled popover, or
// a portal with preserveTabOrder disabled. Everything the tests interact with
// lives inside the popovers because the modal one makes the rest of the page
// inert while open.
function InstrumentedPopover({
  label,
  modal,
  portal,
  preserveTabOrder,
}: InstrumentedPopoverProps) {
  const store = Ariakit.usePopoverStore();
  const renderCount = useRef(0);
  renderCount.current += 1;

  const props = usePopover({
    store,
    modal,
    portal,
    preserveTabOrder,
    hideOnInteractOutside: false,
  });

  return (
    <div>
      <Ariakit.PopoverDisclosure store={store}>
        Toggle {label} popover
      </Ariakit.PopoverDisclosure>
      <Ariakit.Role {...props}>
        <output aria-label={`${label} popover renders`}>
          {renderCount.current}
        </output>
        <DisclosureElementRenders label={label} store={store} />
        <Ariakit.Button
          onClick={(event) => {
            const target = event.currentTarget;
            // Alternate between two elements so the value changes on every
            // click.
            store.setDisclosureElement(
              store.getState().disclosureElement === target
                ? target.ownerDocument.body
                : target,
            );
          }}
        >
          Set {label} disclosure element
        </Ariakit.Button>
      </Ariakit.Role>
    </div>
  );
}

interface DisclosureElementRendersProps {
  label: string;
  store: Ariakit.PopoverStore;
}

// Subscribes to the disclosure element so its render count proves the store
// update went through even when the popover itself doesn't re-render.
function DisclosureElementRenders({
  label,
  store,
}: DisclosureElementRendersProps) {
  const renderCount = useRef(0);
  Ariakit.useStoreState(store, "disclosureElement");
  renderCount.current += 1;
  return (
    <output aria-label={`${label} disclosure element renders`}>
      {renderCount.current}
    </output>
  );
}

export default function Example() {
  return (
    <div>
      <InstrumentedPopover label="Modal" modal />
      <InstrumentedPopover label="Plain" />
      <InstrumentedPopover
        label="No tab order"
        portal
        preserveTabOrder={false}
      />
    </div>
  );
}
