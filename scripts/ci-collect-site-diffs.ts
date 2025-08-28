#!/usr/bin/env node --experimental-strip-types
import fs from "node:fs";
import path from "node:path";

interface DiffFile {
  base?: string;
  actual: string;
  diff?: string;
  kind: "changed" | "new";
}

interface DiffSummary {
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
  const byStem = new Map<string, Partial<DiffFile>>();
  for (const file of files) {
    const full = path.join(dir, file);
    const stem = file.replace(/\.(?:png)$/, "");
    if (file.includes("-expected")) {
      const key = stem.replace(/-expected$/, "");
      const item = byStem.get(key) ?? {};
      item.base = full;
      byStem.set(key, item);
      continue;
    }
    if (file.includes("-diff")) {
      const key = stem.replace(/-diff$/, "");
      const item = byStem.get(key) ?? {};
      item.diff = full;
      byStem.set(key, item);
      continue;
    }
    if (file.includes("-actual")) {
      const key = stem.replace(/-actual$/, "");
      const item = byStem.get(key) ?? {};
      item.actual = full;
      byStem.set(key, item);
    }
    // Skip other png files in the folder
  }
  const results: DiffFile[] = [];
  for (const [, v] of byStem) {
    if (v.actual && v.diff)
      results.push({ ...(v as DiffFile), kind: "changed" });
    else if (v.actual && !v.diff)
      results.push({ ...(v as DiffFile), kind: "new" });
  }
  return results;
}

function collectSiteDiffs(root = process.cwd()) {
  const resultsDir = path.join(root, "site", "test-results");
  if (!fs.existsSync(resultsDir)) return { byTest: {} } as DiffSummary;
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
      if (!chosen) chosen = triples;
    }
    if (!chosen || !chosen.length) continue;
    // Fallback baseline: if -expected is missing in test-results, resolve from repo snapshots
    const projectMatch = baseSuite.match(
      /-(chrome|firefox|safari|ios|android)$/i,
    );
    const project = projectMatch ? projectMatch[1] : "";
    for (const t of chosen) {
      if (!t.base && t.actual && project) {
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
        if (fs.existsSync(baseline)) t.base = baseline;
      }
    }
    byTest[baseSuite] = chosen;
  }
  return { byTest } as DiffSummary;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const summary = collectSiteDiffs();
  process.stdout.write(JSON.stringify(summary));
}

export { collectSiteDiffs };
