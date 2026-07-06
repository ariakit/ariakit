import * as Ariakit from "@ariakit/react";
import "./style.css";

interface DisclosureExampleProps {
  animated?: boolean | number;
  className?: string;
  content: string;
  label: string;
  unmountOnHide?: boolean;
}

function DisclosureExample({
  animated,
  className,
  content,
  label,
  unmountOnHide,
}: DisclosureExampleProps) {
  const store = Ariakit.useDisclosureStore({ animated });
  const animatedState = Ariakit.useStoreState(store, "animated");
  const animating = Ariakit.useStoreState(store, "animating");
  const mounted = Ariakit.useStoreState(store, "mounted");

  return (
    <section
      aria-label={label}
      data-animated-state={String(animatedState)}
      data-animating-state={String(animating)}
      data-mounted-state={String(mounted)}
    >
      <Ariakit.Disclosure store={store} className="button">
        Toggle {label}
      </Ariakit.Disclosure>
      <Ariakit.DisclosureContent
        store={store}
        unmountOnHide={unmountOnHide}
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
        label="No transition"
        content="No transition content"
      />
      <DisclosureExample
        label="Unmount on hide"
        content="Unmounted no transition content"
        unmountOnHide
      />
      <DisclosureExample
        label="Timed unmount"
        content="Timed unmount content"
        animated={1000}
        unmountOnHide
      />
      <DisclosureExample
        label="Mixed transition and animation"
        content="Animated content"
        className="content"
        unmountOnHide
      />
      <DisclosureExample
        label="No animation with duration"
        content="No animation content"
        className="no-animation"
        unmountOnHide
      />
    </div>
  );
}
