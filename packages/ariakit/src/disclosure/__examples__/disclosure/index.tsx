import {
  Disclosure,
  DisclosureContent,
  useDisclosureStore,
} from "ariakit/disclosure/store";
import "./style.css";

export default function Example() {
  const disclosure = useDisclosureStore();
  return (
    <div className="wrapper">
      <Disclosure store={disclosure} className="button">
        What are vegetables?
      </Disclosure>
      <DisclosureContent store={disclosure} className="content">
        <p>
          Vegetables are parts of plants that are consumed by humans or other
          animals as food. The original meaning is still commonly used and is
          applied to plants collectively to refer to all edible plant matter,
          including the flowers, fruits, stems, leaves, roots, and seeds.
        </p>
      </DisclosureContent>
    </div>
  );
}
