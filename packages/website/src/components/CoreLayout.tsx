// TODO: Refactor this mess
import * as React from "react";
import { Global, css } from "@emotion/core";
import { usePalette, useFade } from "reakit-system-palette/utils";
import useScrolled from "../hooks/useScrolled";
import DocsNavigation from "./DocsNavigation";
import DocsInnerNavigation from "./DocsInnerNavigation";
import Footer from "./Footer";
import Header from "./Header";

type CoreLayoutProps = {
  children: React.ReactNode;
  location: {
    pathname: string;
  };
  pageContext: {
    sourceUrl?: string;
    readmeUrl?: string;
    tableOfContentsAst?: object;
  };
  data?: {
    markdownRemark?: {
      title?: string;
      htmlAst?: object;
      frontmatter?: {
        path?: string;
        experimental?: boolean;
      };
    };
  };
};

export default function CoreLayout(props: CoreLayoutProps) {
  const scrolled = useScrolled(50);
  const title =
    props.data && props.data.markdownRemark && props.data.markdownRemark.title;
  const isHome = props.location.pathname === "/";
  const background = usePalette("background");
  const foreground = usePalette("foreground");
  const codeBackground = useFade(foreground, 0.95);

  return (
    <>
      <Global
        styles={css`
          html,
          body {
            font-family: -apple-system, system-ui, BlinkMacSystemFont,
              "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif,
              "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            margin: 0;
            padding: 0;
            background: ${background};
            color: ${foreground};
          }

          :root {
            --nav-width: 270px;
            --aside-width: 210px;
            --horizontal-gutter: 22px;
          }
        `}
      />
      <Header transparent={isHome && !scrolled} />
      {title && (
        <div
          css={css`
            position: fixed;
            background: ${background};
            width: var(--nav-width);
            z-index: 900;
            top: 120px;
            left: 0;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
            height: calc(100vh - var(--header-height, 60px));
            padding: 16px;
            padding-bottom: 100px;
            box-sizing: border-box;
            @media (max-width: 768px) {
              display: none;
            }
          `}
        >
          <DocsNavigation />
        </div>
      )}
      <main
        id="main"
        css={css`
          code {
            font-family: Consolas, Liberation Mono, Menlo, Courier, monospace;
            background-color: ${codeBackground};
            border-radius: 3px;
            font-size: 0.875em;
            padding: 0.2em 0.4em;
          }
          ${isHome &&
          css`
            @media (max-width: 768px) {
              margin-top: 50px;
            }
          `}
          ${!title &&
          !isHome &&
          css`
            margin: 100px auto 72px;
            max-width: 1200px;
          `}
          ${title &&
          css`
            margin-top: 100px;
            margin-right: calc(var(--aside-width) + var(--horizontal-gutter));
            margin-bottom: 72px;
            margin-left: calc(var(--nav-width) + var(--horizontal-gutter));
            padding: 8px;
            box-sizing: border-box;

            @media (max-width: 1024px) {
              margin-right: 0;
            }
            @media (max-width: 768px) {
              margin-left: 0;
              margin-top: 120px;
            }
            @media (min-width: 1440px) {
              max-width: calc(
                1440px - var(--aside-width) - var(--nav-width) -
                  var(--horizontal-gutter) * 2 -
                  (var(--nav-width) - var(--aside-width))
              );
              margin-right: auto;
              margin-left: auto;
            }
          `}
        `}
      >
        {props.children}
      </main>
      {title && props.pageContext.tableOfContentsAst && (
        <aside
          css={css`
            position: fixed;
            top: 80px;
            right: 0;
            width: var(--aside-width);
            background: ${background};
            padding: 72px 16px;
            box-sizing: border-box;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
            height: calc(100vh - var(--header-height, 60px));
            @media (max-width: 1024px) {
              display: none;
            }
          `}
        >
          <DocsInnerNavigation
            sourceUrl={props.pageContext.sourceUrl!}
            readmeUrl={props.pageContext.readmeUrl!}
            tableOfContentsAst={props.pageContext.tableOfContentsAst}
            title={title}
          />
        </aside>
      )}
      <div
        css={css`
          margin-top: 100px;
        `}
      >
        <Footer />
      </div>
    </>
  );
}
