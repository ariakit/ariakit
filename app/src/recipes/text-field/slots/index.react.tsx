import {
  ComboboxItem,
  ComboboxPopover,
  ComboboxProvider,
  ComboboxSelect,
} from "@ariakit/ui/components/combobox.ariakit.react";
import {
  Input,
  InputDescription,
  InputField,
  InputGroup,
  InputLabel,
  InputSlot,
} from "@ariakit/ui/components/input.ariakit.react";
import { CircleCheck, Mail, Search } from "lucide-react";
import { useId, useState } from "react";

const currencies = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "JPY", symbol: "¥" },
];

function getInitials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

interface AmountFieldProps {
  label: string;
  currencyLabel: string;
  hint: string;
}

function AmountField({ label, currencyLabel, hint }: AmountFieldProps) {
  const id = useId();
  const [currency, setCurrency] = useState("USD");
  return (
    <InputField>
      <InputLabel htmlFor={`${id}-amount`}>{label}</InputLabel>
      <ComboboxProvider
        selectedValue={currency}
        setSelectedValue={(value) => {
          // The store also types multiple selection, which this select does not
          // use.
          if (typeof value !== "string") return;
          setCurrency(value);
        }}
      >
        {/* The group fits the amount as it changes. The symbol follows the
            currency that the select shows. A click on the symbol focuses the
            amount, and the select keeps its own focus. */}
        <InputGroup $fitContent>
          <InputSlot aria-hidden $kind="text" $ink={60}>
            {currencies.find(({ code }) => code === currency)?.symbol}
          </InputSlot>
          <Input
            id={`${id}-amount`}
            inputMode="decimal"
            defaultValue="250.00"
            placeholder="0.00"
            aria-describedby={`${id}-amount-hint`}
            className="tabular-nums"
          />
          <InputSlot $size="2xl" $square={false}>
            <ComboboxSelect
              aria-label={currencyLabel}
              $size="sm"
              $layer="transparent"
            />
          </InputSlot>
        </InputGroup>
        <ComboboxPopover unmountOnHide>
          {currencies.map(({ code }) => (
            <ComboboxItem key={code} value={code} />
          ))}
        </ComboboxPopover>
      </ComboboxProvider>
      <InputDescription id={`${id}-amount-hint`}>{hint}</InputDescription>
    </InputField>
  );
}

export default function Example() {
  const id = useId();
  const [name, setName] = useState("Ada Lovelace");
  return (
    <div className="grid w-[30rem] max-w-full grid-cols-[repeat(auto-fill,minmax(min(100%,13rem),1fr))] gap-x-5 gap-y-6">
      <AmountField
        label="Amount"
        currencyLabel="Currency"
        hint="Up to 10,000 per transfer."
      />
      <InputField>
        <InputLabel htmlFor={`${id}-email`}>Email</InputLabel>
        <InputGroup>
          <InputSlot aria-hidden $ink={60}>
            <Mail />
          </InputSlot>
          <Input
            id={`${id}-email`}
            type="email"
            placeholder="you@example.com"
          />
        </InputGroup>
      </InputField>
      <InputField>
        <InputLabel htmlFor={`${id}-name`}>Display name</InputLabel>
        {/* The avatar shows the initials of the name as you type it. */}
        <InputGroup>
          <InputSlot aria-hidden $kind="avatar" $layer="brand">
            {getInitials(name)}
          </InputSlot>
          <Input
            id={`${id}-name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </InputGroup>
      </InputField>
      <InputField>
        <InputLabel htmlFor={`${id}-domain`}>Domain</InputLabel>
        {/* The hint tells the status in words, so the icon is hidden. */}
        <InputGroup>
          <Input
            id={`${id}-domain`}
            defaultValue="ada.dev"
            aria-describedby={`${id}-domain-hint`}
          />
          <InputSlot aria-hidden>
            <CircleCheck className="ak-text ak-text-success" />
          </InputSlot>
        </InputGroup>
        <InputDescription id={`${id}-domain-hint`}>Verified.</InputDescription>
      </InputField>
      {/* In a right-to-left language, the slots trade sides: the symbol and
          the search icon move to the right, and the currency select to the
          left. */}
      <div
        dir="rtl"
        lang="ar"
        className="col-span-full grid grid-cols-subgrid gap-y-6"
      >
        <AmountField
          label="المبلغ"
          currencyLabel="العملة"
          hint="حتى 10,000 لكل تحويل."
        />
        <InputField>
          <InputLabel htmlFor={`${id}-members`}>الأعضاء</InputLabel>
          <InputGroup>
            <InputSlot aria-hidden $ink={60}>
              <Search />
            </InputSlot>
            <Input
              id={`${id}-members`}
              type="search"
              placeholder="ابحث بالاسم"
            />
          </InputGroup>
        </InputField>
      </div>
    </div>
  );
}
