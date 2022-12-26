import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const disclosure = Ariakit.useDisclosureStore();
  return (
    <div className="wrapper">
      <Ariakit.Disclosure store={disclosure} className="button">
        What are vegetables?
      </Ariakit.Disclosure>
      <Ariakit.DisclosureContent store={disclosure} className="content">
        <p>
          Vegetables are parts of plants that are consumed by humans or other
          animals as food. The original meaning is still commonly used and is
          applied to plants collectively to refer to all edible plant matter,
          including the flowers, fruits, stems, leaves, roots, and seeds.
        </p>
      </Ariakit.DisclosureContent>
    </div>
  );
}
