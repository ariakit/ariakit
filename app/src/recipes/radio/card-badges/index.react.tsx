import {
  RadioCard,
  RadioCardCheck,
  RadioCardContent,
  RadioCardDescription,
  RadioCardGrid,
  RadioCardLabel,
  RadioCardSlot,
} from "@ariakit/ui/components/radio.ariakit.react";

const plans = [
  { value: "hobby", label: "Hobby", price: "$0", detail: "For side projects" },
  {
    value: "pro",
    label: "Pro",
    price: "$12",
    detail: "For growing teams",
    popular: true,
  },
  {
    value: "team",
    label: "Team",
    price: "$25",
    detail: "For whole companies",
  },
];

export default function Example() {
  return (
    <RadioCardGrid
      label="Plan"
      defaultValue="pro"
      $minItemSize="11rem"
      className="w-[40rem] max-w-full"
    >
      {plans.map((plan) => (
        <RadioCard
          key={plan.value}
          value={plan.value}
          $orientation="vertical"
          $p={4}
        >
          <RadioCardCheck />
          <RadioCardContent>
            <RadioCardLabel>{plan.label}</RadioCardLabel>
            <RadioCardDescription $truncate={false}>
              {plan.price} per month. {plan.detail}.
            </RadioCardDescription>
          </RadioCardContent>
          {/* A vertical card shows the content below the top row, so the
              badge can come after the label in the source. The radio is then
              named "Pro Popular". */}
          {plan.popular && <RadioCardSlot $kind="badge">Popular</RadioCardSlot>}
        </RadioCard>
      ))}
    </RadioCardGrid>
  );
}
