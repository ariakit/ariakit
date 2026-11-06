import {
  RadioCard,
  RadioCardLabel,
  RadioCardSlot,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";
import {
  CalendarDaysIcon,
  CalendarIcon,
  CalendarRangeIcon,
  SunIcon,
} from "lucide-react";

const ranges = [
  { label: "Day", Icon: SunIcon },
  { label: "Week", Icon: CalendarRangeIcon },
  { label: "Month", Icon: CalendarDaysIcon },
  { label: "Year", Icon: CalendarIcon, disabled: true },
];

export default function Example() {
  return (
    <RadioGroup
      aria-label="Range"
      defaultValue="Day"
      $kind="segmented"
      $size="sm"
      $rounded="full"
    >
      {ranges.map(({ label, Icon, disabled }, index) => (
        <RadioCard
          key={label}
          value={label}
          disabled={disabled}
          separator={!!index}
          $kind="segmented"
          $px="xl"
        >
          <RadioCardSlot>
            <Icon aria-hidden />
          </RadioCardSlot>
          <RadioCardLabel>{label}</RadioCardLabel>
        </RadioCard>
      ))}
    </RadioGroup>
  );
}
