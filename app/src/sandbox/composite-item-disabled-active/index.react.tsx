import * as Ariakit from "@ariakit/react";
import { useId, useState } from "react";

function RovingComposite() {
  const [read, setRead] = useState(false);
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite role="toolbar" aria-label="Roving message actions">
        <Ariakit.CompositeItem>Roving reply</Ariakit.CompositeItem>
        <Ariakit.CompositeItem disabled={read} onClick={() => setRead(true)}>
          Roving mark as read
        </Ariakit.CompositeItem>
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
        <Ariakit.CompositeItem disabled={read} onClick={() => setRead(true)}>
          Controlled mark as read
        </Ariakit.CompositeItem>
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
        <Ariakit.CompositeItem
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
