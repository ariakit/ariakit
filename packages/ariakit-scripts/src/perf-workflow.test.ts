import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("splits Node performance benchmarks into two shards", () => {
  const workflow = readFileSync(".github/workflows/perf.yml", "utf8");
  const nodeMarker = "\n  node:\n";
  const postMarker = "\n  post:\n";
  const nodeStart = workflow.indexOf(nodeMarker);
  const postStart = workflow.indexOf(postMarker, nodeStart);

  expect(nodeStart).toBeGreaterThan(-1);
  expect(postStart).toBeGreaterThan(nodeStart);

  const nodeJob = workflow.slice(nodeStart, postStart);
  expect(nodeJob).toContain("fail-fast: false");
  expect(nodeJob).toContain("shard: [1, 2]");
  expect(nodeJob).toContain(
    "PERF_SHARD: ${{ matrix.shard }}/${{ strategy.job-total }}",
  );
  expect(nodeJob).toContain(`if [ -n "$benchmark_file" ]; then
              baseline_args=("$benchmark_file" --testNamePattern "$baseline_pattern")
              current_args=("$benchmark_file" --testNamePattern "$current_pattern")
            else
              baseline_args=(--shard="$PERF_SHARD")
              current_args=(--shard="$PERF_SHARD")
            fi`);
  expect(nodeJob).toContain("name: perf-results-node-${{ matrix.shard }}");

  const postJob = workflow.slice(postStart);
  const nodeDownloadStart = postJob.indexOf(
    "      - name: Download Node performance results\n",
  );
  const chromeDownloadStart = postJob.indexOf(
    "      - name: Download Chrome round results\n",
    nodeDownloadStart,
  );
  expect(nodeDownloadStart).toBeGreaterThan(-1);
  expect(chromeDownloadStart).toBeGreaterThan(nodeDownloadStart);

  const nodeDownload = postJob.slice(nodeDownloadStart, chromeDownloadStart);
  expect(nodeDownload).toContain("pattern: perf-results-node-*");
  expect(nodeDownload).not.toContain("merge-multiple:");
  expect(nodeDownload).toContain("if [ ${#node_comparisons[@]} -eq 2 ]; then");
  expect(nodeDownload).toContain('rm -rf "${node_dirs[@]}"');
});
