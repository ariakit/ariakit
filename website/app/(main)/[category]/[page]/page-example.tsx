import type { AnchorHTMLAttributes } from "react";
import { readFileSync } from "fs";
import { dirname, relative, resolve } from "path";
import { cx } from "@ariakit/core/utils/misc";
import pagesConfig from "build-pages/config.js";
import { getCSSFilesFromDeps } from "build-pages/get-css-files-from-deps.js";
import { getExampleDeps } from "build-pages/get-example-deps.js";
import { getPageEntryFiles } from "build-pages/get-page-entry-files.js";
import { getPageName } from "build-pages/get-page-name.js";
import { parseCSSFile } from "build-pages/parse-css-file.js";
import { Playground } from "components/playground.js";
import { Preview } from "components/preview.js";
import { getExampleId } from "utils/get-example-id.js";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  pageFilename: string;
  href: string;
  type?: "compact" | "wide";
}

const tailwindConfig = resolve(process.cwd(), "../tailwind.config.cjs");

const examples = pagesConfig.pages.find((page) => page.slug === "examples");
const exampleFiles = examples?.sourceContext
  ? getPageEntryFiles(examples.sourceContext)
  : [];

function getPreviewLink(path: string) {
  const pageName = getPageName(path);
  if (!exampleFiles.some((file) => getPageName(file) === pageName)) return;
  return `/previews/${pageName}`;
}

function getPathFromExample(path: string, examplePath: string) {
  return relative(dirname(examplePath), path);
}

export async function PageExample({
  pageFilename,
  href,
  type = "wide",
}: Props) {
  const path = resolve(dirname(pageFilename), href);
  const previewLink = getPreviewLink(path);
  const id = getExampleId(path);
  const { dependencies, devDependencies, ...files } = getExampleDeps(path);
  const cssFiles = getCSSFilesFromDeps(files);
  const contents: Record<string, string> = {};

  const filesKeys = Object.keys(files);

  for (const file of filesKeys) {
    const relativePath = getPathFromExample(file, path);
    contents[relativePath] = readFileSync(file, "utf8");
  }

  let css = "";

  for (const file of cssFiles) {
    const key = getPathFromExample(file, path);
    contents[key] = await parseCSSFile(file, {
      format: true,
      contents,
      tailwindConfig,
    });
    css += await parseCSSFile(file, { id, tailwindConfig, contents });
  }

  return (
    <div
      className={cx(
        type === "wide" && "!max-w-5xl",
        type === "compact" && "!max-w-[832px]"
      )}
    >
      <Playground
        id={id}
        type={type}
        files={contents}
        dependencies={dependencies}
        devDependencies={devDependencies}
        previewLink={previewLink}
        preview={<Preview id={id} path={path} css={css} />}
      />
    </div>
  );
}
