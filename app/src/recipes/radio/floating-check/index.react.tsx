import {
  RadioCard,
  RadioCardCheck,
  RadioCardContent,
  RadioCardGrid,
  RadioCardLabel,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";

const themes = [
  {
    value: "system",
    label: "System",
    sidebar: "bg-gray-300",
    content: "bg-linear-to-r from-white from-50% to-gray-900 to-50%",
  },
  {
    value: "light",
    label: "Light",
    sidebar: "bg-gray-300",
    content: "bg-white",
  },
  {
    value: "dark",
    label: "Dark",
    sidebar: "bg-gray-700",
    content: "bg-gray-900",
  },
];

export default function Example() {
  return (
    // The width fits three columns, so the cards fill the row.
    <RadioGroup
      label="Theme"
      defaultValue="system"
      className="w-[24rem] max-w-full"
    >
      {/* The checks hang over the top of each card, so the rows take a larger
          gap when the cards wrap. */}
      <RadioCardGrid $minItemSize="6rem" $gap="lg">
        {themes.map((theme) => (
          <RadioCard
            key={theme.value}
            value={theme.value}
            $orientation="vertical"
            $p={2}
          >
            <RadioCardCheck $floating />
            <RadioCardContent className="gap-2">
              {/* A drawing of the theme. The label names it. */}
              <span
                aria-hidden
                className="ak-edge-10 grid aspect-video grid-cols-[1fr_3fr] overflow-clip rounded-md border"
              >
                <span className={theme.sidebar} />
                <span className={theme.content} />
              </span>
              <RadioCardLabel>{theme.label}</RadioCardLabel>
            </RadioCardContent>
          </RadioCard>
        ))}
      </RadioCardGrid>
    </RadioGroup>
  );
}
