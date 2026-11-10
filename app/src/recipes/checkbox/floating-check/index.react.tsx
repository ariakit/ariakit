import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardContent,
  CheckboxCardGrid,
  CheckboxCardLabel,
  CheckboxGroup,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import { cx } from "clava";
import { Building2, Mountain, Trees, Waves } from "lucide-react";

const photos = [
  {
    value: "mountains",
    label: "Mountains",
    icon: Mountain,
    className: "from-sky-300 to-indigo-600",
    checked: true,
  },
  {
    value: "forest",
    label: "Forest",
    icon: Trees,
    className: "from-lime-300 to-emerald-700",
  },
  {
    value: "beach",
    label: "Beach",
    icon: Waves,
    className: "from-amber-200 to-cyan-600",
    checked: true,
  },
  {
    value: "city",
    label: "City",
    icon: Building2,
    className: "from-slate-300 to-slate-700",
  },
];

export default function Example() {
  return (
    // The width fits two columns, so the photos make a square.
    <CheckboxGroup label="Photos to share" className="w-[22rem] max-w-full">
      {/* The checks hang over the top of each card, so the rows take a larger
          gap. */}
      <CheckboxCardGrid $minItemSize="9rem" $gap="lg">
        {photos.map((photo) => (
          <CheckboxCard
            key={photo.value}
            name="photos"
            value={photo.value}
            defaultChecked={photo.checked}
            $orientation="vertical"
            $p={2}
          >
            <CheckboxCardCheck $floating />
            <CheckboxCardContent className="gap-2">
              {/* A drawing of the photo. The label names it. */}
              <span
                aria-hidden
                className={cx(
                  "grid aspect-video place-items-center rounded-md bg-linear-to-br text-white",
                  photo.className,
                )}
              >
                <photo.icon className="size-8" strokeWidth={1.5} />
              </span>
              <CheckboxCardLabel>{photo.label}</CheckboxCardLabel>
            </CheckboxCardContent>
          </CheckboxCard>
        ))}
      </CheckboxCardGrid>
    </CheckboxGroup>
  );
}
