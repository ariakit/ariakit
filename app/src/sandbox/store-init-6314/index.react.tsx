import { useStoreState } from "@ariakit/react";
import { createStore, init, setup } from "@ariakit/store";
import { useEffect, useRef, useState } from "react";

interface Hotkey {
  key: string;
  handler: () => void;
}

const hotkeys: Hotkey[] = [];

function dispatchHotkeys(event: KeyboardEvent) {
  for (const hotkey of hotkeys) {
    if (hotkey.key === event.key) {
      hotkey.handler();
    }
  }
}

function createHotkeyCounterStore(key: string) {
  const store = createStore({ count: 0 });
  setup(store, () => {
    const hotkey: Hotkey = {
      key,
      handler: () => store.setState("count", (count) => count + 1),
    };
    hotkeys.push(hotkey);
    return () => {
      hotkeys.splice(hotkeys.indexOf(hotkey), 1);
    };
  });
  return store;
}

const storeA = createHotkeyCounterStore("a");
const storeB = createHotkeyCounterStore("b");

function PanelA() {
  const cleanupRef = useRef<(() => void) | null>(null);
  const [active, setActive] = useState(true);
  const count = useStoreState(storeA, "count");

  useEffect(() => {
    cleanupRef.current = init(storeA);
    return () => cleanupRef.current?.();
  }, []);

  return (
    <section>
      <p>A count: {count}</p>
      <p>A active: {active ? "yes" : "no"}</p>
      <button
        type="button"
        onClick={() => {
          // Keep the stale disposer reference so unmount calls it again.
          cleanupRef.current?.();
          setActive(false);
        }}
      >
        Stop hotkey A
      </button>
    </section>
  );
}

function PanelB() {
  const count = useStoreState(storeB, "count");

  useEffect(() => init(storeB), []);

  return (
    <section>
      <p>B count: {count}</p>
    </section>
  );
}

export default function Example() {
  const [panelAMounted, setPanelAMounted] = useState(true);

  useEffect(() => {
    document.addEventListener("keydown", dispatchHotkeys);
    return () => document.removeEventListener("keydown", dispatchHotkeys);
  }, []);

  return (
    <>
      {panelAMounted && <PanelA />}
      <PanelB />
      <button type="button" onClick={() => setPanelAMounted(false)}>
        Hide panel A
      </button>
    </>
  );
}
