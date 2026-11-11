import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";
import {
  CreditCardIcon,
  HouseIcon,
  PackageIcon,
  TruckIcon,
} from "lucide-react";

const stages = [
  { label: "Confirmed", time: "Mon 9:12", icon: <CreditCardIcon /> },
  { label: "Packed", time: "Mon 16:40", icon: <PackageIcon /> },
  { label: "On its way", time: "Today", icon: <TruckIcon /> },
  { label: "Delivered", time: "Expected Thu", icon: <HouseIcon /> },
];

const currentIndex = 2;

export default function Example() {
  return (
    // The list cannot query its own width, so the wrapper is the container.
    <div className="@container/steps w-[32rem] max-w-full">
      {/* The stages go in a row when the container has room for four columns,
          and in a column when it is narrower. */}
      <List
        $orientation="var(--steps-orientation)"
        $marker="icon"
        $markerSize={10}
        $guide
        $gap={3}
        className="[--steps-orientation:vertical] @md/steps:[--steps-orientation:horizontal]"
      >
        {stages.map((stage, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;
          return (
            // A done stage shows a check on a neutral marker, so the brand
            // marker of the current stage stands out.
            <ListItem
              key={stage.label}
              icon={done ? undefined : stage.icon}
              checked={done || undefined}
              marker={
                current
                  ? { $layer: "brand", $contrast: true }
                  : { $layer: true }
              }
              aria-current={current ? "step" : undefined}
              $disabled={index > currentIndex}
            >
              <p className="font-medium">{stage.label}</p>
              <p className="ak-ink-80 text-sm">{stage.time}</p>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
