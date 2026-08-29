import * as Ariakit from "@ariakit/react";
import { ComboboxListRoleContext } from "@ariakit/react-components/combobox/combobox-context";
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

function SelectHookRoles({
  store,
  testId = "select-hook-roles",
}: {
  store: Ariakit.ComboboxStore;
  testId?: string;
}) {
  const groupProps = useComboboxGroup({ store });
  const rowProps = useComboboxRow({ store });

  return (
    <span
      data-testid={testId}
      data-group-role={groupProps.role}
      data-row-role={rowProps.role}
    />
  );
}

function SelectHookGrid() {
  const store = Ariakit.useComboboxStore();

  return (
    <>
      <Ariakit.ComboboxLabel store={store} className="label">
        Select direction
      </Ariakit.ComboboxLabel>
      <Ariakit.ComboboxSelect store={store} className="combobox">
        Choose direction
        <SelectHookRoles store={store} />
        <ComboboxListRoleContext.Provider value={undefined}>
          <SelectHookRoles store={store} testId="pending-list-hook-roles" />
        </ComboboxListRoleContext.Provider>
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover
        store={store}
        role="grid"
        aria-label="Select hook directions"
        gutter={4}
        className="popover"
      >
        <Ariakit.ComboboxRow className="combobox-row">
          <Ariakit.ComboboxItem
            role="gridcell"
            className="combobox-item"
            value="West"
          />
          <Ariakit.ComboboxItem
            role="gridcell"
            className="combobox-item"
            value="East"
          />
        </Ariakit.ComboboxRow>
      </Ariakit.ComboboxPopover>
    </>
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

      <HookGrid />
      <SelectHookGrid />
    </>
  );
}
