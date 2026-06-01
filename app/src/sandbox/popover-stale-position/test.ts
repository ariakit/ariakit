import { click, q, waitFor } from "@ariakit/test";
import { afterEach, expect, test, vi } from "vitest";

type Placement = "bottom" | "top";

interface MiddlewareState {
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
}

interface Middleware {
  name: string;
  fn: (state: MiddlewareState) => unknown;
}

interface ComputeOptions {
  placement?: Placement;
  strategy?: string;
  middleware?: Array<Middleware | undefined>;
}

interface SizeOptions {
  apply?: (
    state: MiddlewareState & {
      availableWidth: number;
      availableHeight: number;
    },
  ) => unknown;
}

const floatingMock = vi.hoisted(() => {
  const state = {
    calls: 0,
    delayCall: 0,
    finished: 0,
    staleFinished: false,
    releaseStale: () => {},
    resolveStaleStarted: () => {},
    staleStarted: Promise.resolve(),
    staleReleased: Promise.resolve(),
    reset() {
      state.calls = 0;
      state.delayCall = 0;
      state.finished = 0;
      state.staleFinished = false;
      state.staleStarted = new Promise<void>((resolve) => {
        state.resolveStaleStarted = () => resolve();
      });
      state.staleReleased = new Promise<void>((resolve) => {
        state.releaseStale = () => resolve();
      });
    },
    startStaleUpdate() {
      state.delayCall = state.calls + 1;
    },
  };
  state.reset();
  return state;
});

const getFloatingUiDomMock = vi.hoisted(() => {
  return () => ({
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
        const placement = options.placement ?? "bottom";
        const isStaleUpdate = floatingMock.calls === floatingMock.delayCall;

        if (isStaleUpdate) {
          floatingMock.delayCall = 0;
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
        if (isStaleUpdate) {
          floatingMock.staleFinished = true;
        }

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
  });
});

vi.mock("@floating-ui/dom", getFloatingUiDomMock);
vi.mock("@floating-ui/dom/dist/floating-ui.dom.mjs", getFloatingUiDomMock);
vi.mock(
  "../../../../packages/ariakit-react-components/node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs",
  getFloatingUiDomMock,
);

afterEach(() => {
  floatingMock.reset();
});

test("skips stale size middleware styles after cleanup", async () => {
  await waitFor(() => expect(floatingMock.finished).toBeGreaterThan(0));

  const wrapper = document.getElementById("popover-stale-position-wrapper");
  if (!(wrapper instanceof HTMLElement)) {
    throw new Error("Wrapper not found");
  }

  floatingMock.startStaleUpdate();
  await click(q.button("Update position"));
  await floatingMock.staleStarted;

  await click(q.button("Move top now"));
  await waitFor(() => expect(wrapper.style.width).toBe("240px"));
  expect(wrapper.style.getPropertyValue("--popover-anchor-width")).toBe(
    "240px",
  );

  floatingMock.releaseStale();

  await waitFor(() => expect(floatingMock.staleFinished).toBe(true));
  expect(wrapper.style.width).toBe("240px");
  expect(wrapper.style.getPropertyValue("--popover-anchor-width")).toBe(
    "240px",
  );
});
