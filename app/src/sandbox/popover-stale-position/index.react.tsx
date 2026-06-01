import * as Ariakit from "@ariakit/react";
import type { ComponentProps } from "react";
import { useCallback, useRef, useState } from "react";

type PopoverProps = ComponentProps<typeof Ariakit.Popover>;
type UpdatePosition = NonNullable<PopoverProps["updatePosition"]>;

export default function Example() {
  const [placement, setPlacement] =
    useState<Ariakit.PopoverStoreState["placement"]>("bottom");
  const [stalePending, setStalePending] = useState(false);
  const [latestPending, setLatestPending] = useState(false);
  const releaseStaleUpdateRef = useRef<() => void>(() => {});
  const releaseLatestUpdateRef = useRef<() => void>(() => {});
  const delayStaleUpdateRef = useRef(false);
  const delayLatestUpdateRef = useRef(false);
  const latestPositionedRef = useRef(false);
  const latestUpdatePromiseRef = useRef<Promise<void> | null>(null);
  const popover = Ariakit.usePopoverStore({ open: true, placement });
  const currentPlacement = Ariakit.useStoreState(popover, "currentPlacement");

  const updatePosition = useCallback<UpdatePosition>(
    async ({ updatePosition }) => {
      if (delayStaleUpdateRef.current) {
        delayStaleUpdateRef.current = false;
        setStalePending(true);
        await new Promise<void>((resolve) => {
          releaseStaleUpdateRef.current = resolve;
        });
        await updatePosition();
        setStalePending(false);
        return;
      }

      if (delayLatestUpdateRef.current && placement === "top") {
        setLatestPending(true);
        if (!latestPositionedRef.current) {
          latestPositionedRef.current = true;
          await updatePosition();
        }
        latestUpdatePromiseRef.current ??= new Promise<void>((resolve) => {
          releaseLatestUpdateRef.current = () => {
            delayLatestUpdateRef.current = false;
            latestUpdatePromiseRef.current = null;
            resolve();
          };
        });
        await latestUpdatePromiseRef.current;
        setLatestPending(false);
        return;
      }

      await updatePosition();
    },
    [placement],
  );

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        justifyItems: "start",
        padding: 120,
      }}
    >
      <button
        type="button"
        onClick={() => {
          delayLatestUpdateRef.current = true;
          latestPositionedRef.current = false;
          setPlacement("top");
        }}
      >
        Move top
      </button>
      <button
        type="button"
        onClick={() => {
          delayStaleUpdateRef.current = true;
          // Start a new positioning run without changing placement so it
          // becomes stale after the next placement update.
          popover.render();
        }}
      >
        Start stale update
      </button>
      <button type="button" onClick={() => releaseStaleUpdateRef.current()}>
        Release stale update
      </button>
      <button type="button" onClick={() => releaseLatestUpdateRef.current()}>
        Release latest update
      </button>
      <div>Pending stale update: {stalePending ? "yes" : "no"}</div>
      <div>Pending latest update: {latestPending ? "yes" : "no"}</div>
      <div>Current placement: {currentPlacement}</div>
      <Ariakit.PopoverAnchor store={popover} render={<button type="button" />}>
        Anchor
      </Ariakit.PopoverAnchor>
      <Ariakit.Popover
        store={popover}
        flip={false}
        slide={false}
        sameWidth
        updatePosition={updatePosition}
        wrapperProps={{ id: "popover-stale-position-wrapper" }}
      >
        Popover
      </Ariakit.Popover>
    </div>
  );
}
