import * as Ariakit from "@ariakit/react";

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
          <Ariakit.SelectItem key={country.value} value={country.value}>
            <span aria-hidden>{country.flag}</span> {country.value}
          </Ariakit.SelectItem>
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
