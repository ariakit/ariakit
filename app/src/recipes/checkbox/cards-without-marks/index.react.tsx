import {
  CheckboxCard,
  CheckboxCardContent,
  CheckboxCardGrid,
  CheckboxCardLabel,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import {
  CookingPot,
  PawPrint,
  SquareParking,
  WashingMachine,
  WavesLadder,
  Wifi,
} from "lucide-react";
import { useId } from "react";

const amenities = [
  { value: "wifi", label: "Wi-Fi", icon: Wifi, checked: true },
  { value: "kitchen", label: "Kitchen", icon: CookingPot, checked: true },
  { value: "parking", label: "Parking", icon: SquareParking },
  { value: "pool", label: "Pool", icon: WavesLadder },
  { value: "washer", label: "Washer", icon: WashingMachine },
  { value: "pets", label: "Pets allowed", icon: PawPrint },
];

export default function Example() {
  const labelId = useId();
  return (
    // The width fits three columns, so the tiles make two full rows.
    <div className="grid w-[24rem] max-w-full gap-2">
      <span id={labelId} className="text-sm font-medium">
        Amenities
      </span>
      <CheckboxCardGrid aria-labelledby={labelId} $minItemSize="6rem">
        {amenities.map((amenity) => (
          <CheckboxCard
            key={amenity.value}
            name="amenities"
            value={amenity.value}
            defaultChecked={amenity.checked}
            $orientation="vertical"
            $p={2}
          >
            <CheckboxCardContent className="items-center gap-2 text-center">
              {/* The icon is decoration, and the word names the amenity. */}
              <amenity.icon aria-hidden className="size-7" strokeWidth={1.5} />
              {/* In a narrow grid, a long label wraps instead of losing its
                  end. */}
              <CheckboxCardLabel $truncate={false} className="text-sm">
                {amenity.label}
              </CheckboxCardLabel>
            </CheckboxCardContent>
          </CheckboxCard>
        ))}
      </CheckboxCardGrid>
    </div>
  );
}
