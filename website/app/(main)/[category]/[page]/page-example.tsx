import type { AnchorHTMLAttributes } from "react";
import { Suspense } from "react";
import { dirname, relative, resolve } from "path";
import { cx } from "@ariakit/core/utils/misc";
import { getCSSFilesFromDeps } from "website/build-pages/get-css-files-from-deps.js";
import { getExampleDeps } from "website/build-pages/get-example-deps.js";
import { parseCSSFile } from "website/build-pages/parse-css-file.js";
import Preview from "website/components/preview.js";
import tw from "website/utils/tw.js";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  pageFilename: string;
  href: string;
  type?: "medium" | "large";
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
  type = "large",
}: Props) {
  const path = resolve(dirname(pageFilename), href);
  const deps = getExampleDeps(path);
  const styles = getCSSFilesFromDeps(deps);
  const id = getExampleId(path);
  const css = await parseStyles(styles, id);
  return (
    <div className={cx(type === "large" && "!max-w-4xl")}>
      <div className="flex items-center justify-center">
        <div
          className={cx(
            type === "large"
              ? "min-h-[300px] sm:rounded-2xl md:p-8"
              : "sm:rounded-xl md:p-6",
            tw`relative flex w-full items-center justify-center rounded-lg
            bg-gray-150 p-4 dark:bg-gray-850 `
          )}
        >
          <Suspense>
            <Preview id={id} path={path} css={css} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
