import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardContent,
  CheckboxCardDescription,
  CheckboxCardLabel,
  CheckboxCardSlot,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import { Bell, CalendarDays, Mail } from "lucide-react";
import { useId } from "react";

const channels = [
  {
    value: "email",
    label: "Email",
    description: "A summary of each day",
    icon: Mail,
    checked: true,
  },
  {
    value: "push",
    label: "Push",
    description: "Alerts on your phone",
    icon: Bell,
  },
  {
    value: "calendar",
    label: "Calendar",
    description: "Events on your schedule",
    icon: CalendarDays,
    checked: true,
  },
];

export default function Example() {
  const labelId = useId();
  return (
    <div className="grid w-[24rem] max-w-full gap-2">
      <span id={labelId} className="text-sm font-medium">
        Channels
      </span>
      <div role="group" aria-labelledby={labelId} className="grid gap-2">
        {channels.map((channel) => (
          <CheckboxCard
            key={channel.value}
            $mark="switch"
            name="channels"
            value={channel.value}
            defaultChecked={channel.checked}
          >
            <CheckboxCardSlot aria-hidden>
              <channel.icon />
            </CheckboxCardSlot>
            <CheckboxCardContent>
              <CheckboxCardLabel>{channel.label}</CheckboxCardLabel>
              <CheckboxCardDescription>
                {channel.description}
              </CheckboxCardDescription>
            </CheckboxCardContent>
            <CheckboxCardCheck />
          </CheckboxCard>
        ))}
      </div>
    </div>
  );
}
