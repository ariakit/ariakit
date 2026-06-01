import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { PopoverAnchor } from "./popover-anchor.tsx";
import { usePopoverStore } from "./popover-store.ts";
import { Popover } from "./popover.tsx";

type Placement = "bottom" | "top";

type MiddlewareState = {
  placement: Placement;
  strategy: string;
  middlewareData: Record<string, unknown>;
  rects: {
    reference: { width: number };
    floating: { width: number; height: number };
  };
  elements: {
    reference: unknown;
    floating: HTMLElement;
  };
};

type Middleware = {
  name: string;
  fn: (state: MiddlewareState) => unknown;
};

type ComputeOptions = {
  placement?: Placement;
  strategy?: string;
  middleware?: Array<Middleware | undefined>;
};

type SizeOptions = {
  apply?: (
    state: MiddlewareState & {
      availableWidth: number;
      availableHeight: number;
    },
  ) => unknown;
};

const floatingMock = vi.hoisted(() => {
  const state = {
    calls: 0,
    finished: 0,
    releaseStale: () => {},
    resolveStaleStarted: () => {},
    staleStarted: Promise.resolve(),
    staleReleased: Promise.resolve(),
    reset() {
      state.calls = 0;
      state.finished = 0;
      state.staleStarted = new Promise<void>((resolve) => {
        state.resolveStaleStarted = () => resolve();
      });
      state.staleReleased = new Promise<void>((resolve) => {
        state.releaseStale = () => resolve();
      });
    },
  };
  state.reset();
  return state;
});

vi.mock("@floating-ui/dom", () => ({
  arrow: vi.fn(),
  autoUpdate: vi.fn(
    (
      _reference: unknown,
      _floating: unknown,
      update: () => void | Promise<void>,
    ) => {
      void update();
      return vi.fn();
    },
  ),
  computePosition: vi.fn(
    async (
      reference: unknown,
      floating: HTMLElement,
      options: ComputeOptions,
    ) => {
      floatingMock.calls += 1;
      const call = floatingMock.calls;
      const placement = options.placement ?? "bottom";

      if (call === 1) {
        floatingMock.resolveStaleStarted();
        await floatingMock.staleReleased;
      }

      const middleware = options.middleware?.find(
        (item) => item?.name === "size",
      );
      await middleware?.fn({
        placement,
        strategy: options.strategy ?? "absolute",
        middlewareData: {},
        rects: {
          reference: { width: placement === "top" ? 240 : 120 },
          floating: { width: 0, height: 0 },
        },
        elements: { reference, floating },
      });
      floatingMock.finished += 1;

      return {
        x: 0,
        y: 0,
        placement,
        strategy: options.strategy ?? "absolute",
        middlewareData: {},
      };
    },
  ),
  flip: vi.fn(),
  limitShift: vi.fn(),
  offset: vi.fn(),
  shift: vi.fn(),
  size: vi.fn((options: SizeOptions) => ({
    name: "size",
    fn: (state: MiddlewareState) =>
      options.apply?.({
        ...state,
        availableWidth: 800,
        availableHeight: 600,
      }),
  })),
}));

afterEach(() => {
  cleanup();
  floatingMock.reset();
});

function Example({ placement }: { placement: Placement }) {
  const popover = usePopoverStore({ open: true, placement });

  return (
    <>
      <PopoverAnchor store={popover}>Anchor</PopoverAnchor>
      <Popover
        store={popover}
        portal={false}
        flip={false}
        slide={false}
        sameWidth
        wrapperProps={{ id: "wrapper" }}
      >
        Popover
      </Popover>
    </>
  );
}

test("skips stale size middleware styles after cleanup", async () => {
  const { rerender } = render(<Example placement="bottom" />);

  await floatingMock.staleStarted;

  rerender(<Example placement="top" />);

  const wrapper = document.getElementById("wrapper");
  if (!(wrapper instanceof HTMLElement)) {
    throw new Error("Wrapper not found");
  }
  await waitFor(() => expect(wrapper.style.width).toBe("240px"));

  await act(async () => {
    floatingMock.releaseStale();
  });

  await waitFor(() => expect(floatingMock.finished).toBe(2));
  expect(wrapper.style.width).toBe("240px");
});
