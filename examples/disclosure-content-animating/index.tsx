import * as Ariakit from "@ariakit/react";
import "./style.css";

// https://github.com/ariakit/ariakit/issues/4115
export default function Example() {
  const store = Ariakit.useDisclosureStore();
  const animating = Ariakit.useStoreState(store, "animating");
  return (
    <>
      <button onClick={store.toggle}>Toggle</button>
      <Ariakit.DisclosureContent
        store={store}
        alwaysVisible
        data-animating={animating || undefined}
        className="transition"
      >
        Content
      </Ariakit.DisclosureContent>
    </>
  );
}
