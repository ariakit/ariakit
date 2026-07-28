import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

export default function Example() {
  const [count, setCount] = useState(0);
  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(
    null,
  );
  const setHost = useCallback((host: HTMLDivElement | null) => {
    if (!host) {
      setPortalElement(null);
      return;
    }
    const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
    const container =
      shadow.querySelector<HTMLDivElement>("[data-react-portal]") ||
      host.ownerDocument.createElement("div");
    container.dataset.reactPortal = "";
    if (!container.isConnected) {
      shadow.append(container);
    }
    setPortalElement(container);
  }, []);

  return (
    <>
      <p>Opened {count} times</p>
      <div ref={setHost} />
      {portalElement &&
        createPortal(
          <Ariakit.HovercardProvider
            timeout={20}
            hideTimeout={20}
            setOpen={(open) => {
              if (open) {
                setCount((value) => value + 1);
              }
            }}
          >
            <Ariakit.HovercardAnchor href="#shadow-profile">
              @ariakit.com
            </Ariakit.HovercardAnchor>
            <Ariakit.Hovercard>
              <Ariakit.HovercardHeading>Ariakit</Ariakit.HovercardHeading>
            </Ariakit.Hovercard>
          </Ariakit.HovercardProvider>,
          portalElement,
        )}
    </>
  );
}
