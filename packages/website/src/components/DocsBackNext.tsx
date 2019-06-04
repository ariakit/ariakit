import * as React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import { Separator } from "reakit/Separator";
import { css } from "emotion";
import { usePalette, useLighten } from "reakit-system-palette/utils";
import { VisuallyHidden } from "reakit/VisuallyHidden";

type DocsBackNextProps = { nextPath: string; prevPath: string };

type Data = {
  allMarkdownRemark: {
    nodes: Array<{
      title: string;
      frontmatter: {
        path: string;
      };
    }>;
  };
};

function useDocsBackNextCSS() {
  const background = usePalette("background");
  const foreground = usePalette("foreground");
  const primary = usePalette("primary");
  const currentBackgroundColor = useLighten(primary, 0.85);

  const docsNavigation = css`
    background-color: ${background};
    color: ${foreground};
    nav {
      margin: 3em 0 0 0;
    }
    ul {
      padding: 0;
      display: flex;
    }
    li {
      list-style: none;

      &.next {
        margin-left: auto;
      }
    }
    a {
      display: flex;
      align-items: center;
      padding: 0.5em 1em 0.5em 1em;
      text-decoration: none;
      color: inherit;
      cursor: pointer;

      &:focus {
        outline: none;
        background-color: ${currentBackgroundColor};
      }

      &:hover {
        color: ${primary};
      }
    }
  `;

  return docsNavigation;
}

export default function DocsBackNext({
  nextPath,
  prevPath
}: DocsBackNextProps) {
  const data: Data = useStaticQuery(query);
  const className = useDocsBackNextCSS();
  const findMeta = (path: string) =>
    data.allMarkdownRemark.nodes.find(node => node.frontmatter.path === path)!;
  const getTitle = (path: string) => findMeta(path).title;
  return (
    <div className={className}>
      <nav>
        <Separator orientation="horizontal" />
        <ul>
          {prevPath && (
            <li>
              <Link to={prevPath}>
                <VisuallyHidden>Previous </VisuallyHidden>
                {getTitle(prevPath)}
              </Link>
            </li>
          )}
          {nextPath && (
            <li className="next">
              <Link to={nextPath}>
                <VisuallyHidden>Next </VisuallyHidden>
                {getTitle(nextPath)}
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}

const query = graphql`
  query DocsBackNextQuery {
    allMarkdownRemark {
      nodes {
        title
        frontmatter {
          path
        }
      }
    }
  }
`;
