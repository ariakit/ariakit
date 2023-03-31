import { Suspense, isValidElement } from "react";
import { dirname, resolve } from "path";
import { cx } from "@ariakit/core/utils/misc";
import { notFound } from "next/navigation.js";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import pagesConfig from "website/build-pages/config.js";
import { getExampleDeps } from "website/build-pages/get-example-deps.js";
import { getPageContent } from "website/build-pages/get-page-content.js";
import { getPageEntryFiles } from "website/build-pages/get-page-entry-files.js";
import { getPageName } from "website/build-pages/get-page-name.js";
import { getPageTreeFromContent } from "website/build-pages/get-page-tree.js";
import pagesIndex from "website/build-pages/index.js";
import { parseCSSFile } from "website/build-pages/parse-css-file.js";
import type { TableOfContents as TableOfContentsData } from "website/build-pages/types.js";
import Link from "website/components/link.js";
import PageExample from "website/components/page-example.js";
import Hashtag from "website/icons/hashtag.js";
import NewWindow from "website/icons/new-window.js";
import { getNextPageMetadata } from "website/utils/get-next-page-metadata.js";
import tw from "website/utils/tw.js";
import TableOfContents from "./table-of-contents.js";

const { pages } = pagesConfig;

const tailwindConfig = resolve(process.cwd(), "../tailwind.config.cjs");

const style = {
  link: tw`
    rounded-sm focus-visible:no-underline focus-visible:ariakit-outline-input
    underline [text-decoration-skip-ink:none] hover:decoration-[3px]
    underline-offset-[0.125em]
    font-medium dark:font-normal
    text-blue-700 dark:text-blue-400
  `,
  h1: tw`
    scroll-mt-[120px]
    text-4xl sm:text-5xl font-extrabold dark:font-bold
    tracking-[-0.035em] dark:tracking-[-0.015em]
  `,
  h2: tw`
    mt-6 scroll-mt-24
    text-2xl sm:text-3xl font-semibold dark:font-medium
    text-black/70 dark:text-white/60
    tracking-[-0.035em] dark:tracking-[-0.015em]
  `,
  h3: tw`
    mt-2 scroll-mt-24
    text-xl font-semibold dark:font-medium
    text-black dark:text-white
    tracking-[-0.035em] dark:tracking-[-0.015em]
  `,
  paragraph: tw`
    dark:text-white/80 leading-7 tracking-[-0.02em] dark:tracking-[-0.01em]

    data-[description]:-translate-y-4 data-[description]:text-lg
    data-[description]:text-black/70 dark:data-[description]:text-white/60
    data-[description]:!tracking-tight

    [&_strong]:font-semibold dark:[&_strong]:text-white

    [&_code]:rounded [&_code]:p-1 [&_code]:text-[0.9375em]
    [&_code]:bg-black/[6.5%] dark:[&_code]:bg-white/[6.5%]
    [&_code]:font-monospace
  `,
  pre: tw`
    data-[api]:leading-8 data-[api]:tracking-wide
    data-[api]:text-black/60 dark:data-[api]:text-white/60
  `,
};

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
  const tree = getPageTreeFromContent(content);
  const pageDetail = pagesIndex[category]?.find((item) => item.slug === page);
  const categoryDetail = pagesConfig.pages.find(
    (item) => item.slug === category
  );

  if (!pageDetail) return notFound();
  if (!categoryDetail) return notFound();

  const tableOfContents: TableOfContentsData = [
    {
      id: "",
      href: `/${category}`,
      text: categoryDetail.title,
    },
    {
      id: "",
      href: `/${category}/${page}`,
      text: pageDetail.title,
      children: tree.data?.tableOfContents as TableOfContentsData,
    },
  ];

  return (
    <div className="flex flex-col items-start justify-center md:flex-row-reverse">
      <TableOfContents data={tableOfContents} />
      <div
        className={tw`relative mt-8 flex w-full min-w-[1px] max-w-5xl
        flex-col items-center gap-8 px-3 sm:mt-12 sm:px-4 lg:px-8 [&>*]:w-full
        [&>*]:max-w-3xl`}
      >
        <ReactMarkdown
          rehypePlugins={[rehypeRaw, rehypeSlug]}
          components={{
            h1: ({ node, level, ...props }) => (
              <h1 {...props} className={cx(style.h1, props.className)} />
            ),
            h2: ({ node, level, ...props }) => (
              <h2 {...props} className={cx(style.h2, props.className)} />
            ),
            h3: ({ node, level, ...props }) => (
              <h3 {...props} className={cx(style.h3, props.className)} />
            ),
            pre: ({ node, ...props }) => (
              <pre {...props} className={cx(style.pre, props.className)} />
            ),
            p: ({ node, ...props }) => {
              const paragraph = (
                <p
                  {...props}
                  className={cx(style.paragraph, props.className)}
                />
              );
              const child = props.children[0];
              if (!child) return paragraph;
              if (!isValidElement(child)) return paragraph;
              if (!child.props) return paragraph;
              if (!("data-playground" in child.props)) return paragraph;
              if (!child.props.href) return paragraph;
              return <>{props.children}</>;
            },
            // @ts-expect-error RSC
            a: async ({ node, href, ...props }) => {
              if ("data-playground" in props && href) {
                const filename = resolve(dirname(file), href);
                const deps = getExampleDeps(filename);
                const styles = Object.values(deps)
                  .flatMap((deps) =>
                    Object.values(deps).filter((dep) => dep.endsWith(".css"))
                  )
                  .filter(Boolean);
                const id = `page-${getPageName(filename)}`;
                const css = await Promise.all(
                  styles.map((style) =>
                    parseCSSFile(style, { id, tailwindConfig })
                  )
                );
                const cssContent = css.join("\n");
                return (
                  <Suspense>
                    <PageExample id={id} path={filename} css={cssContent} />
                  </Suspense>
                );
              }
              const className = cx(style.link, props.className);
              if (href?.startsWith("http")) {
                return (
                  <a
                    {...props}
                    href={href}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className={cx(className, "inline-flex items-center gap-1")}
                  >
                    <span>{props.children}</span>
                    <NewWindow
                      className={tw`h-[1em] w-[1em] stroke-black/60
                    dark:stroke-white/60`}
                    />
                  </a>
                );
              }
              if (href?.startsWith("/apis")) {
                return <span>{props.children}</span>;
              }
              if (href?.startsWith("#")) {
                return (
                  <a
                    {...props}
                    href={href}
                    className={cx(className, "inline-flex items-baseline")}
                  >
                    <Hashtag
                      className={tw`h-[1em] w-[1em] self-center stroke-black/60
                      dark:stroke-white/60`}
                    />
                    <span>{props.children}</span>
                  </a>
                );
              }
              if (href) {
                return <Link {...props} href={href} className={className} />;
              }
              return <a {...props} className={className} />;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
