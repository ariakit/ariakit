import {
  CheckboxDescription,
  CheckboxField,
  CheckboxGroup,
  CheckboxLabel,
  CheckboxList,
} from "@ariakit/ui/components/checkbox.ariakit.react";

const settings = [
  {
    value: "wifi",
    label: "Wi-Fi",
    description: "Connect to known networks automatically",
    checked: true,
  },
  {
    value: "bluetooth",
    label: "Bluetooth",
    description: "Let nearby devices find this one",
  },
  {
    value: "location",
    label: "Location",
    description: "Share your position with apps you allow",
    checked: true,
  },
];

export default function Example() {
  return (
    <CheckboxGroup label="Connections">
      <CheckboxList>
        {settings.map((setting) => (
          <CheckboxField
            key={setting.value}
            $mark="switch"
            name="connections"
            value={setting.value}
            defaultChecked={setting.checked}
          >
            <CheckboxLabel>{setting.label}</CheckboxLabel>
            <CheckboxDescription>{setting.description}</CheckboxDescription>
          </CheckboxField>
        ))}
      </CheckboxList>
    </CheckboxGroup>
  );
}
