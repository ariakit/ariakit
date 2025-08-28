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
    const key = stem;
    const item = byStem.get(key) ?? {};
    item.actual = full;
    byStem.set(key, item);
  }
  const results: DiffFile[] = [];
  for (const [, v] of byStem) {
    if (v.actual && v.diff)
      results.push({ ...(v as DiffFile), kind: "changed" });
    else if (
      v.actual &&
      !v.diff &&
      /-actual$/i.test((v.actual || "").replace(/\.(?:png)$/i, ""))
    )
      results.push({ ...(v as DiffFile), kind: "new" });
  }
  return results;
}

function collectSiteDiffs(root = process.cwd()) {
  const resultsDir = path.join(root, "site", "test-results");
  if (!fs.existsSync(resultsDir)) return { byTest: {} } as DiffSummary;
  const byTest: Record<string, DiffFile[]> = {};
  for (const entry of fs.readdirSync(resultsDir)) {
    // Skip retry attempt folders; we only show the primary attempt
    if (/-retry\d+$/i.test(entry)) continue;
    const dir = path.join(resultsDir, entry);
    if (!fs.statSync(dir).isDirectory()) continue;
    const triples = findDiffTriples(dir);
    if (!triples.length) continue;
    byTest[entry] = triples;
  }
  return { byTest } as DiffSummary;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const summary = collectSiteDiffs();
  process.stdout.write(JSON.stringify(summary));
}

export { collectSiteDiffs };
