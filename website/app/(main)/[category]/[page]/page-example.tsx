import type { AnchorHTMLAttributes } from "react";
import { Suspense } from "react";
import { readFileSync } from "fs";
import { dirname, relative, resolve } from "path";
import { cx } from "@ariakit/core/utils/misc";
import { getCSSFilesFromDeps } from "website/build-pages/get-css-files-from-deps.js";
import { getExampleDeps } from "website/build-pages/get-example-deps.js";
import { parseCSSFile } from "website/build-pages/parse-css-file.js";
import { CodeBlock } from "website/components/code-block.js";
import Preview from "website/components/preview.js";
import tw from "website/utils/tw.js";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  pageFilename: string;
  href: string;
  type?: "side" | "compact" | "wide";
}

const tailwindConfig = resolve(process.cwd(), "../tailwind.config.cjs");

async function parseStyles(cssFiles: string[], id?: string) {
  const styles = await Promise.all(
    cssFiles.map((file) => parseCSSFile(file, { id, tailwindConfig }))
  );
  return styles.join("\n");
}

function getExampleId(path: string) {
  const pathFromRoot = relative(resolve(process.cwd(), ".."), path);
  const id = pathFromRoot.replace(/[/\\\.]/g, "-");
  return id;
}

export default async function PageExample({
  pageFilename,
  href,
  type = "wide",
}: Props) {
  const path = resolve(dirname(pageFilename), href);
  const deps = getExampleDeps(path);
  const styles = getCSSFilesFromDeps(deps);
  const id = getExampleId(path);
  const css = await parseStyles(styles, id);
  const { dependencies, ...files } = deps;
  const contents = Object.keys(files).reduce((acc, file) => {
    acc[file] = readFileSync(file, "utf8");
    return acc;
  }, {} as Record<string, string>);
  return (
    <div className={cx((type === "wide" || type === "side") && "!max-w-4xl")}>
      <div
        className={cx(
          "flex flex-col items-center justify-center gap-4 sm:gap-6"
        )}
      >
        <div
          className={cx(
            id,
            type === "wide"
              ? "min-h-[320px] sm:rounded-2xl md:p-8"
              : "sm:rounded-xl md:p-6",
            tw`relative flex w-full items-center justify-center rounded-lg
            bg-gray-150 p-4 dark:bg-gray-850 `
          )}
        >
          <Suspense>
            <Preview id={id} path={path} css={css} />
          </Suspense>
        </div>
        <div
          className={tw`w-full max-w-3xl rounded-lg border-gray-650
          dark:border sm:rounded-xl`}
        >
          <div
            className={tw`relative z-20 h-12 rounded-t-[inherit]
            bg-gray-700 shadow-dark`}
          ></div>
          {/* @ts-expect-error RSC */}
          <CodeBlock
            type="editor"
            filename={path}
            code={contents[path]!}
            className="max-h-80 rounded-b-[inherit]"
          />
        </div>
      </div>
    </div>
  );
}
