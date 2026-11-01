import {
  RadioCard,
  RadioCardLabel,
  RadioCardSlot,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

const themes = [
  { label: "System", Icon: MonitorIcon },
  { label: "Light", Icon: SunIcon },
  { label: "Dark", Icon: MoonIcon },
];

export default function Example() {
  return (
    // The stretched group fills this column, and its segments share the width.
    <div className="w-[22rem] max-w-full">
      <RadioGroup
        aria-label="Theme"
        defaultValue="System"
        $kind="segmented"
        $size="sm"
        $layout="stretch"
      >
        {themes.map(({ label, Icon }) => (
          <RadioCard key={label} value={label} $kind="segmented">
            <RadioCardSlot>
              <Icon aria-hidden />
            </RadioCardSlot>
            <RadioCardLabel>{label}</RadioCardLabel>
          </RadioCard>
        ))}
      </RadioGroup>
    </div>
  );
}
