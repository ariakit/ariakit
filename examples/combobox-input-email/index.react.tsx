import * as Ariakit from "@ariakit/react";
import "./style.css";

interface FixtureProps {
  label: string;
  valuePrefix: string;
  virtualFocus?: boolean;
}

function Fixture({ label, valuePrefix, virtualFocus }: FixtureProps) {
  return (
    <Ariakit.ComboboxProvider virtualFocus={virtualFocus}>
      <Ariakit.ComboboxLabel className="label">{label}</Ariakit.ComboboxLabel>
      <Ariakit.Combobox type="email" className="combobox" />
      <Ariakit.ComboboxPopover gutter={8} sameWidth className="popover">
        <Ariakit.ComboboxItem
          className="combobox-item"
          value={`${valuePrefix}1@ariakit.com`}
        />
        <Ariakit.ComboboxItem
          className="combobox-item"
          value={`${valuePrefix}2@ariakit.com`}
        />
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      <Fixture label="Email" valuePrefix="email" />
      <Fixture
        label="Real focus email"
        valuePrefix="real-focus-email"
        virtualFocus={false}
      />
    </>
  );
}
