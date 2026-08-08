import { expect, test, vi } from "vitest";
import { isBrowser } from "./__utils.ts";

test.runIf(isBrowser)(
  "reads the interaction driver when sleep is called",
  async () => {
    vi.resetModules();
    const { setInteractionDriver } = await import("./__interaction-driver.ts");
    setInteractionDriver(undefined);
    const { sleep } = await import("./sleep.ts");

    setInteractionDriver({
      click: async () => false,
      hover: async () => false,
      press: async () => false,
      rightClick: async () => false,
      type: async () => false,
    });

    const requestAnimationFrame = vi
      .spyOn(globalThis, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback(0);
        return 0;
      });
    const setTimeout = vi.spyOn(globalThis, "setTimeout");

    try {
      await sleep();
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 20);
    } finally {
      requestAnimationFrame.mockRestore();
      setTimeout.mockRestore();
    }
  },
);
