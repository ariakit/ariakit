import * as ak from "@ariakit/react";
import {
  DisclosureButton,
  DisclosureContent,
} from "@ariakit/ui/components/disclosure.ariakit.react";

interface DetailsProps {
  name: string;
}

function Details({ name }: DetailsProps) {
  const store = ak.useDisclosureStore();
  return (
    <section className="grid gap-2">
      <DisclosureButton
        store={store}
        indicator={false}
        $p={3}
        $rounded="md"
        className="border data-open:border-green-700 data-open:bg-green-100 data-open:text-green-950"
      >
        {name} details
      </DisclosureButton>
      <DisclosureContent store={store}>
        {name} details are available.
      </DisclosureContent>
    </section>
  );
}

export default function Example() {
  // The surrounding open provider must not replace Details' explicit store.
  return (
    <div className="grid gap-6">
      <Details name="Project" />
      <ak.DisclosureProvider defaultOpen>
        <Details name="Team" />
      </ak.DisclosureProvider>
    </div>
  );
}
