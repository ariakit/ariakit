import * as ak from "@ariakit/react";
import type { CSSProperties, ReactNode } from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";

// The page styles don't reach a shadow root, so the elements in it use inline
// styles.
const cardStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 8,
  padding: 16,
  border: "1px solid",
  background: "white",
  color: "black",
} satisfies CSSProperties;

// The element in the shadow root that a nested hovercard renders in, so it
// stays in the shadow root, such as for the styles of a web component.
const ShadowPortalContext = createContext<HTMLElement | null>(null);

interface ShadowHostProps {
  name: string;
  children: ReactNode;
}

// Renders the children in an open shadow root, like a web component does.
function ShadowHost({ name, children }: ShadowHostProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  const setHost = useCallback((host: HTMLDivElement | null) => {
    if (!host) {
      setContainer(null);
      setPortalElement(null);
      return;
    }
    const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
    shadow.replaceChildren();
    const doc = host.ownerDocument;
    const content = doc.createElement("div");
    const portal = doc.createElement("div");
    content.dataset.shadowContainer = "";
    portal.dataset.shadowPortal = "";
    shadow.append(content, portal);
    setContainer(content);
    setPortalElement(portal);
  }, []);
  return (
    <div ref={setHost} data-shadow-host={name}>
      {container &&
        createPortal(
          <ShadowPortalContext.Provider value={portalElement}>
            {children}
          </ShadowPortalContext.Provider>,
          container,
        )}
    </div>
  );
}

function ProfileHovercard() {
  return (
    <ak.HovercardProvider placement="bottom-start">
      <ak.HovercardAnchor href="#profile">Profile</ak.HovercardAnchor>
      <ak.Hovercard style={cardStyle}>
        <ak.HovercardHeading>Profile</ak.HovercardHeading>
        <ak.Button>Follow</ak.Button>
      </ak.Hovercard>
    </ak.HovercardProvider>
  );
}

function TeamHovercard() {
  const portalElement = useContext(ShadowPortalContext);
  return (
    <ak.HovercardProvider placement="bottom-start">
      <ak.HovercardAnchor href="#team">Team</ak.HovercardAnchor>
      <ak.Hovercard style={cardStyle}>
        <ak.HovercardHeading>Team</ak.HovercardHeading>
        <ak.HovercardProvider placement="right-start">
          <ak.HovercardAnchor href="#member">Member</ak.HovercardAnchor>
          <ak.Hovercard portal portalElement={portalElement} style={cardStyle}>
            <ak.HovercardHeading>Member</ak.HovercardHeading>
            <ak.Button>Message</ak.Button>
          </ak.Hovercard>
        </ak.HovercardProvider>
      </ak.Hovercard>
    </ak.HovercardProvider>
  );
}

export default function Example() {
  return (
    <div className="flex items-start gap-96">
      <ShadowHost name="profile">
        <ProfileHovercard />
      </ShadowHost>
      <ShadowHost name="team">
        <TeamHovercard />
      </ShadowHost>
    </div>
  );
}
