import { resolve } from "path";
import { notFound } from "next/navigation.js";
import pagesConfig from "website/build-pages/config.js";
import { getExampleDeps } from "website/build-pages/get-example-deps.js";
import { getPageEntryFiles } from "website/build-pages/get-page-entry-files.js";
import { getPageName } from "website/build-pages/get-page-name.js";
import { getPageSourceFiles } from "website/build-pages/get-page-source-files.js";
import pagesIndex from "website/build-pages/index.js";
import { parseCSSFile } from "website/build-pages/parse-css-file.js";
import PageExample from "website/components/page-example.js";
import { getNextPageMetadata } from "website/utils/get-next-page-metadata.js";
import tw from "website/utils/tw.js";

const tailwindConfig = resolve(process.cwd(), "../tailwind.config.cjs");

function getPageNames(dir: string) {
  return getPageEntryFiles(dir).map(getPageName);
}

export function generateStaticParams() {
  const config = pagesConfig.pages.find((page) => page.slug === "examples");
  if (!config) return notFound();
  const params = getPageNames(config.sourceContext).map((page) => ({ page }));
  return params;
}

interface PageProps {
  params: ReturnType<typeof generateStaticParams>[number];
}

export async function generateMetadata({ params }: PageProps) {
  const { page } = params;
  const data = pagesIndex.examples?.find((item) => item.slug === page);

  return getNextPageMetadata({
    title: `Preview ${data?.title ?? page} - Ariakit`,
    description: data?.content,
    index: false,
  });
}

export default async function Page({ params }: PageProps) {
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

  const styles = Object.values(deps)
    .flatMap((deps) =>
      Object.values(deps).filter((dep) => dep.endsWith(".css"))
    )
    .filter(Boolean);
  const css = await Promise.all(
    styles.map((style) => parseCSSFile(style, { tailwindConfig }))
  );
  const cssContent = css.join("\n");

  return (
    <div
      className={tw`flex min-h-[200vh] w-full justify-center bg-gray-150
      pt-[min(30vh,400px)] dark:bg-gray-850`}
    >
      <PageExample path={source} css={cssContent} />
    </div>
  );
}
