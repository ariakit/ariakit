import {
  CheckboxDescription,
  CheckboxField,
  CheckboxGroup,
  CheckboxLabel,
  CheckboxList,
} from "@ariakit/ui/components/checkbox.ariakit.react";

const settings = [
  {
    value: "usage",
    label: "Share usage data",
    description: "Anonymous crash reports and usage statistics",
    checked: true,
  },
  {
    value: "search",
    label: "Show my profile in search",
    description: "People outside your team can find you by name",
  },
  {
    value: "messages",
    label: "Allow direct messages",
    description: "Anyone in your workspace can message you",
    checked: true,
  },
];

export default function Example() {
  return (
    <CheckboxGroup label="Privacy">
      <CheckboxList>
        {settings.map((setting) => (
          <CheckboxField
            key={setting.value}
            name="privacy"
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
