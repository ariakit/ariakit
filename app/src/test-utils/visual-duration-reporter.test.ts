import { expect, test, vi } from "vitest";
import VisualDurationReporter from "./visual-duration-reporter.ts";

test("logs retry durations without capture data", () => {
  const messages: string[] = [];
  const log = vi.spyOn(console, "log").mockImplementation((message) => {
    messages.push(message);
  });
  try {
    const reporter = new VisualDurationReporter();
    const testCase = {
      id: "test-id",
      titlePath: () => ["visual-chrome.ts", "button @visual"],
      parent: { project: () => ({ name: "chrome" }) },
      location: { file: "private-path" },
    };
    const failedResult = {
      retry: 0,
      status: "failed" as const,
      duration: 120,
      attachments: [{ body: Buffer.from("private-image-bytes") }],
      error: { message: "private-error" },
    };
    reporter.onTestEnd(testCase, failedResult);
    reporter.onTestEnd(testCase, {
      retry: 1,
      status: "passed",
      duration: 80,
    });

    reporter.onEnd();

    const prefix = "VISUAL_TEST_DURATION_JSON=";
    expect(messages.every((message) => message.startsWith(prefix))).toBe(true);
    expect(
      messages.map((message) => JSON.parse(message.slice(prefix.length))),
    ).toEqual([
      {
        project: "chrome",
        testId: "test-id",
        titlePath: ["visual-chrome.ts", "button @visual"],
        retry: 0,
        status: "failed",
        duration: 120,
      },
      {
        project: "chrome",
        testId: "test-id",
        titlePath: ["visual-chrome.ts", "button @visual"],
        retry: 1,
        status: "passed",
        duration: 80,
      },
    ]);
    expect(messages.join("\n")).not.toContain("private-");
  } finally {
    log.mockRestore();
  }
});
