import * as Ariakit from "@ariakit/react";
import { comboboxItem } from "@ariakit/ui/styles/combobox";
import { layer } from "@ariakit/ui/styles/layer";
import Thumbnail from "#app/examples/combobox-group/thumbnail.react.tsx";

export default function Example() {
  return (
    <div className="grid gap-6">
      <section aria-label="Static thumbnail">
        <Thumbnail />
      </section>
      <Ariakit.ComboboxProvider
        defaultOpen
        defaultActiveId="highlighted-member"
      >
        <Ariakit.ComboboxList
          aria-label="Reference members"
          // Match the lifted canvas used by the thumbnail's popover.
          {...layer.jsx({
            $layer: "canvas",
            $lighten: true,
            className: "w-66",
          })}
        >
          <Ariakit.ComboboxItem id="highlighted-member" {...comboboxItem.jsx()}>
            Reference highlight
          </Ariakit.ComboboxItem>
          <Ariakit.ComboboxItem {...comboboxItem.jsx()}>
            Reference rest
          </Ariakit.ComboboxItem>
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxProvider>
    </div>
  );
}
