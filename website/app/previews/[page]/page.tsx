import { resolve } from "node:path";
import { notFound } from "next/navigation.js";
import { twJoin } from "tailwind-merge";
import pagesConfig from "@/build-pages/config.js";
import { getCSSFilesFromDeps } from "@/build-pages/get-css-files-from-deps.js";
import { getExampleDeps } from "@/build-pages/get-example-deps.js";
import { getPageEntryFilesCached } from "@/build-pages/get-page-entry-files.js";
import { getPageName } from "@/build-pages/get-page-name.js";
import { getPageSourceFiles } from "@/build-pages/get-page-source-files.js";
import pageIndex from "@/build-pages/index.ts";
import { parseCSSFile } from "@/build-pages/parse-css-file.js";
import type { Page } from "@/build-pages/types.ts";
import { Preview, SolidPreview } from "@/components/preview.tsx";
import { getNextPageMetadata } from "@/lib/get-next-page-metadata.ts";

interface Props {
  params: ReturnType<typeof generateStaticParams>[number];
}

export function generateStaticParams() {
  const config = pagesConfig.pages.find((page) => page.slug === "examples");
  if (!config) return notFound();
  const params = getPageNames(config).map((page) => ({ page }));
  return params;
}

const tailwindConfig = resolve(process.cwd(), "../tailwind.config.cjs");

function getPageNames(page: Page) {
  return getPageEntryFilesCached(page)
    .filter((path) => !path.startsWith(process.cwd()))
    .map(getPageName);
}

async function parseStyles(cssFiles: string[]) {
  const styles = await Promise.all(
    cssFiles.map((file) => parseCSSFile(file, { tailwindConfig })),
  );
  return styles.join("\n");
}

export async function generateMetadata({ params }: Props) {
  const { page } = params;
  const data = pageIndex.examples?.find((item) => item.slug === page);

  return getNextPageMetadata({
    title: `Preview ${data?.title ?? page} - Ariakit`,
    description: data?.content,
    index: false,
  });
}

export default async function PreviewPage({ params }: Props) {
  const { page } = params;

  const config = pagesConfig.pages.find((page) => page.slug === "examples");
  if (!config) return notFound();

  const entryFiles = getPageEntryFilesCached(config);
  const file = entryFiles.find((file) => getPageName(file) === page);
  if (!file) return notFound();

  const [source] = getPageSourceFiles(file);
  if (!source) return notFound();

  const deps = getExampleDeps(source);
  const styles = getCSSFilesFromDeps(deps);
  const css = await parseStyles(styles);

  const PreviewComponent = page.endsWith("__solid") ? SolidPreview : Preview;

  return (
    <div
      data-preview-render-target
      className={twJoin(
        "flex min-h-[200vh] w-full flex-col items-center pt-[min(30vh,400px)]",
        /-radix/.test(page)
          ? "bg-gradient-to-br from-blue-600 to-purple-600"
          : "bg-gray-150 dark:bg-gray-850",
      )}
    >
      <PreviewComponent path={source} css={css} />
    </div>
  );
}
