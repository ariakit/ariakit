// TODO: Refactor this mess
import * as React from "react";
import RehypeReact from "rehype-react";
import { useId } from "reakit-utils";
import { Button } from "reakit";
import { css } from "emotion";
import createUseContext from "constate";
import { FaEdit, FaGithub } from "react-icons/fa";
import { usePalette, useLighten } from "reakit-system-palette/utils";
import useLocation from "../hooks/useLocation";
import track from "../utils/track";
import Spacer from "./Spacer";

type Props = {
  readmeUrl: string;
  sourceUrl: string;
  title: string;
  tableOfContentsAst: object;
};

function useCollection() {
  const [items, setItems] = React.useState<string[]>([]);
  const add = React.useCallback((item: string) => {
    setItems(prevItems => [...prevItems, item]);
  }, []);
  const remove = React.useCallback((item: string) => {
    setItems(prevItems => {
      const idx = prevItems.indexOf(item);
      return [...prevItems.slice(0, idx), ...prevItems.slice(idx + 1)];
    });
  }, []);
  return {
    items,
    add,
    remove
  };
}

const useCollectionContext = createUseContext(useCollection, v =>
  Object.values(v)
);

function useScrollSpy() {
  const { items } = useCollectionContext();
  const [currentId, setCurrentId] = React.useState<string | null>(null);
  const location = useLocation();

  React.useEffect(() => setCurrentId(null), [location.pathname]);

  React.useEffect(() => {
    if (!items.length) return undefined;

    const elements = document.querySelectorAll<HTMLElement>(
      items.map(item => `[id="${item}"]`).join(",")
    );
    const elementsArray = Array.from(elements);

    const handleScroll = () => {
      elementsArray.forEach(element => {
        if (element.offsetTop <= window.scrollY + 100) {
          setCurrentId(element.id);
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [items]);

  return currentId;
}

const useScrollSpyContext = createUseContext(useScrollSpy);

function useDocsInnerNavigationCSS() {
  const background = usePalette("background");
  const foreground = usePalette("foreground");
  const borderColor = useLighten(foreground, 0.9);

  const docsInnerNavigation = css`
    font-size: 0.875em;
    background-color: ${background};
    color: ${foreground};

    > * {
      margin-bottom: 16px;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;

      li {
        padding: 0.25em 0;
      }

      ul {
        margin: 4px 0 0 1px;
        padding-left: 12px;
        border-left: 1px solid ${borderColor};
      }

      a {
        color: inherit;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
        &[aria-current="page"] {
          font-weight: bold;
        }
      }
    }
  `;

  return docsInnerNavigation;
}

const { Compiler: renderAst } = new RehypeReact({
  createElement: React.createElement,
  components: {
    p: (props: React.PropsWithChildren<{}>) => <span {...props} />,
    a: (props: React.AnchorHTMLAttributes<any>) => {
      const [href] = React.useState(
        () => props.href && props.href.replace(/^.*(#.+)$/, "$1")
      );
      const id = href && href.substr(1);
      const { add, remove } = useCollectionContext();
      const currentId = useScrollSpyContext();

      React.useEffect(() => {
        if (!id) return undefined;
        add(id);
        return () => remove(id);
      }, [id, add, remove]);

      if (href) {
        return (
          <a
            {...props}
            href={href}
            aria-current={currentId === id ? "page" : undefined}
          >
            {props.children}
          </a>
        );
      }
      return <a {...props}>{props.children}</a>;
    }
  }
});

export default function DocsInnerNavigation({
  sourceUrl,
  readmeUrl,
  title,
  tableOfContentsAst
}: Props) {
  const id = useId();
  const className = useDocsInnerNavigationCSS();

  return (
    <useCollectionContext.Provider>
      <useScrollSpyContext.Provider>
        <div className={className} key={title}>
          <Button
            as="a"
            href={sourceUrl}
            unstable_system={{ fill: "outline" }}
            onClick={track("reakit.sectionSourceClick")}
          >
            <FaGithub />
            <Spacer width={8} /> View on GitHub
          </Button>
          <Button
            as="a"
            href={readmeUrl}
            unstable_system={{ fill: "outline" }}
            onClick={track("reakit.sectionMarkdownClick")}
          >
            <FaEdit />
            <Spacer width={8} />
            Edit this page
          </Button>
          <div hidden id={id}>
            {title} sections
          </div>
          <nav aria-labelledby={id}>{renderAst(tableOfContentsAst)}</nav>
        </div>
      </useScrollSpyContext.Provider>
    </useCollectionContext.Provider>
  );
}
