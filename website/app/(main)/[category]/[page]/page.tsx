import { isValidElement } from "react";
import { dirname, resolve } from "path";
import { notFound } from "next/navigation.js";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import pagesConfig from "website/build-pages/config.mjs";
import { getExampleDeps } from "website/build-pages/get-example-deps.mjs";
import { getPageContent } from "website/build-pages/get-page-content.mjs";
import { getPageEntryFiles } from "website/build-pages/get-page-entry-files.mjs";
import { getPageName } from "website/build-pages/get-page-name.mjs";
import pagesIndex from "website/build-pages/index.js";
import { parseCSSFile } from "website/build-pages/parse-css-file.mjs";
import PageExample from "website/components/page-example.js";
import { getNextPageMetadata } from "website/utils/get-next-page-metadata.js";

const { pages } = pagesConfig;

const tailwindConfig = resolve(process.cwd(), "../tailwind.config.js");

function getPageNames(dir: string) {
  return getPageEntryFiles(dir).map(getPageName);
}

export function generateStaticParams() {
  const params = pages.flatMap((page) => {
    const pages = getPageNames(page.sourceContext);
    const category = page.slug;
    return pages.map((page) => ({ category, page }));
  });
  return params;
}

interface PageProps {
  params: ReturnType<typeof generateStaticParams>[number];
}

export async function generateMetadata({ params }: PageProps) {
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
  const { category, page } = params;

  const config = pages.find((page) => page.slug === category);
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
        // @ts-expect-error RSC
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
          const id = `page-${getPageName(filename)}`;
          const css = await Promise.all(
            styles.map((style) => parseCSSFile(style, { id, tailwindConfig }))
          );
          const cssContent = css.join("\n");

          return <PageExample id={id} path={filename} css={cssContent} />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
