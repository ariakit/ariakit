// import { createDisclosureStore } from "@ariakit/core/disclosure/disclosure-store";
import {
  Disclosure,
  DisclosureContent,
  useDisclosureStore,
} from "ariakit/disclosure/store";
import "./style.css";

// const store = createDisclosureStore({ animated: 500 });

// store.subscribe((state) => console.log(state.animating), ["animating"]);

export default function Example() {
  const disclosure = useDisclosureStore({ animated: 500 });
  const disclosure1 = useDisclosureStore({
    ...disclosure.useWithout("animated"),
    animated: false,
  });
  const disclosure2 = useDisclosureStore(disclosure);
  console.log("animating", disclosure1.useState("animating"));
  // console.log("mounted", disclosure.useState("mounted"));
  return (
    <div className="wrapper">
      <Disclosure store={disclosure1} className="button">
        What are vegetables?
      </Disclosure>
      <DisclosureContent store={disclosure1} className="content">
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
