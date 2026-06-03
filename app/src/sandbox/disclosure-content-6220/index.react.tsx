import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const store = Ariakit.useDisclosureStore();
  const animating = Ariakit.useStoreState(store, "animating");
  const mounted = Ariakit.useStoreState(store, "mounted");

  return (
    <section
      aria-label="Mixed transition and animation"
      data-animating-state={String(animating)}
      data-mounted-state={String(mounted)}
    >
      <Ariakit.Disclosure store={store} className="button">
        Toggle Mixed transition and animation
      </Ariakit.Disclosure>
      <Ariakit.DisclosureContent
        store={store}
        unmountOnHide
        className="content"
      >
        Animated content
      </Ariakit.DisclosureContent>
    </section>
  );
}
