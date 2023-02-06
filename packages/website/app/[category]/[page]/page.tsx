import { existsSync, readFileSync, writeFileSync } from "fs";
import { basename, dirname, extname, join, resolve } from "path";
import { getKeys } from "@ariakit/core/utils/misc";
import matter from "gray-matter";
import { toString } from "hast-util-to-string";
import { marked } from "marked";
import rehypeParse from "rehype-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import Comp from "./comp";
import { isPlaygroundNode } from "./utils/ast";
import { PAGE_FILE_REGEX } from "./utils/const";
import { getPageFiles } from "./utils/get-page-files";
import { getPageName } from "./utils/get-page-name";
import { parseCSSFile } from "./utils/parse-css-file";
import { parsePageDeps } from "./utils/parse-page-deps";
import { pathToPosix } from "./utils/path-to-posix";

export const dynamicParams = false;

const paths = {
  blog: resolve(process.cwd(), "../../blog"),
  guide: resolve(process.cwd(), "../../guide"),
  components: resolve(process.cwd(), "../../components"),
  examples: resolve(process.cwd(), "../../examples"),
};

/**
 * Reads a directory recursively and returns a list of pages that match the
 * given pattern.
 */
function getPageNames(dir: string, pattern: RegExp) {
  return getPageFiles(dir, pattern).map(getPageName);
}

/**
 * Creates a page content string from a file path.
 */
function createPageContent(filename: string) {
  const title = getPageName(filename);
  const importPath = pathToPosix(basename(filename));
  const content = `# ${title}
<a href="./${importPath}" data-playground>Example</a>`;
  return content;
}

/**
 * Returns the page tree from a markdown content string.
 */
function getPageTreeFromContent(content: string) {
  const { data, content: contentWithoutMatter } = matter(content);

  const tree = unified()
    .use(rehypeParse, { fragment: true })
    .parse(marked(contentWithoutMatter));

  tree.data = { ...data, ...tree.data, tableOfContents: [] };

  type TableOfContents = Array<{
    id: string;
    text: string;
    children?: TableOfContents;
  }>;

  visit(tree, "element", (node) => {
    const tableOfContents = tree.data?.tableOfContents as TableOfContents;
    const id = node.properties?.id;
    if (!id) return;
    if (typeof id !== "string") return;
    if (node.tagName === "h2") {
      const text = toString(node);
      tableOfContents.push({ id, text });
    }
    if (node.tagName === "h3") {
      const lastH2 = tableOfContents[tableOfContents.length - 1];
      if (!lastH2) return;
      const text = toString(node);
      lastH2.children = lastH2.children || [];
      lastH2.children.push({ id, text });
    }
  });

  return tree;
}

/**
 * Gets the page tree from a file path.
 */
function getPageTreeFromFile(filename: string) {
  const isMarkdown = extname(filename) === ".md";
  const content = isMarkdown
    ? readFileSync(filename, "utf8")
    : createPageContent(filename);
  return getPageTreeFromContent(content);
}

async function getSourceFiles(category: keyof typeof paths, page: string) {
  const pageFiles = getPageFiles(paths[category], PAGE_FILE_REGEX);
  const pageFile = pageFiles.find((file) => getPageName(file) === page);
  if (!pageFile) return [];

  const tree = getPageTreeFromFile(pageFile);
  const deps = {} as Record<
    string,
    Record<"external" | "internal" | "css", Record<string, string>>
  >;

  visit(tree, "element", (node) => {
    if (!isPlaygroundNode(node)) return;
    const href = node.properties?.href;
    if (typeof href !== "string") return;
    const nextFilename = resolve(dirname(pageFile), href);
    const pageDeps = parsePageDeps(nextFilename);
    deps[href] = pageDeps;
  });

  return deps;
}

export function generateStaticParams() {
  const params = getKeys(paths).flatMap((category) => {
    const pages = getPageNames(paths[category], PAGE_FILE_REGEX);
    return pages.map((page) => ({ category, page }));
  });
  return params;
}

interface PageProps {
  params: ReturnType<typeof generateStaticParams>[number];
}

export default async function Page({ params }: PageProps) {
  // TODO: Generate contents.js here. Check if the file already exists. If it
  // does, just add the new entries. But also check if the other imports exist.
  // Also parse the contents for search here.
  const { category, page } = params;

  const sourceFiles = await getSourceFiles(category, page);
  const externalDeps = Object.values(sourceFiles).flatMap((deps) =>
    Object.values(deps.external)
  );

  const depsFile = join(process.cwd(), ".pages/deps.ts");

  if (!existsSync(depsFile)) {
    writeFileSync(depsFile, "export default {\n};\n");
  }

  const contents = readFileSync(depsFile, "utf8");
  const added = new Set<string>();
  const lines = contents
    .split("\n")
    .map((line) => {
      const match = externalDeps.find((dep) =>
        line.includes(`import("${dep}")`)
      );
      if (match) {
        added.add(match);
      }
      if (line === "};") {
        const newLines = externalDeps
          .filter((dep) => !added.has(dep))
          .map((dep) => `  "${dep}": () => import("${dep}") as unknown,`);
        return [...newLines, line];
      }
      return line;
    })
    .flat();

  const nextContent = lines.join("\n");

  if (contents !== nextContent) {
    writeFileSync(depsFile, nextContent);
  }

  const [style] = await Promise.all(
    Object.values(sourceFiles)
      .flatMap((deps) => Object.values(deps.css))
      .map(parseCSSFile)
  );
  console.log(style);

  return <Comp imports={externalDeps} />;
}
