import { resolve } from "path";
import { notFound } from "next/navigation.js";
import pagesConfig from "website/build-pages/config.js";
import { getCSSFilesFromDeps } from "website/build-pages/get-css-files-from-deps.js";
import { getExampleDeps } from "website/build-pages/get-example-deps.js";
import { getPageEntryFiles } from "website/build-pages/get-page-entry-files.js";
import { getPageName } from "website/build-pages/get-page-name.js";
import { getPageSourceFiles } from "website/build-pages/get-page-source-files.js";
import pagesIndex from "website/build-pages/index.js";
import { parseCSSFile } from "website/build-pages/parse-css-file.js";
import { Preview } from "website/components/preview.js";
import { getNextPageMetadata } from "website/utils/get-next-page-metadata.js";
import { tw } from "website/utils/tw.js";

interface Props {
  params: ReturnType<typeof generateStaticParams>[number];
}

export function generateStaticParams() {
  const config = pagesConfig.pages.find((page) => page.slug === "examples");
  if (!config) return notFound();
  const params = getPageNames(config.sourceContext).map((page) => ({ page }));
  return params;
}

const tailwindConfig = resolve(process.cwd(), "../tailwind.config.cjs");

function getPageNames(dir: string) {
  return getPageEntryFiles(dir).map(getPageName);
}

async function parseStyles(cssFiles: string[]) {
  const styles = await Promise.all(
    cssFiles.map((file) => parseCSSFile(file, { tailwindConfig }))
  );
  return styles.join("\n");
}

export async function generateMetadata({ params }: Props) {
  const { page } = params;
  const data = pagesIndex.examples?.find((item) => item.slug === page);

  return getNextPageMetadata({
    title: `Preview ${data?.title ?? page} - Ariakit`,
    description: data?.content,
    index: false,
  });
}

export default async function Page({ params }: Props) {
  const { page } = params;

  const config = pagesConfig.pages.find((page) => page.slug === "examples");
  if (!config) return notFound();

  const { sourceContext } = config;

  const entryFiles = getPageEntryFiles(sourceContext);
  const file = entryFiles.find((file) => getPageName(file) === page);
  if (!file) return notFound();

  const [source] = getPageSourceFiles(file);
  if (!source) return notFound();

  const deps = getExampleDeps(source);
  const styles = getCSSFilesFromDeps(deps);
  const css = await parseStyles(styles);

  return (
    <div
      className={tw`flex min-h-[200vh] w-full justify-center bg-gray-150
      pt-[min(30vh,400px)] dark:bg-gray-850`}
    >
      <Preview path={source} css={css} />
    </div>
  );
}
