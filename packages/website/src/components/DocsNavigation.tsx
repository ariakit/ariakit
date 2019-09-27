// TODO: Refactor this mess
import * as React from "react";
import { useStaticQuery, graphql, Link, GatsbyLinkProps } from "gatsby";
import { useId } from "reakit-utils";
import {
  useTooltipState,
  Tooltip,
  TooltipReference,
  TooltipArrow
} from "reakit";
import kebabCase from "lodash/kebabCase";
import { css } from "emotion";
import { usePalette, useLighten } from "reakit-system-palette/utils";
import TestTube from "../icons/TestTube";

type Data = {
  allDocsYaml: {
    nodes: Array<{
      section: string;
      paths: string[];
    }>;
  };
  allMarkdownRemark: {
    nodes: Array<{
      title: string;
      frontmatter: {
        path: string;
        experimental?: boolean;
      };
    }>;
  };
};

function ExperimentalLink(props: GatsbyLinkProps<{}>) {
  const { unstable_referenceRef, ...tooltip } = useTooltipState({
    placement: "right",
    unstable_fixed: true
  });
  return (
    <>
      <TooltipReference as={Link} {...props} {...tooltip}>
        {props.children}
        <TestTube role="presentation" ref={unstable_referenceRef} />
      </TooltipReference>
      <Tooltip unstable_system={{ palette: "warning" }} {...tooltip}>
        <TooltipArrow {...tooltip} /> Experimental
      </Tooltip>
    </>
  );
}

function useDocsNavigationCSS() {
  const background = usePalette("background");
  const foreground = usePalette("foreground");
  const primary = usePalette("primary");
  const currentBackgroundColor = useLighten(primary, 0.85);
  const headingColor = useLighten(foreground, 0.5);

  const docsNavigation = css`
    background-color: ${background};
    color: ${foreground};
    h3 {
      font-size: 0.85em;
      text-transform: uppercase;
      padding: 0 1em;
      color: ${headingColor};
      font-weight: 400;
    }
    nav {
      margin: 1.5em 0 0 0;
      &:first-of-type {
        margin: 0;
      }
    }
    ul {
      padding: 0;
    }
    li {
      list-style: none;
    }
    a {
      display: flex;
      align-items: center;
      padding: 0.5em 1em 0.5em 2em;
      text-decoration: none;
      color: inherit;
      border-left: 5px solid transparent;
      cursor: pointer;

      &:focus {
        outline: none;
        background-color: ${currentBackgroundColor};
      }

      &:hover {
        color: ${primary};
      }

      &[aria-current="page"] {
        background-color: ${currentBackgroundColor};
        border-left-color: ${primary};
      }

      svg {
        margin-left: 0.25em;
      }
    }
  `;

  return docsNavigation;
}

export default function DocsNavigation() {
  const data: Data = useStaticQuery(query);
  const baseId = useId("docs-navigation-");
  const className = useDocsNavigationCSS();

  const getId = (section: string) => `${baseId}-${kebabCase(section)}`;
  const findMeta = (path: string) =>
    data.allMarkdownRemark.nodes.find(node => node.frontmatter.path === path)!;
  const getTitle = (path: string) => findMeta(path).title;
  const getIsExperimental = (path: string) =>
    Boolean(findMeta(path).frontmatter.experimental);

  return (
    <div className={className}>
      {data.allDocsYaml.nodes.map(node => (
        <nav key={node.section} aria-labelledby={getId(node.section)}>
          <h3 id={getId(node.section)}>{node.section}</h3>
          <ul>
            {node.paths.map(path => (
              <li key={path}>
                {getIsExperimental(path) ? (
                  <ExperimentalLink to={path}>
                    {getTitle(path)}
                  </ExperimentalLink>
                ) : (
                  <Link to={path}>{getTitle(path)}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>
  );
}

const query = graphql`
  query DocsQuery {
    allDocsYaml {
      nodes {
        section
        paths
      }
    }
    allMarkdownRemark {
      nodes {
        title
        frontmatter {
          path
          experimental
        }
      }
    }
  }
`;
