import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.DisclosureProvider>
      <Ariakit.Disclosure>What are vegetables?</Ariakit.Disclosure>
      <Ariakit.DisclosureContent>
        Vegetables are parts of plants.
      </Ariakit.DisclosureContent>
    </Ariakit.DisclosureProvider>
  );
}
