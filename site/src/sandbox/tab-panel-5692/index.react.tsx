import { getAllTabbableIn } from "@ariakit/core/utils/focus";
import * as ak from "@ariakit/react";
import { useEffect, useRef, useState } from "react";

// TODO: Remove this workaround once
// https://github.com/ariakit/ariakit/issues/5692 is fixed.
function useHasTabbableChildren() {
  const ref = useRef<HTMLDivElement>(null);
  const [hasTabbable, setHasTabbable] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const check = () => {
      setHasTabbable(!!getAllTabbableIn(element).length);
    };

    check();

    const observer = new MutationObserver(check);
    observer.observe(element, {
      subtree: true,
      childList: true,
      attributeFilter: [
        "disabled",
        "hidden",
        "tabindex",
        "inert",
        "contenteditable",
        "type",
        "href",
      ],
    });
    return () => observer.disconnect();
  }, []);

  return { ref, focusable: !hasTabbable };
}

export default function Example() {
  const [loaded, setLoaded] = useState(false);
  const { ref, focusable } = useHasTabbableChildren();

  return (
    <div>
      <button type="button" onClick={() => setLoaded((v) => !v)}>
        Toggle
      </button>
      <ak.TabProvider>
        <ak.TabList aria-label="Panels">
          <ak.Tab>Panel</ak.Tab>
        </ak.TabList>
        <ak.TabPanel ref={ref} focusable={focusable}>
          {loaded ? <a href="#">Interactive link</a> : <p>Loading...</p>}
        </ak.TabPanel>
      </ak.TabProvider>
    </div>
  );
}
