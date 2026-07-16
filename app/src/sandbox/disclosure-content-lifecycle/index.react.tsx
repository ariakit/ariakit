import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

interface DisclosureExampleProps {
  alwaysVisible?: boolean;
  animated?: boolean | number;
  className?: string;
  content: string;
  label: string;
  unmountOnHide?: boolean;
}

function DisclosureExample({
  alwaysVisible,
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
        alwaysVisible={alwaysVisible}
        unmountOnHide={unmountOnHide}
        className={className}
      >
        {content}
      </Ariakit.DisclosureContent>
    </section>
  );
}

// Starts without a CSS animation, so animation detection turns animations off
// on the first open. The button then sets a timed animation at runtime, which
// re-enables the animated state on a closed, but still visible, content
// element.
function AlwaysVisibleExample() {
  const label = "Always visible";
  const [animated, setAnimated] = useState<number>();
  return (
    <div>
      <DisclosureExample
        label={label}
        content="Always visible content"
        className="always-visible-content"
        animated={animated}
        alwaysVisible
      />
      <button type="button" className="button" onClick={() => setAnimated(300)}>
        Animate {label}
      </button>
    </div>
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
        label="Boolean animated"
        content="Boolean animated content"
        animated
        unmountOnHide
      />
      <AlwaysVisibleExample />
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
