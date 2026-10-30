import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardContent,
  CheckboxCardGrid,
  CheckboxCardLabel,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import { clsx } from "clsx";
import { Building2, Mountain, Trees, Waves } from "lucide-react";
import { useId } from "react";

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
  const labelId = useId();
  return (
    // The width fits two columns, so the photos make a square.
    <div className="grid w-[22rem] max-w-full gap-2">
      <span id={labelId} className="text-sm font-medium">
        Photos to share
      </span>
      <CheckboxCardGrid aria-labelledby={labelId} $minItemSize="9rem">
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
                className={clsx(
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
    </div>
  );
}
