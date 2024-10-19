import * as Ariakit from "@ariakit/react";
import { ComboboxItem } from "@ariakit/react-core/combobox/combobox-item-offscreen";
import { CompositeItem } from "@ariakit/react-core/composite/composite-item-offscreen";
import { CompositeRenderer } from "@ariakit/react-core/composite/composite-renderer";
import { useRef, useState } from "react";
import "./style.css";

export default function Example() {
  const [offscreen, setOffscreen] = useState(false);
  const [renderer, setRenderer] = useState(false);
  const Component = offscreen ? ComboboxItem : Ariakit.ComboboxItem;
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <button onClick={() => setOffscreen(!offscreen)}>
          Turn {offscreen ? "off" : "on"} offscreen
        </button>
        <button onClick={() => setRenderer(!renderer)}>
          Turn {renderer ? "off" : "on"} renderer
        </button>
      </div>
      <Ariakit.ComboboxProvider focusLoop={false}>
        <Ariakit.ComboboxLabel className="label">
          Your favorite fruit
        </Ariakit.ComboboxLabel>
        <Ariakit.Combobox placeholder="e.g., Apple" className="combobox" />
        <Ariakit.ComboboxPopover
          gutter={4}
          sameWidth
          unmountOnHide
          className="popover"
        >
          {renderer && (
            <CompositeRenderer items={1000} itemSize={40}>
              {(item) => (
                <Ariakit.ComboboxItem
                  key={item.index}
                  className="combobox-item"
                  value={`Item ${item.id}`}
                  {...item}
                />
              )}
            </CompositeRenderer>
          )}
          {!renderer &&
            Array.from({ length: 1000 }).map((_, index) => (
              <Component
                offscreenBehavior={offscreen ? "lazy" : undefined}
                key={index}
                className="combobox-item"
                value={`Item ${index}`}
              />
            ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <Ariakit.CompositeProvider>
        <Ariakit.Composite
          ref={ref}
          role="listbox"
          className="w-[400px] max-h-80 overflow-auto flex flex-col p-2"
        >
          {Array.from({ length: 1000 }).map((_, index) => (
            <CompositeItem
              key={index}
              role="option"
              offscreenBehavior={index === 0 ? "active" : "passive"}
              offscreenRoot={ref}
              className="combobox-item"
              render={(props) => {
                if ("data-offscreen" in props) {
                  return <div {...props} />;
                }
                return <Ariakit.CompositeTypeahead {...props} />;
              }}
            >
              {String.fromCharCode(65 + (index % 26))} item {index}
            </CompositeItem>
          ))}
        </Ariakit.Composite>
      </Ariakit.CompositeProvider>
    </div>
  );
}
