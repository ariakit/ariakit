import * as Ariakit from "@ariakit/react";
import "./style.css";

interface DisclosureExampleProps {
  label: string;
  content: string;
  className: string;
}

function DisclosureExample({
  label,
  content,
  className,
}: DisclosureExampleProps) {
  const store = Ariakit.useDisclosureStore();
  const animated = Ariakit.useStoreState(store, "animated");
  const animating = Ariakit.useStoreState(store, "animating");
  const mounted = Ariakit.useStoreState(store, "mounted");

  return (
    <section
      aria-label={label}
      data-animated-state={String(animated)}
      data-animating-state={String(animating)}
      data-mounted-state={String(mounted)}
    >
      <Ariakit.Disclosure store={store} className="button">
        Toggle {label}
      </Ariakit.Disclosure>
      <Ariakit.DisclosureContent
        store={store}
        unmountOnHide
        className={className}
      >
        {content}
      </Ariakit.DisclosureContent>
    </section>
  );
}

export default function Example() {
  return (
    <div>
      <DisclosureExample
        label="Mixed transition and animation"
        content="Animated content"
        className="content"
      />
      <DisclosureExample
        label="No animation with duration"
        content="No animation content"
        className="no-animation"
      />
    </div>
  );
}
