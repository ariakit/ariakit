import { forwardRef } from "react";
import pagesConfig from "build-pages/config.js";
import { getPageContent } from "build-pages/get-page-content.js";
import { getPageEntryFilesCached } from "build-pages/get-page-entry-files.js";
import { getPageName } from "build-pages/get-page-name.js";
import { getReferences } from "build-pages/reference-utils.js";
import type { Page } from "build-pages/types.js";
import Link from "next/link.js";
import { PageMarkdown } from "./page-markdown.jsx";
import { PreviewLinkClient } from "./preview-link-client.jsx";
import type { PreviewLinkClientProps } from "./preview-link-client.jsx";

export interface PreviewLinkProps
  extends Omit<PreviewLinkClientProps, "preview"> {}

const fileMap = new Map<string, string>();
const contentMap = new Map<string, string>();

function getFile(config: Page, category: string, page: string) {
  const id = `${category}/${page}`;
  if (fileMap.has(id)) return fileMap.get(id)!;

  const entryFiles = getPageEntryFilesCached(config);

  const file = config.reference
    ? entryFiles.find((file) =>
        page!.replace(/^use\-/, "").startsWith(getPageName(file)),
      )
    : entryFiles.find((file) => getPageName(file) === page);

  if (!file) return null;

  fileMap.set(id, file);

  return file;
}

function getContent(config: Page, category: string, page: string) {
  const id = `${category}/${page}`;
  if (contentMap.has(id)) return contentMap.get(id)!;

  const file = getFile(config, category, page);
  if (!file) return null;

  const reference = config.reference
    ? getReferences(file).find((reference) => getPageName(reference) === page)
    : undefined;

  const content = getPageContent(reference || file);

  contentMap.set(id, content);

  return content;
}

export const PreviewLink = forwardRef<HTMLAnchorElement, PreviewLinkProps>(
  ({ href, ...props }, ref) => {
    const url = new URL(href, "https://ariakit.org");
    const [, category, page] = url.pathname.split("/");
    const section = url.hash.slice(1);
    if (!category || !page) {
      return <Link {...props} ref={ref} href={href} />;
    }

    const config = pagesConfig.pages.find((page) => page.slug === category);
    if (!config) return null;

    const file = getFile(config, category, page);
    const content = getContent(config, category, page);

    if (!file || !content) return;

    return (
      <PreviewLinkClient
        {...props}
        ref={ref}
        href={href}
        preview={async () => {
          "use server";
          return (
            <PageMarkdown
              category={category}
              page={page}
              section={section}
              content={content}
              file={file}
            />
          );
        }}
      />
    );
  },
);
