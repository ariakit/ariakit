import { readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import type { AnchorHTMLAttributes } from "react";
import pagesConfig from "@/build-pages/config.js";
import { getCSSFilesFromDeps } from "@/build-pages/get-css-files-from-deps.js";
import { getExampleDeps } from "@/build-pages/get-example-deps.js";
import { getPageEntryFilesCached } from "@/build-pages/get-page-entry-files.js";
import { getPageName } from "@/build-pages/get-page-name.js";
import { parseCSSFile } from "@/build-pages/parse-css-file.js";
import { Playground } from "@/components/playground.tsx";
import { Preview, SolidPreview } from "@/components/preview.tsx";
import { defer } from "@/lib/defer.ts";
import { getExampleId } from "@/lib/get-example-id.js";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  pageFilename: string;
  href: string;
  type?: "code" | "compact" | "wide";
  hovercards?: Set<Promise<string | Iterable<string>>>;
  abstracted?: boolean;
  plus?: boolean;
}

const tailwindConfig = resolve(process.cwd(), "../tailwind.config.cjs");

const examples = pagesConfig.pages.find((page) => page.slug === "examples");
const exampleFiles = examples?.sourceContext
  ? getPageEntryFilesCached(examples)
  : [];

function getPreviewLink(path: string) {
  const pageName = getPageName(path);
  if (!exampleFiles.some((file) => getPageName(file) === pageName)) return;
  return `/previews/${pageName}`;
}

function getPathFromExample(path: string, examplePath: string) {
  return relative(dirname(examplePath), path);
}

function getGithubLink(path: string) {
  return new URL(
    relative(resolve(process.cwd(), ".."), path),
    "https://github.com/ariakit/ariakit/blob/main/",
  ).href;
}

function stripLoader(filename: string) {
  return filename
    .replaceAll(/\.(react|solid)\.tsx/g, ".tsx")
    .replaceAll(/\.(react|solid)\.ts/g, ".ts");
}

export async function PageExample({
  pageFilename,
  href,
  type = "wide",
  hovercards,
  abstracted,
  plus,
}: Props) {
  const deferred = defer<Iterable<string>>();
  hovercards?.add(deferred);

  const path = resolve(dirname(pageFilename), href);
  const isSolid = path.endsWith(".solid.tsx");
  const previewLink = getPreviewLink(path);
  const id = getExampleId(path);
  const { dependencies, devDependencies, ...files } = getExampleDeps(path);
  const cssFiles = getCSSFilesFromDeps(files);
  const contents: Record<string, string> = {};

  const filesKeys = Object.keys(files);

  for (const file of filesKeys) {
    const relativePath = stripLoader(getPathFromExample(file, path));
    contents[relativePath] = stripLoader(readFileSync(file, "utf8"));
  }

  let css = "";
  const finalContents = { ...contents };

  for (const file of cssFiles) {
    const key = getPathFromExample(file, path);
    finalContents[key] = await parseCSSFile(file, {
      format: true,
      contents,
      tailwindConfig,
    });
    css += await parseCSSFile(file, { id, tailwindConfig, contents });
  }

  const isAppDir = pageFilename.startsWith(process.cwd());
  const showPreview = type !== "code" && !isAppDir;

  const PreviewComponent = isSolid ? SolidPreview : Preview;

  return (
    <Playground
      id={id}
      type={type}
      files={finalContents}
      dependencies={dependencies}
      devDependencies={devDependencies}
      githubLink={getGithubLink(path)}
      previewLink={previewLink}
      preview={
        showPreview ? <PreviewComponent id={id} path={path} css={css} /> : null
      }
      onRender={deferred.resolve}
      abstracted={abstracted}
      plus={plus}
    />
  );
}
