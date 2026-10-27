import {
  RadioDescription,
  RadioField,
  RadioGroup,
  RadioLabel,
} from "@ariakit/ui/components/radio.ariakit.react";

const options = [
  {
    value: "invited",
    label: "Only people invited",
    description: "Others ask for access",
  },
  {
    value: "team",
    label: "Anyone at Acme",
    description: "People signed in with an Acme account",
  },
  {
    value: "public",
    label: "Anyone with the link",
    description: "No sign-in needed",
  },
];

export default function Example() {
  return (
    <RadioGroup
      label="Who can open this link?"
      defaultValue="team"
      className="grid gap-3"
    >
      {options.map((option) => (
        <RadioField key={option.value} value={option.value}>
          <RadioLabel>{option.label}</RadioLabel>
          <RadioDescription>{option.description}</RadioDescription>
        </RadioField>
      ))}
    </RadioGroup>
  );
}
