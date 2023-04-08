import type { AnchorHTMLAttributes } from "react";
import { readFileSync } from "fs";
import { dirname, relative, resolve } from "path";
import { cx } from "@ariakit/core/utils/misc";
import { getCSSFilesFromDeps } from "build-pages/get-css-files-from-deps.js";
import { getExampleDeps } from "build-pages/get-example-deps.js";
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

  let css = "";

  for (const file of cssFiles) {
    const key = getPathFromExample(file, path);
    contents[key] = await parseCSSFile(file, { tailwindConfig, format: true });
    css += await parseCSSFile(file, { id, tailwindConfig });
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
        preview={<Preview id={id} path={path} css={css} />}
      />
    </div>
  );
}
