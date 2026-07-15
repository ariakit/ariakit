/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import fs from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { invariant } from "@ariakit/utils";
import { isInDirectory, toFilePath, toPosixPath } from "./paths.ts";
import type { PathInput } from "./paths.ts";
import type { DiscoveredPreview } from "./preview-discovery.ts";
import type { Framework } from "./schemas.ts";

const INTEGRATION_NAME = "ariakit-previews";

interface PreviewCodegenParams {
  codegenDir: string;
  previews: DiscoveredPreview[];
}

interface PreviewCodegenResult {
  changed: boolean;
}

const previewCodegenDirs = new Map<string, string>();

export function setPreviewCodegenDir(root: PathInput, codegenDir: string) {
  previewCodegenDirs.set(toFilePath(root), codegenDir);
}

export function getPreviewCodegenDir(root: PathInput) {
  const rootPath = toFilePath(root);
  return (
    previewCodegenDirs.get(rootPath) ??
    join(rootPath, ".astro", "integrations", INTEGRATION_NAME)
  );
}

export function getRelativeImportPath(fromFile: string, toFile: string) {
  let path = toPosixPath(relative(dirname(fromFile), toFile));
  if (!path.startsWith(".")) {
    path = `./${path}`;
  }
  return path;
}

function getPascalCase(value: string) {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function getFrameworkVariable(framework: Framework) {
  return getPascalCase(framework) || "Preview";
}

export function getPreviewFile(previewsDir: string, id: string) {
  const segments = id.split("/");
  for (const segment of segments) {
    invariant(segment, `Invalid preview id: ${id}`);
    invariant(segment !== "." && segment !== "..", `Invalid preview id: ${id}`);
  }
  return join(previewsDir, ...segments, "preview.astro");
}

export function getPreviewContentFile(previewsDir: string, id: string) {
  return join(dirname(getPreviewFile(previewsDir, id)), "preview.mdx");
}

async function writeFileIfChanged(file: string, content: string) {
  try {
    const current = await fs.readFile(file, "utf8");
    if (current === content) return false;
  } catch {}
  await fs.mkdir(dirname(file), { recursive: true });
  await fs.writeFile(file, content);
  return true;
}

async function removeFileIfExists(file: string) {
  try {
    await fs.rm(file);
    return true;
  } catch (error) {
    const code = error instanceof Error && "code" in error && error.code;
    if (code === "ENOENT") return false;
    throw error;
  }
}

function generatePreviewWrapper(preview: DiscoveredPreview, file: string) {
  const frameworks = preview.frameworks.filter((framework) => {
    return !!preview.entryFiles[framework];
  });
  const componentImports: string[] = [];
  const sourceImports: string[] = [];
  const sourceEntries: string[] = [];
  const componentEntries: string[] = [];
  for (const framework of frameworks) {
    const entryFile = preview.entryFiles[framework];
    invariant(entryFile, `Missing ${framework} entry file for ${preview.id}`);
    const variable = getFrameworkVariable(framework);
    const importPath = getRelativeImportPath(file, entryFile);
    componentImports.push(
      `import ${variable}Example from ${JSON.stringify(importPath)};`,
    );
    sourceImports.push(
      `import source${variable} from ${JSON.stringify(`${importPath}?source`)};`,
    );
    sourceEntries.push(`  ${JSON.stringify(framework)}: source${variable},`);
    componentEntries.push(
      `  <${variable}Example client:load slot=${JSON.stringify(framework)} />`,
    );
  }
  return `---\nimport PreviewFramework from "#app/components/preview-framework.astro";\n${componentImports.join("\n")}\n\n${sourceImports.join("\n")}\n\nexport const source = {\n${sourceEntries.join("\n")}\n};\n---\n\n<PreviewFramework>\n${componentEntries.join("\n")}\n</PreviewFramework>\n`;
}

function generatePreviewContent() {
  return `import Preview from "./preview.astro";\n\n<Preview />\n`;
}

async function getGeneratedPreviewFiles(dir: string) {
  const files: string[] = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getGeneratedPreviewFiles(file)));
      continue;
    }
    if (
      entry.isFile() &&
      (entry.name === "preview.astro" || entry.name === "preview.mdx")
    ) {
      files.push(file);
    }
  }
  return files;
}

async function removeFileAndEmptyParents(file: string, root: string) {
  await fs.rm(file, { force: true });
  let dir = dirname(file);
  while (dir !== root && isInDirectory(dir, root)) {
    let entries: string[];
    try {
      entries = await fs.readdir(dir);
    } catch {
      return;
    }
    if (entries.length > 0) break;
    try {
      await fs.rmdir(dir);
    } catch {
      return;
    }
    dir = dirname(dir);
  }
}

export async function writePreviewCodegen({
  codegenDir,
  previews,
}: PreviewCodegenParams): Promise<PreviewCodegenResult> {
  const previewsDir = join(codegenDir, "previews");
  const generatedFiles = new Set<string>();
  let changed = false;
  for (const preview of previews) {
    if (Object.keys(preview.entryFiles).length === 0) continue;
    const file = getPreviewFile(previewsDir, preview.id);
    const contentFile = getPreviewContentFile(previewsDir, preview.id);
    generatedFiles.add(file);
    generatedFiles.add(contentFile);
    changed =
      (await writeFileIfChanged(file, generatePreviewWrapper(preview, file))) ||
      changed;
    changed =
      (await writeFileIfChanged(contentFile, generatePreviewContent())) ||
      changed;
  }
  for (const file of await getGeneratedPreviewFiles(previewsDir)) {
    if (generatedFiles.has(file)) continue;
    await removeFileAndEmptyParents(file, previewsDir);
    changed = true;
  }
  changed =
    (await removeFileIfExists(join(codegenDir, "registry.ts"))) || changed;
  return { changed };
}
