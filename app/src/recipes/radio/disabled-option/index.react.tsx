import {
  RadioCard,
  RadioCardCheck,
  RadioCardContent,
  RadioCardDescription,
  RadioCardLabel,
  RadioCardSlot,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";

interface Method {
  value: string;
  label: string;
  detail: string;
  price: string;
  disabled?: boolean;
}

const methods: Method[] = [
  {
    value: "standard",
    label: "Standard",
    detail: "5 to 7 business days",
    price: "Free",
  },
  {
    value: "express",
    label: "Express",
    detail: "2 business days",
    price: "$12",
  },
  {
    value: "same-day",
    label: "Same day",
    detail: "Not available for 94107",
    price: "$25",
    disabled: true,
  },
];

const arabicMethods: Method[] = [
  {
    value: "standard",
    label: "عادي",
    detail: "من 5 إلى 7 أيام عمل",
    price: "مجاني",
  },
  {
    value: "express",
    label: "سريع",
    detail: "يوما عمل",
    price: "12 $",
  },
  {
    value: "same-day",
    label: "في اليوم نفسه",
    detail: "غير متاح للرمز البريدي 94107",
    price: "25 $",
    disabled: true,
  },
];

interface ShippingMethodsProps {
  label: string;
  methods: Method[];
}

function ShippingMethods({ label, methods }: ShippingMethodsProps) {
  return (
    <RadioGroup label={label} defaultValue="standard" className="grid gap-2">
      {methods.map((method) => (
        <RadioCard
          key={method.value}
          value={method.value}
          disabled={method.disabled}
        >
          <RadioCardCheck />
          <RadioCardContent>
            <RadioCardLabel>{method.label}</RadioCardLabel>
            {/* The description of the disabled card tells why it is not
                available, so it wraps instead of cutting the reason off. */}
            <RadioCardDescription $truncate={false}>
              {method.detail}
            </RadioCardDescription>
          </RadioCardContent>
          <RadioCardSlot $kind="text">{method.price}</RadioCardSlot>
        </RadioCard>
      ))}
    </RadioGroup>
  );
}

export default function Example() {
  return (
    <div className="grid w-[26rem] max-w-full gap-8">
      <ShippingMethods label="Shipping method" methods={methods} />
      {/* In a right-to-left language, the check and the price trade sides. */}
      <div dir="rtl" lang="ar">
        <ShippingMethods label="طريقة الشحن" methods={arabicMethods} />
      </div>
    </div>
  );
}
