import type { Reporter, TestCase, TestResult } from "@playwright/test/reporter";

export default class VisualDurationReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    // Select fields so image attachments never reach the CI log.
    console.log(
      `VISUAL_TEST_DURATION_JSON=${JSON.stringify({
        project: test.parent.project()?.name ?? "",
        testId: test.id,
        titlePath: test.titlePath(),
        retry: result.retry,
        status: result.status,
        duration: result.duration,
      })}`,
    );
  }
}
