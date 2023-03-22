import { resolve } from "path";
import { notFound } from "next/navigation.js";
import pagesConfig from "website/build-pages/config.mjs";
import { getExampleDeps } from "website/build-pages/get-example-deps.mjs";
import { getPageEntryFiles } from "website/build-pages/get-page-entry-files.mjs";
import { getPageName } from "website/build-pages/get-page-name.mjs";
import { getPageSourceFiles } from "website/build-pages/get-page-source-files.mjs";
import pagesIndex from "website/build-pages/index.js";
import { parseCSSFile } from "website/build-pages/parse-css-file.mjs";
import PageExample from "website/components/page-example.jsx";
import { getNextPageMetadata } from "website/utils/get-next-page-metadata.js";

const tailwindConfig = resolve(process.cwd(), "../tailwind.config.js");

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
    <div className="flex min-h-screen justify-center pt-[min(10vh,100px)]">
      <PageExample path={source} css={cssContent} />
    </div>
  );
}
