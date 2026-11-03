import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardContent,
  CheckboxCardDescription,
  CheckboxCardLabel,
  CheckboxGroup,
  CheckboxList,
} from "@ariakit/ui/components/checkbox.ariakit.react";

const categories = [
  {
    value: "necessary",
    label: "Strictly necessary",
    description: "Always on. Sign-in and security need these cookies.",
    checked: true,
    disabled: true,
  },
  {
    value: "preferences",
    label: "Preferences",
    description: "Remember your language and region",
  },
  {
    value: "analytics",
    label: "Analytics",
    description: "Count visits so we can make the site better",
    checked: true,
  },
  {
    value: "marketing",
    label: "Marketing",
    description: "Show ads based on your interests",
  },
];

export default function Example() {
  return (
    <CheckboxGroup label="Cookies" className="w-[24rem] max-w-full">
      <CheckboxList>
        {categories.map((category) => (
          <CheckboxCard
            key={category.value}
            name="cookies"
            value={category.value}
            defaultChecked={category.checked}
            disabled={category.disabled}
          >
            <CheckboxCardCheck />
            <CheckboxCardContent>
              <CheckboxCardLabel>{category.label}</CheckboxCardLabel>
              {/* The description of the disabled card tells why it cannot
                  change, so it wraps instead of cutting the reason off. */}
              <CheckboxCardDescription $truncate={false}>
                {category.description}
              </CheckboxCardDescription>
            </CheckboxCardContent>
          </CheckboxCard>
        ))}
      </CheckboxList>
    </CheckboxGroup>
  );
}
