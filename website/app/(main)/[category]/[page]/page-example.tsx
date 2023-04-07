import type { AnchorHTMLAttributes } from "react";
import { Suspense } from "react";
import { readFileSync } from "fs";
import { dirname, relative, resolve } from "path";
import { cx } from "@ariakit/core/utils/misc";
import { kebabCase } from "lodash-es";
import { getCSSFilesFromDeps } from "website/build-pages/get-css-files-from-deps.js";
import { getExampleDeps } from "website/build-pages/get-example-deps.js";
import { parseCSSFile } from "website/build-pages/parse-css-file.js";
import { Editor } from "website/components/editor.js";
import { Preview } from "website/components/preview.js";
import { tw } from "website/utils/tw.js";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  pageFilename: string;
  href: string;
  type?: "compact" | "wide";
}

const tailwindConfig = resolve(process.cwd(), "../tailwind.config.cjs");

function getExampleId(path: string) {
  const pathFromRoot = relative(resolve(process.cwd(), ".."), dirname(path));
  return kebabCase(pathFromRoot);
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
  const id = getExampleId(path);
  const { dependencies, ...files } = getExampleDeps(path);
  const cssFiles = getCSSFilesFromDeps(files);
  const contents: Record<string, string> = {};

  const filesKeys = Object.keys(files);

  for (const file of filesKeys) {
    const relativePath = getPathFromExample(file, path);
    contents[relativePath] = readFileSync(file, "utf8");
  }

  let cssString = "";

  for (const file of cssFiles) {
    const key = getPathFromExample(file, path);
    contents[key] = await parseCSSFile(file, { tailwindConfig, format: true });
    cssString += await parseCSSFile(file, { id, tailwindConfig });
  }

  return (
    <div
      className={cx(
        type === "wide" && "!max-w-5xl",
        type === "compact" && "!max-w-[832px]"
      )}
    >
      <div className="flex flex-col items-center justify-center gap-4 md:gap-6">
        <div
          className={cx(
            id,
            type === "wide"
              ? "min-h-[320px] md:rounded-2xl md:p-8"
              : "md:rounded-xl md:p-6",
            tw`relative flex w-full items-center justify-center rounded-lg
            bg-gray-150 p-4 dark:bg-gray-850 `
          )}
        >
          <Suspense>
            <Preview id={id} path={path} css={cssString} />
          </Suspense>
        </div>
        {/* @ts-expect-error RSC */}
        <Editor files={contents} dependencies={dependencies} />
      </div>
    </div>
  );
}
