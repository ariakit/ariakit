import { isValidElement } from "react";
import { basename, dirname, resolve } from "path";
import { notFound } from "next/navigation.js";
import pagesConfig from "packages/website/pages.config.js";
import pagesIndex from "packages/website/pages.index.js";
import { getNextPageMetadata } from "packages/website/utils/get-next-page-metadata.js";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { getExampleDeps } from "scripts/pages/get-example-deps.mjs";
import { getPageContent } from "scripts/pages/get-page-content.mjs";
import { getPageEntryFiles } from "scripts/pages/get-page-entry-files.mjs";
import { getPageName } from "scripts/pages/get-page-name.mjs";
import { parseCSSFile } from "scripts/pages/parse-css-file.mjs";
import Comp from "./comp.jsx";

const { pages } = pagesConfig;

export const dynamicParams = false;

function getPageNames(dir: string) {
  return getPageEntryFiles(dir).map(getPageName);
}

export function generateStaticParams() {
  console.log("generateStaticParams");
  const params = pages.flatMap((page) => {
    const pages = getPageNames(page.sourceContext);
    const category = basename(page.sourceContext);
    return pages.map((page) => ({ category, page }));
  });
  return params;
}

interface PageProps {
  params: ReturnType<typeof generateStaticParams>[number];
}

export async function generateMetadata({ params }: PageProps) {
  console.log("generateMetadata");
  const { category, page } = params;
  const data = pagesIndex[category]?.find((item) => item.slug === page);

  if (!data) {
    // Pages without a readme.md file
    return getNextPageMetadata({
      title: `${page} - Ariakit`,
      index: false,
    });
  }

  return getNextPageMetadata({
    title: `${data.title} - Ariakit`,
    description: data.content,
  });
}

export default async function Page({ params }: PageProps) {
  console.log("Page");
  const { category, page } = params;

  const config = pages.find((page) => page.sourceContext.endsWith(category));
  if (!config) return notFound();

  const { sourceContext } = config;

  const entryFiles = getPageEntryFiles(sourceContext);
  const file = entryFiles.find((file) => getPageName(file) === page);

  if (!file) return notFound();

  const content = getPageContent(file);

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ node, level, ...props }) => <h1 {...props} />,
        p: async ({ node, ...props }) => {
          const paragraph = <p {...props} />;
          const child = props.children[0];
          if (!child) return paragraph;
          if (!isValidElement(child)) return paragraph;
          if (!child.props) return paragraph;
          if (!("data-playground" in child.props)) return paragraph;
          if (!child.props.href) return paragraph;
          const filename = resolve(dirname(file), child.props.href);
          const deps = getExampleDeps(filename);
          const styles = Object.values(deps)
            .flatMap((deps) =>
              Object.values(deps).filter((dep) => dep.endsWith(".css"))
            )
            .filter(Boolean);
          const css = await Promise.all(
            styles.map((style) =>
              // TODO: No need for everything here (prettify etc.)
              parseCSSFile(style, {
                pageClassName: `page-${getPageName(filename)}`,
                tailwindConfig: resolve(
                  process.cwd(),
                  "../../tailwind.config.js"
                ),
              })
            )
          );
          const cssContent = css.join("\n");

          return (
            <>
              <style dangerouslySetInnerHTML={{ __html: cssContent }} />
              <Comp page={filename} />
            </>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
