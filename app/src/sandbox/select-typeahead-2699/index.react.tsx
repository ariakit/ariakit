import * as Ariakit from "@ariakit/react";
import "./style.css";

const countries = [
  { value: "Brazil", flag: "🇧🇷" },
  { value: "Canada", flag: "🇨🇦" },
  { value: "Japan", flag: "🇯🇵" },
  { value: "Mexico", flag: "🇲🇽" },
];

export default function Example() {
  return (
    <Ariakit.SelectProvider defaultValue="Brazil">
      <Ariakit.SelectLabel>Country</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover gutter={4} sameWidth>
        {countries.map((country) => (
          <Ariakit.SelectItem
            key={country.value}
            aria-label={country.value}
            className="item"
            data-flag={country.flag}
            value={country.value}
          >
            {country.value}
          </Ariakit.SelectItem>
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
