import * as Ariakit from "@ariakit/react";
import { useState } from "react";

interface FixtureProps {
  label: string;
  items: SelectItem[];
}

interface SelectItem {
  id: string;
  value?: string;
  disabled?: boolean;
}

function Fixture({ label, items }: FixtureProps) {
  const [value, setValue] = useState("");
  const select = Ariakit.useSelectStore({
    focusLoop: true,
    items,
    value,
    setValue,
  });
  const activeId = Ariakit.useStoreState(select, "activeId");
  const firstId = items[0]?.id;
  const itemDisabled = Ariakit.useStoreState(select, () => {
    if (!firstId) return "missing";
    return String(select.item(firstId)?.disabled ?? "missing");
  });
  const renderedDisabled = Ariakit.useStoreState(select, (state) => {
    const [item] = state.renderedItems;
    return String(item?.disabled ?? "missing");
  });

  return (
    <section>
      <Ariakit.SelectLabel store={select}>{label}</Ariakit.SelectLabel>
      <Ariakit.Select store={select} showOnKeyDown={false} />
      <Ariakit.SelectPopover store={select} gutter={4} sameWidth>
        {items.map((item) => (
          <Ariakit.SelectItem id={item.id} key={item.id} value={item.value} />
        ))}
      </Ariakit.SelectPopover>
      <p>
        Active item:{" "}
        <output aria-label={`${label} active item`}>
          {activeId ?? "None"}
        </output>
      </p>
      <p>
        Value: <output aria-label={`${label} value`}>{value || "None"}</output>
      </p>
      <p>
        Item disabled:{" "}
        <output aria-label={`${label} item disabled`}>{itemDisabled}</output>
      </p>
      <p>
        Rendered disabled:{" "}
        <output aria-label={`${label} rendered disabled`}>
          {renderedDisabled}
        </output>
      </p>
    </section>
  );
}

export default function Example() {
  return (
    <>
      <Fixture
        label="Single disabled fruit"
        items={[{ id: "apple", value: "Apple", disabled: true }]}
      />
      <Fixture
        label="Mixed fruit"
        items={[
          { id: "apple", value: "Apple", disabled: true },
          { id: "orange", value: "Orange" },
        ]}
      />
      <Fixture
        label="Valueless fruit"
        items={[{ id: "placeholder" }, { id: "pear", value: "Pear" }]}
      />
    </>
  );
}
