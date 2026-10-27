import {
  RadioCard,
  RadioCardContent,
  RadioCardGrid,
  RadioCardLabel,
} from "@ariakit/ui/components/radio.ariakit.react";
import { Angry, Frown, Laugh, Meh, Smile } from "lucide-react";

const ratings = [
  { value: "terrible", label: "Terrible", icon: Angry },
  { value: "bad", label: "Bad", icon: Frown },
  { value: "okay", label: "Okay", icon: Meh },
  { value: "good", label: "Good", icon: Smile },
  { value: "great", label: "Great", icon: Laugh },
];

export default function Example() {
  return (
    // The width fits five columns, so the cards fill the row.
    <RadioCardGrid
      label="How was the support you got?"
      $minItemSize="3.5rem"
      className="w-[24rem] max-w-full"
    >
      {ratings.map((rating) => (
        <RadioCard
          key={rating.value}
          value={rating.value}
          $orientation="vertical"
          $p={2}
          $px="0.25rem"
        >
          <RadioCardContent className="items-center gap-1 text-center">
            {/* The face is decoration, and the word names the option. */}
            <rating.icon aria-hidden className="size-7" strokeWidth={1.5} />
            <RadioCardLabel className="text-sm">{rating.label}</RadioCardLabel>
          </RadioCardContent>
        </RadioCard>
      ))}
    </RadioCardGrid>
  );
}
