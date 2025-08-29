#!/usr/bin/env node --experimental-strip-types
import fs from "node:fs";
import path from "node:path";

export interface DiffFile {
  actual: string;
  base?: string;
  diff?: string;
}

export interface DiffSummary {
  byTest: Record<string, DiffFile[]>;
}

function isPng(file: string) {
  return file.endsWith(".png");
}

function findDiffTriples(dir: string): DiffFile[] {
  const files = fs
    .readdirSync(dir)
    .filter(isPng)
    // Ignore generic failure screenshots that are not snapshot outputs
    .filter((f) => !/^test-failed/i.test(f));
  const byStem = new Map<string, DiffFile>();

  const suffixes = ["expected", "actual", "diff"] as const;

  // Seed map with all stems we will track
  for (const file of files) {
    for (const suffix of suffixes) {
      if (!file.includes(suffix)) continue;
      const stem = file
        .replace(/\.(?:png)$/, "")
        .replace(new RegExp(`-${suffix}$`), "");
      if (!byStem.has(stem)) {
        byStem.set(stem, { actual: "" });
      }
      break;
    }
  }

  const processFileWithSuffix = (
    file: string,
    suffix: string,
    property: keyof DiffFile,
  ) => {
    if (!file.includes(suffix)) return false;
    const full = path.join(dir, file);
    const stem = file.replace(/\.(?:png)$/, "");
    const key = stem.replace(new RegExp(`-${suffix}$`), "");
    const item = byStem.get(key);
    if (!item) return false;
    (item as any)[property] = full;
    byStem.set(key, item);
    return true;
  };

  for (const file of files) {
    if (processFileWithSuffix(file, "expected", "base")) continue;
    if (processFileWithSuffix(file, "actual", "actual")) continue;
    if (processFileWithSuffix(file, "diff", "diff")) continue;
    // Skip other png files in the folder
  }

  return Array.from(byStem.values());
}

function collectSiteDiffs(root = process.cwd()): DiffSummary {
  const resultsDir = path.join(root, "site", "test-results");
  if (!fs.existsSync(resultsDir)) {
    return { byTest: {} };
  }
  const entries = fs
    .readdirSync(resultsDir)
    .filter((e) => fs.statSync(path.join(resultsDir, e)).isDirectory());

  // Group attempts by base suite (without -retryN suffix)
  const grouped = new Map<string, string[]>();
  for (const entry of entries) {
    const base = entry.replace(/-retry\d+$/i, "");
    const list = grouped.get(base) ?? [];
    list.push(entry);
    grouped.set(base, list);
  }

  const byTest: Record<string, DiffFile[]> = {};

  for (const [baseSuite, attempts] of grouped) {
    // Prefer the latest retry attempt
    attempts.sort((a, b) => {
      const ra = (a.match(/-retry(\d+)$/i) || ["", "-1"])[1];
      const rb = (b.match(/-retry(\d+)$/i) || ["", "-1"])[1];
      return Number(rb) - Number(ra);
    });
    let chosen: DiffFile[] | null = null;
    // First pass: pick an attempt with at least one changed (has diff)
    for (const attempt of attempts) {
      const dir = path.join(resultsDir, attempt);
      const triples = findDiffTriples(dir);
      if (!triples.length) continue;
      const hasChanged = triples.some((t) => !!t.diff);
      if (hasChanged) {
        chosen = triples;
        break;
      }
      // Keep as fallback if nothing has a diff
      if (!chosen) {
        chosen = triples;
      }
    }
    if (!chosen || !chosen.length) continue;
    // Fallback baseline: if -expected is missing in test-results, resolve from
    // repo snapshots
    const projectMatch = baseSuite.match(
      /-(chrome|firefox|safari|ios|android)$/i,
    );
    const project = projectMatch ? projectMatch[1] : "";
    for (const t of chosen) {
      if (t.base) continue;
      if (!project) continue;
      if (!t.actual) continue;
      const arg = path
        .basename(t.actual)
        .replace(/\.(?:png)$/i, "")
        .replace(/-actual$/i, "");
      const baseline = path.join(
        root,
        "site",
        "src",
        "tests",
        "screenshots",
        `${arg}-${project}.png`,
      );
      if (fs.existsSync(baseline)) {
        t.base = baseline;
      }
    }
    byTest[baseSuite] = chosen;
  }
  return { byTest };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const summary = collectSiteDiffs();
  process.stdout.write(JSON.stringify(summary));
}

export { collectSiteDiffs };
