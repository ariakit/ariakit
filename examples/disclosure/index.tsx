import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div className="wrapper">
      <Ariakit.DisclosureProvider>
        <Ariakit.Disclosure className="button">
          What are vegetables?
        </Ariakit.Disclosure>
        <Ariakit.DisclosureContent className="content">
          <p>
            Vegetables are parts of plants that are consumed by humans or other
            animals as food. The original meaning is still commonly used and is
            applied to plants collectively to refer to all edible plant matter,
            including the flowers, fruits, stems, leaves, roots, and seeds.
          </p>
        </Ariakit.DisclosureContent>
      </Ariakit.DisclosureProvider>
    </div>
  );
}
