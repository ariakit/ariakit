import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import type { PerfMetrics, PerfResult } from "./perf.ts";

const RESULTS_DIR = path.join(process.cwd(), ".perf-results");
const THRESHOLD_PERCENT = 10;

type MetricKey = keyof PerfMetrics;

interface ComparisonRow {
  label: string;
  metric: MetricKey;
  baseline: number;
  current: number;
  delta: number;
  percent: number;
  significant: boolean;
}

interface ComparisonSummary {
  rows: ComparisonRow[];
  hasSignificantChanges: boolean;
  newTests: PerfResult[];
  removedTests: string[];
}

// Primary metrics shown in the summary table.
const PRIMARY_METRICS: MetricKey[] = ["scripting", "rendering", "total"];

// All metrics shown in the detailed breakdown.
const ALL_METRICS: MetricKey[] = [
  "scripting",
  "rendering",
  "layout",
  "styleRecalc",
  "painting",
  "inp",
  "total",
];

const METRIC_LABELS: Record<MetricKey, string> = {
  scripting: "Scripting",
  layout: "Layout",
  styleRecalc: "Style recalc",
  painting: "Painting",
  rendering: "Rendering",
  inp: "INP",
  total: "Total",
};

// Rendering sub-metrics are indented in the detailed breakdown.
const RENDERING_SUB_METRICS = new Set<MetricKey>([
  "layout",
  "styleRecalc",
  "painting",
]);

function loadResults(prefix: string): PerfResult[] {
  if (!existsSync(RESULTS_DIR)) return [];
  const files = readdirSync(RESULTS_DIR).filter(
    (f) => f.startsWith(prefix) && f.endsWith(".json"),
  );
  const all: PerfResult[] = [];
  for (const file of files) {
    const data = JSON.parse(
      readFileSync(path.join(RESULTS_DIR, file), "utf-8"),
    );
    all.push(...data);
  }
  return all;
}

function formatMs(value: number): string {
  return `${value.toFixed(1)}ms`;
}

function formatDelta(delta: number, percent: number, baseline: number): string {
  const sign = delta >= 0 ? "+" : "";
  if (baseline === 0) {
    return `${sign}${formatMs(delta)}`;
  }
  return `${sign}${formatMs(delta)} (${sign}${percent.toFixed(0)}%)`;
}

function resultKey(result: PerfResult): string {
  return `${result.testFile}::${result.label}`;
}

function compare(): ComparisonSummary {
  const baseline = loadResults("baseline");
  const current = loadResults("current");

  const baselineByKey = new Map<string, PerfResult>();
  for (const result of baseline) {
    baselineByKey.set(resultKey(result), result);
  }

  const currentByKey = new Map<string, PerfResult>();
  for (const result of current) {
    currentByKey.set(resultKey(result), result);
  }

  const rows: ComparisonRow[] = [];
  const newTests: PerfResult[] = [];
  const removedTests: string[] = [];

  for (const cur of current) {
    const key = resultKey(cur);
    const base = baselineByKey.get(key);
    if (!base) {
      newTests.push(cur);
      continue;
    }
    for (const metric of ALL_METRICS) {
      const baseVal = base.metrics[metric];
      const curVal = cur.metrics[metric];
      const delta = curVal - baseVal;
      const percent = baseVal > 0 ? (delta / baseVal) * 100 : 0;
      rows.push({
        label: cur.label,
        metric,
        baseline: baseVal,
        current: curVal,
        delta,
        percent,
        significant: Math.abs(percent) > THRESHOLD_PERCENT,
      });
    }
  }

  for (const base of baseline) {
    if (!currentByKey.has(resultKey(base))) {
      removedTests.push(base.label);
    }
  }

  return {
    rows,
    hasSignificantChanges: rows.some((r) => r.significant),
    newTests,
    removedTests,
  };
}

function formatSummaryTable(rows: ComparisonRow[], labels: string[]): string[] {
  const lines: string[] = [];
  lines.push("| Test | Scripting | Rendering | Total |");
  lines.push("|------|-----------|-----------|-------|");

  for (const label of labels) {
    const testRows = rows.filter((r) => r.label === label);
    const cells: string[] = [label];
    for (const metric of PRIMARY_METRICS) {
      const row = testRows.find((r) => r.metric === metric);
      if (!row) {
        cells.push("--");
        continue;
      }
      let cell = `${formatMs(row.baseline)} \u2192 ${formatMs(row.current)}`;
      cell +=
        row.baseline === 0
          ? " (n/a)"
          : ` (${row.delta >= 0 ? "+" : ""}${row.percent.toFixed(0)}%)`;
      if (row.significant) {
        cell += row.delta > 0 ? " :warning:" : " :rocket:";
      }
      cells.push(cell);
    }
    lines.push(`| ${cells.join(" | ")} |`);
  }
  return lines;
}

function formatDetailedBreakdown(
  rows: ComparisonRow[],
  labels: string[],
): string[] {
  const lines: string[] = [];
  for (const label of labels) {
    const testRows = rows.filter((r) => r.label === label);
    lines.push(`### ${label}`);
    lines.push("");
    lines.push("| Metric | Baseline | Current | Delta |");
    lines.push("|--------|----------|---------|-------|");
    for (const metric of ALL_METRICS) {
      const row = testRows.find((r) => r.metric === metric);
      if (!row) continue;
      const prefix = RENDERING_SUB_METRICS.has(metric) ? "- " : "";
      const metricLabel = `${prefix}${METRIC_LABELS[metric]}`;
      const deltaStr = formatDelta(row.delta, row.percent, row.baseline);
      let icon = "";
      if (row.significant) {
        icon = row.delta > 0 ? " :warning:" : " :rocket:";
      }
      lines.push(
        `| ${metricLabel} | ${formatMs(row.baseline)} | ${formatMs(row.current)} | ${deltaStr}${icon} |`,
      );
    }
    lines.push("");
  }
  return lines;
}

function formatMarkdown(summary: ComparisonSummary): string {
  const { rows, hasSignificantChanges, newTests, removedTests } = summary;

  const allLabels = [...new Set(rows.map((r) => r.label))];
  const significantLabels = allLabels.filter((label) =>
    rows.some((r) => r.label === label && r.significant),
  );

  const lines: string[] = [];
  lines.push("## Performance");
  lines.push("");

  if (hasSignificantChanges) {
    lines.push(...formatSummaryTable(rows, significantLabels));
  } else {
    lines.push("No significant performance changes detected.");
  }

  lines.push("");
  lines.push(`<details>`);
  lines.push(`<summary>Full breakdown (${allLabels.length} tests)</summary>`);
  lines.push("");
  lines.push(...formatDetailedBreakdown(rows, allLabels));

  if (newTests.length > 0) {
    lines.push("### New tests (no baseline)");
    lines.push("");
    lines.push("| Test | Scripting | Rendering | Total |");
    lines.push("|------|-----------|-----------|-------|");
    for (const result of newTests) {
      const cells: string[] = [result.label];
      for (const metric of PRIMARY_METRICS) {
        cells.push(formatMs(result.metrics[metric]));
      }
      lines.push(`| ${cells.join(" | ")} |`);
    }
    lines.push("");
  }

  if (removedTests.length > 0) {
    lines.push("### Removed tests");
    lines.push("");
    for (const label of removedTests) {
      lines.push(`- ${label}`);
    }
    lines.push("");
  }

  lines.push("</details>");
  lines.push("");

  lines.push(
    `:warning: = regression above ${THRESHOLD_PERCENT}% · :rocket: = improvement above ${THRESHOLD_PERCENT}%`,
  );

  return lines.join("\n");
}

// Main
const summary = compare();
const markdown = formatMarkdown(summary);

mkdirSync(RESULTS_DIR, { recursive: true });
writeFileSync(
  path.join(RESULTS_DIR, "comparison.json"),
  JSON.stringify(summary, null, 2),
);
writeFileSync(path.join(RESULTS_DIR, "comparison.md"), markdown);

console.log(markdown);
