import * as Ariakit from "@ariakit/react";

interface FixtureProps {
  items: string[];
  label: string;
}

function Fixture({ items, label }: FixtureProps) {
  const store = Ariakit.useCompositeStore();

  return (
    <section aria-label={label}>
      <Ariakit.Composite
        aria-label={label}
        render={<Ariakit.CompositeTypeahead />}
        store={store}
      >
        {items.map((item) => (
          <Ariakit.CompositeItem key={item}>{item}</Ariakit.CompositeItem>
        ))}
      </Ariakit.Composite>
    </section>
  );
}

export default function Example() {
  return (
    <>
      <Fixture items={["Alpha", "Alpine", "Apricot"]} label="First composite" />
      <Fixture
        items={["Cherry", "Banana", "Blueberry"]}
        label="Second composite"
      />
    </>
  );
}
