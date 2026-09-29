import type { Reporter, TestCase, TestResult } from "@playwright/test/reporter";

interface TimedTest {
  id: TestCase["id"];
  titlePath(): string[];
  parent: { project(): { name: string } | undefined };
}

type TimedResult = Pick<TestResult, "retry" | "status" | "duration">;

export default class VisualDurationReporter implements Reporter {
  private readonly results: Array<{
    project: string;
    testId: string;
    titlePath: string[];
    retry: number;
    status: TestResult["status"];
    duration: number;
  }> = [];

  onTestEnd(test: TimedTest, result: TimedResult) {
    // Copy only timing fields; capture attachments contain plaintext PNG bytes.
    this.results.push({
      project: test.parent.project()?.name ?? "",
      testId: test.id,
      titlePath: test.titlePath(),
      retry: result.retry,
      status: result.status,
      duration: result.duration,
    });
  }

  onEnd() {
    for (const result of this.results) {
      console.log(`VISUAL_TEST_DURATION_JSON=${JSON.stringify(result)}`);
    }
  }
}
