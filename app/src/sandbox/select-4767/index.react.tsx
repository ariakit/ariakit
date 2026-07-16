import * as Ariakit from "@ariakit/react";

interface FruitSelectProps {
  focusable?: boolean;
  label: string;
  virtualFocus?: boolean;
}

function FruitSelect({ focusable, label, virtualFocus }: FruitSelectProps) {
  return (
    <Ariakit.SelectProvider defaultValue="Apple" virtualFocus={virtualFocus}>
      <Ariakit.SelectLabel>{label}</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover gutter={4} sameWidth>
        <Ariakit.SelectList focusable={focusable}>
          <Ariakit.SelectItem value="Apple" />
          <Ariakit.SelectItem value="Banana" />
          <Ariakit.SelectItem value="Orange" />
        </Ariakit.SelectList>
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}

export default function Example() {
  return (
    <>
      <FruitSelect label="Favorite fruit" focusable={false} />
      <FruitSelect label="Virtual focus fruit" />
      <FruitSelect
        label="Real focus fruit"
        focusable={false}
        virtualFocus={false}
      />
    </>
  );
}
