import path from "node:path";
import type { Reporter, TestCase, TestResult } from "@playwright/test/reporter";

export default class DurationReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    // Select fields so image attachments never reach the CI log.
    console.log(
      `TEST_DURATION_JSON=${JSON.stringify({
        project: test.parent.project()?.name ?? "",
        file: path.relative(process.cwd(), test.location.file),
        testId: test.id,
        titlePath: test.titlePath(),
        retry: result.retry,
        status: result.status,
        duration: result.duration,
      })}`,
    );
  }
}
