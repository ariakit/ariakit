import * as Ariakit from "@ariakit/react";

// https://github.com/ariakit/ariakit/issues/4115
export default function Example() {
  const store = Ariakit.useDisclosureStore({ animated: 100 });
  const animating = Ariakit.useStoreState(store, "animating");
  return (
    <>
      <button onClick={store.toggle}>Toggle</button>
      <Ariakit.DisclosureContent
        store={store}
        alwaysVisible
        data-animating={animating || undefined}
        className="h-14 transition-[height] duration-100 data-enter:h-28"
      >
        Content
      </Ariakit.DisclosureContent>
    </>
  );
}
