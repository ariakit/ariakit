import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.DisclosureProvider>
      <Ariakit.Disclosure>What are vegetables?</Ariakit.Disclosure>
      <Ariakit.DisclosureContent className="content-wrapper grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 data-enter:grid-rows-[1fr] [&>*]:overflow-hidden">
        <div>
          <div className="content p-4">
            Vegetables are parts of plants that are consumed as food.
          </div>
        </div>
      </Ariakit.DisclosureContent>
    </Ariakit.DisclosureProvider>
  );
}
