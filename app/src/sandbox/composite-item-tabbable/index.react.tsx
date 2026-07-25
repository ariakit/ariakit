import * as Ariakit from "@ariakit/react";

const defaultItems = [{ id: "seeded-one" }, { id: "seeded-two" }];

// A composite store without a composite element never publishes baseElement, so
// its items must still use roving tabindex.
export function ContainerlessFixture() {
  return (
    <Ariakit.RadioProvider defaultValue="a">
      <Ariakit.Radio value="a" />
      <Ariakit.Radio value="b" />
    </Ariakit.RadioProvider>
  );
}

export function VirtualFocusFixture() {
  return (
    <Ariakit.CompositeProvider virtualFocus>
      <Ariakit.Composite aria-label="Virtual focus composite">
        <Ariakit.CompositeItem>One</Ariakit.CompositeItem>
        <Ariakit.CompositeItem>Two</Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

// The store is seeded with items, so store.item() resolves on the first render
// while the rendered items are still empty.
export function SeededFixture() {
  return (
    <Ariakit.CompositeProvider virtualFocus defaultItems={defaultItems}>
      <Ariakit.Composite aria-label="Seeded composite">
        <Ariakit.CompositeItem id="seeded-one">One</Ariakit.CompositeItem>
        <Ariakit.CompositeItem id="seeded-two">Two</Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

export function RovingFixture() {
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite aria-label="Roving composite">
        <Ariakit.CompositeItem>One</Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

export default function Example() {
  return (
    <>
      <ContainerlessFixture />
      <VirtualFocusFixture />
      <RovingFixture />
      <SeededFixture />
    </>
  );
}
