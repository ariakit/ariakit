import { createRequire } from "node:module";
import { render } from "@ariakit/test/react";
import { afterEach, expect, test, vi } from "vitest";
import { useMergeRefs } from "./hooks.ts";

const reactMajor = Number.parseInt(
  createRequire(import.meta.url)("react/package.json").version,
  10,
);

afterEach(() => {
  document.body.innerHTML = "";
});

test.skipIf(reactMajor < 19)(
  "useMergeRefs preserves ref cleanup and detaches plain refs",
  async () => {
    const cleanup = vi.fn();
    const cleanupRef = vi.fn(() => cleanup);
    const plainRef = vi.fn();
    const objectRef = { current: null as HTMLDivElement | null };

    const Test = () => {
      const ref = useMergeRefs(cleanupRef, plainRef, objectRef);
      return <div ref={ref} />;
    };

    const { unmount } = await render(<Test />);
    const [element] = plainRef.mock.lastCall ?? [];

    expect(cleanupRef).toHaveBeenCalledWith(element);
    expect(plainRef).toHaveBeenCalledWith(element);
    expect(objectRef.current).toBe(element);

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(cleanupRef).toHaveBeenCalledTimes(1);
    expect(plainRef).toHaveBeenLastCalledWith(null);
    expect(objectRef.current).toBeNull();
  },
);
