import * as ak from "@ariakit/react";
import type { CSSProperties, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
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

// TODO: Remove this workaround after
// https://github.com/ariakit/ariakit/issues/8366 is fixed. The document sees
// focus in a shadow root as focus on the shadow host, so this reads the focused
// element from the root of each hovercard.
function hasFocusIn(...cards: Array<HTMLElement | null>) {
  return cards.some((card) => {
    if (!card?.isConnected) return false;
    // The root of a connected element is a document or a shadow root.
    const root = card.getRootNode() as Document | ShadowRoot;
    const { activeElement } = root;
    return !!activeElement && card.contains(activeElement);
  });
}

function ProfileHovercard() {
  const cardRef = useRef<HTMLDivElement>(null);
  return (
    <ak.HovercardProvider placement="bottom-start">
      <ak.HovercardAnchor href="#profile">Profile</ak.HovercardAnchor>
      <ak.Hovercard
        ref={cardRef}
        hideOnHoverOutside={() => !hasFocusIn(cardRef.current)}
        style={cardStyle}
      >
        <ak.HovercardHeading>Profile</ak.HovercardHeading>
        <ak.Button>Follow</ak.Button>
      </ak.Hovercard>
    </ak.HovercardProvider>
  );
}

function TeamHovercard() {
  const portalElement = useContext(ShadowPortalContext);
  const teamRef = useRef<HTMLDivElement>(null);
  const memberRef = useRef<HTMLDivElement>(null);
  return (
    <ak.HovercardProvider placement="bottom-start">
      <ak.HovercardAnchor href="#team">Team</ak.HovercardAnchor>
      <ak.Hovercard
        ref={teamRef}
        // The member hovercard renders in a portal, outside this one.
        hideOnHoverOutside={() =>
          !hasFocusIn(teamRef.current, memberRef.current)
        }
        style={cardStyle}
      >
        <ak.HovercardHeading>Team</ak.HovercardHeading>
        <ak.HovercardProvider placement="right-start">
          <ak.HovercardAnchor href="#member">Member</ak.HovercardAnchor>
          <ak.Hovercard
            ref={memberRef}
            portal
            portalElement={portalElement}
            hideOnHoverOutside={() => !hasFocusIn(memberRef.current)}
            style={cardStyle}
          >
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
