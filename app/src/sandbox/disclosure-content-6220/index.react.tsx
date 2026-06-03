import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  // TODO(#6220): Workaround — set `animated` to the real end time (510ms) so the
  // manual timeout bypasses the buggy CSS time parsing. Remove once
  // https://github.com/ariakit/ariakit/issues/6220 is fixed.
  const store = Ariakit.useDisclosureStore({ animated: 510 });
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
