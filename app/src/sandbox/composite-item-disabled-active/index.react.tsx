import * as Ariakit from "@ariakit/react";
import { useId, useState } from "react";

// TODO: Remove this workaround once
// https://github.com/ariakit/ariakit/issues/7359 is fixed. Keeping the item
// accessible while it holds DOM focus stops the native `disabled` attribute
// from moving focus to the body. It is deliberately not applied to the virtual
// focus, opt out, and initially disabled sections, which must keep their
// current behavior.
function SelfDisablingItem(props: Ariakit.CompositeItemProps) {
  const [focused, setFocused] = useState(false);
  return (
    <Ariakit.CompositeItem
      {...props}
      accessibleWhenDisabled={focused}
      onFocus={(event) => {
        props.onFocus?.(event);
        setFocused(true);
      }}
      onBlur={(event) => {
        props.onBlur?.(event);
        const { currentTarget } = event;
        // Firefox fires focusout when the window loses focus while the element
        // still holds DOM focus. Releasing the workaround then would apply the
        // native attribute to the focused element and drop focus to the body
        // once the window comes back.
        if (currentTarget.contains(currentTarget.ownerDocument.activeElement)) {
          return;
        }
        setFocused(false);
      }}
    />
  );
}

function RovingComposite() {
  const [read, setRead] = useState(false);
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite role="toolbar" aria-label="Roving message actions">
        <Ariakit.CompositeItem>Roving reply</Ariakit.CompositeItem>
        <SelfDisablingItem disabled={read} onClick={() => setRead(true)}>
          Roving mark as read
        </SelfDisablingItem>
        <Ariakit.CompositeItem>Roving archive</Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

function VirtualFocusComposite() {
  const [read, setRead] = useState(false);
  return (
    <Ariakit.CompositeProvider virtualFocus>
      <Ariakit.Composite role="toolbar" aria-label="Virtual message actions">
        <Ariakit.CompositeItem>Virtual reply</Ariakit.CompositeItem>
        <Ariakit.CompositeItem disabled={read} onClick={() => setRead(true)}>
          Virtual mark as read
        </Ariakit.CompositeItem>
        <Ariakit.CompositeItem>Virtual archive</Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

function ControlledComposite() {
  const [activeId, setActiveId] = useState<string | null | undefined>();
  const [read, setRead] = useState(false);
  return (
    <Ariakit.CompositeProvider activeId={activeId} setActiveId={setActiveId}>
      <Ariakit.Composite role="toolbar" aria-label="Controlled message actions">
        <Ariakit.CompositeItem>Controlled reply</Ariakit.CompositeItem>
        <SelfDisablingItem disabled={read} onClick={() => setRead(true)}>
          Controlled mark as read
        </SelfDisablingItem>
        <Ariakit.CompositeItem>Controlled archive</Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

function NativeControlComposite() {
  const [locked, setLocked] = useState(false);
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite role="toolbar" aria-label="Native message actions">
        <Ariakit.CompositeItem>Native reply</Ariakit.CompositeItem>
        <SelfDisablingItem
          render={<input type="checkbox" />}
          aria-label="Native mark as read"
          disabled={locked}
          onChange={() => setLocked(true)}
        />
        <Ariakit.CompositeItem>Native archive</Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

// An explicit `accessibleWhenDisabled={false}` opts out of keeping the item
// reachable, so this item becomes natively disabled even while it holds focus.
function OptOutComposite() {
  const [read, setRead] = useState(false);
  return (
    <>
      <button type="button" tabIndex={0}>
        Before opt out
      </button>
      <Ariakit.CompositeProvider>
        <Ariakit.Composite role="toolbar" aria-label="Opt out message actions">
          <Ariakit.CompositeItem>Opt out reply</Ariakit.CompositeItem>
          <Ariakit.CompositeItem
            disabled={read}
            accessibleWhenDisabled={false}
            onClick={() => setRead(true)}
          >
            Opt out mark as read
          </Ariakit.CompositeItem>
          <Ariakit.CompositeItem>Opt out archive</Ariakit.CompositeItem>
        </Ariakit.Composite>
      </Ariakit.CompositeProvider>
    </>
  );
}

// The active item is disabled before it ever receives focus, so the composite
// must keep skipping it. https://github.com/ariakit/ariakit/issues/3232
function InitiallyDisabledComposite() {
  const disabledId = useId();
  return (
    <>
      <button type="button" tabIndex={0}>
        Before initially disabled
      </button>
      <Ariakit.CompositeProvider defaultActiveId={disabledId}>
        <Ariakit.Composite role="toolbar" aria-label="Initially disabled">
          <Ariakit.CompositeItem id={disabledId} disabled>
            Initially disabled reply
          </Ariakit.CompositeItem>
          <Ariakit.CompositeItem>
            Initially disabled archive
          </Ariakit.CompositeItem>
        </Ariakit.Composite>
      </Ariakit.CompositeProvider>
      <button type="button" tabIndex={0}>
        After initially disabled
      </button>
    </>
  );
}

export default function Example() {
  return (
    <main>
      <RovingComposite />
      <VirtualFocusComposite />
      <ControlledComposite />
      <NativeControlComposite />
      <OptOutComposite />
      <InitiallyDisabledComposite />
    </main>
  );
}
