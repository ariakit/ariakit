import {
  Disclosure,
  DisclosureContent,
  useDisclosureState,
} from "ariakit/disclosure";
import "./style.css";

export default function Example() {
  const disclosure = useDisclosureState();
  return (
    <div className="wrapper">
      <Disclosure state={disclosure} className="button">
        What are vegetables?
      </Disclosure>
      <DisclosureContent state={disclosure}>
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
