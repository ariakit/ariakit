import * as Ariakit from "@ariakit/react";
import { useComboboxGroup } from "@ariakit/react-components/combobox/combobox-group";
import { useComboboxRow } from "@ariakit/react-components/combobox/combobox-row";

function HookGrid() {
  const store = Ariakit.useComboboxStore();
  const groupProps = useComboboxGroup({ store });
  const rowProps = useComboboxRow({ store });

  return (
    <>
      <Ariakit.ComboboxLabel store={store} className="label">
        Hook direction
      </Ariakit.ComboboxLabel>
      <Ariakit.Combobox store={store} className="combobox" />
      <Ariakit.ComboboxPopover
        store={store}
        role="grid"
        aria-label="Hook directions"
        gutter={4}
        className="popover"
      >
        <Ariakit.Role {...groupProps}>
          <Ariakit.Role {...rowProps}>
            <Ariakit.ComboboxItem
              role="gridcell"
              className="combobox-item"
              value="South West"
            />
            <Ariakit.ComboboxItem
              role="gridcell"
              className="combobox-item"
              value="South East"
            />
          </Ariakit.Role>
        </Ariakit.Role>
      </Ariakit.ComboboxPopover>
    </>
  );
}

function NestedHookGrid() {
  return (
    <Ariakit.ComboboxProvider defaultOpen>
      <Ariakit.Combobox aria-label="Outer command" />
      <Ariakit.ComboboxPopover role="dialog" aria-label="Outer commands">
        <HookGrid />
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      <Ariakit.ComboboxProvider focusWrap={false} focusLoop={false}>
        <Ariakit.ComboboxLabel className="label">
          Direction
        </Ariakit.ComboboxLabel>
        <Ariakit.Combobox
          className="combobox"
          placeholder="e.g., Top, Center"
        />
        <Ariakit.ComboboxPopover role="grid" gutter={4} className="popover">
          <Ariakit.ComboboxRow className="combobox-row">
            <Ariakit.ComboboxItem
              role="gridcell"
              className="combobox-item"
              value="Top Left"
            />
            <Ariakit.ComboboxItem
              role="gridcell"
              className="combobox-item"
              value="Top Center"
            />
            <Ariakit.ComboboxItem
              role="gridcell"
              className="combobox-item"
              value="Top Right"
            />
          </Ariakit.ComboboxRow>
          <Ariakit.ComboboxRow className="combobox-row">
            <Ariakit.ComboboxItem
              role="gridcell"
              className="combobox-item"
              value="Center Left"
            />
            <Ariakit.ComboboxItem
              role="gridcell"
              className="combobox-item"
              value="Center"
            />
            <Ariakit.ComboboxItem
              role="gridcell"
              className="combobox-item"
              value="Center Right"
            />
          </Ariakit.ComboboxRow>
          <Ariakit.ComboboxRow className="combobox-row">
            <Ariakit.ComboboxItem
              role="gridcell"
              className="combobox-item"
              value="Bottom Left"
            />
            <Ariakit.ComboboxItem
              role="gridcell"
              className="combobox-item"
              value="Bottom Center"
            />
            <Ariakit.ComboboxItem
              role="gridcell"
              className="combobox-item"
              value="Bottom Right"
            />
          </Ariakit.ComboboxRow>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>

      <Ariakit.ComboboxProvider>
        <Ariakit.ComboboxLabel className="label">
          Grouped direction
        </Ariakit.ComboboxLabel>
        <Ariakit.Combobox className="combobox" />
        <Ariakit.ComboboxPopover gutter={4} className="popover">
          <div role="status">2 results</div>
          <Ariakit.ComboboxList role="grid" aria-label="Grouped directions">
            <Ariakit.ComboboxGroup>
              <Ariakit.ComboboxRow className="combobox-row">
                <Ariakit.ComboboxItem
                  role="gridcell"
                  className="combobox-item"
                  value="North West"
                />
                <Ariakit.ComboboxItem
                  role="gridcell"
                  className="combobox-item"
                  value="North East"
                />
              </Ariakit.ComboboxRow>
            </Ariakit.ComboboxGroup>
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>

      <NestedHookGrid />
    </>
  );
}
