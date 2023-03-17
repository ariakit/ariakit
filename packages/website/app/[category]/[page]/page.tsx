import { Children, ReactNode, isValidElement } from "react";
import { basename, dirname, resolve } from "path";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { getPageContent } from "scripts/pages/get-page-content.mjs";
import { getPageEntryFiles } from "scripts/pages/get-page-entry-files.mjs";
import { getPageName } from "scripts/pages/get-page-name.mjs";
import { pages } from "../../../pages.config";
import Comp from "./comp";

export const dynamicParams = false;

function getPageNames(dir: string) {
  return getPageEntryFiles(dir).map(getPageName);
}

export function generateStaticParams() {
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

export default async function Page({ params }: PageProps) {
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
        h1: () => <h1>Lol</h1>,
        p: ({ node, ...props }) => {
          const paragraph = <p {...props} />;
          const child = props.children[0];
          if (!child) return paragraph;
          if (!isValidElement(child)) return paragraph;
          if (!child.props) return paragraph;
          if (!("data-playground" in child.props)) return paragraph;
          if (!child.props.href) return paragraph;
          const filename = resolve(dirname(file), child.props.href);
          return <Comp page={filename} />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );

  // return null;

  // const sourceFiles = await getSourceFiles(category, page);
  // const externalDeps = Object.values(sourceFiles).flatMap((deps) =>
  //   Object.values(deps.external)
  // );

  // const importsFile = join(process.cwd(), ".pages/imports.ts");
  // const imports = Object.keys(sourceFiles).map(
  //   (key) => `  "${page}": () => import("${key}"),`
  // );

  // // writeFileSync(importsFile, `export default {\n${imports.join("\n")}\n};\n`);

  // const depsFile = join(process.cwd(), ".pages/deps.ts");

  // const contents = readFileSync(depsFile, "utf8");
  // const added = new Set<string>();
  // const lines = contents
  //   .split("\n")
  //   .map((line) => {
  //     const match = externalDeps.find((dep) =>
  //       line.includes(`import("${dep}")`)
  //     );
  //     if (match) {
  //       added.add(match);
  //     }
  //     if (line === "};") {
  //       const newLines = externalDeps
  //         .filter((dep) => !added.has(dep))
  //         .map((dep) => `  "${dep}": () => import("${dep}") as unknown,`);
  //       return [...newLines, line];
  //     }
  //     return line;
  //   })
  //   .flat();

  // const nextContent = lines.join("\n");

  // if (contents !== nextContent) {
  //   writeFileSync(depsFile, nextContent);
  // }

  // const [style] = await Promise.all(
  //   Object.values(sourceFiles)
  //     .flatMap((deps) => Object.values(deps.css))
  //     .map(parseCSSFile)
  // );

  // const pageFiles = getPageFiles(paths[category], PAGE_FILE_REGEX);
  // const pageFile = pageFiles.find((file) => getPageName(file) === page);
  // if (!pageFile) return [];

  // const isMarkdown = extname(pageFile) === ".md";
  // const content = isMarkdown
  //   ? readFileSync(pageFile, "utf8")
  //   : createPageContent(pageFile);

  // return (
  //   <ReactMarkdown
  //     rehypePlugins={[rehypeRaw]}
  //     components={{
  //       h1: () => <h1>Lol</h1>,
  //       p: ({ node, ...props }) => {
  //         if (
  //           props.children[0] &&
  //           props.children[0].props &&
  //           "data-playground" in props.children[0].props
  //         ) {
  //           return <Comp page={page} imports={externalDeps} />;
  //         }
  //         return <p {...props} />;
  //       },
  //     }}
  //   >
  //     {content}
  //   </ReactMarkdown>
  // );

  // // const processor = unified()
  // //   .use(remarkParse)
  // //   .use(remarkToRehype, { allowDangerousHtml: true })
  // //   .use(rehypeToReact, {
  // //     createElement,
  // //     Fragment,
  // //     components: { h1: (props) => <h1>Lol</h1> },
  // //   });

  // // return processor.processSync(content).result;

  // return <Comp imports={externalDeps} />;
}
