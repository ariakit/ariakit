import * as Ariakit from "@ariakit/react";
import { usePopover } from "@ariakit/react-components/popover/popover";
import { useRef } from "react";

interface InstrumentedPopoverProps {
  label: string;
  modal?: boolean;
}

// Renders a popover through the usePopover hook so the component's own render
// count can be tracked. The preserveTabOrder feature, the only consumer of
// the disclosure element, takes effect only on non-modal portals, so
// disclosure element updates must not re-render a modal popover (portaled,
// but modal dialogs disable preserveTabOrder) or a plain popover (non-modal,
// but not portaled by default). Everything the tests interact with lives
// inside the popovers because the modal one makes the rest of the page inert
// while open.
function InstrumentedPopover({ label, modal }: InstrumentedPopoverProps) {
  const store = Ariakit.usePopoverStore();
  const renderCount = useRef(0);
  renderCount.current += 1;

  const props = usePopover({
    store,
    modal,
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
    </div>
  );
}
