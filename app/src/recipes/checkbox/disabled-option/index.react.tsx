import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardContent,
  CheckboxCardDescription,
  CheckboxCardLabel,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import { useId } from "react";

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
  const labelId = useId();
  return (
    <div className="grid w-[24rem] max-w-full gap-2">
      <span id={labelId} className="text-sm font-medium">
        Cookies
      </span>
      <div role="group" aria-labelledby={labelId} className="grid gap-2">
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
      </div>
    </div>
  );
}
