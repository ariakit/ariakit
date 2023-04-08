import contents from "build-pages/contents.js";
import { Searcher, search } from "fast-fuzzy";
import type { NextRequest } from "next/server.js";
import { NextResponse } from "next/server.js";

export const runtime = "edge";

const contentsWithoutInstallation = contents.filter(
  (page) => page.title === "Getting started" || page.section !== "Installation"
);

const searcherOptions = {
  keySelector: (obj: (typeof contents)[number]) => [
    obj.title || "",
    obj.parentSection || "",
    obj.section || "",
    obj.content || "",
    obj.category || "",
    obj.slug || "",
    [obj.title, obj.category].join(" "),
    [obj.title, obj.parentSection, obj.section, obj.category].join(" "),
  ],
  useSellers: true,
  useDamerau: true,
  returnMatchData: true,
} as const;

const searcher = new Searcher(contentsWithoutInstallation, searcherOptions);
const searchers: Record<string, typeof searcher> = {};

const categories = contentsWithoutInstallation.reduce<
  Record<string, typeof contents>
>((acc, curr) => {
  const category = curr.category;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category]?.push(curr);
  return acc;
}, {});

const entries = Object.entries(categories);

for (const [category, contents] of entries) {
  searchers[category] = new Searcher(contents, searcherOptions);
}

function removeConnectors(string: string) {
  return string.replace(/\b(a|an|and|the|on|in|at|to|or|for)\b/gi, "");
}

function getKeyFromOriginal(item: (typeof contents)[number], original: string) {
  const { title, section, content, category, slug } = item;
  if (original === title) return "title";
  if (original === section) return "section";
  if (original === content) return "content";
  if (original === category) return "category";
  if (original === slug) return "slug";
  return null;
}

function truncate(
  string: string,
  minStart: number,
  maxLength: number,
  suffix = ""
) {
  string = string.replace(/\s/g, " ");
  if (string.length < maxLength) return string;
  const firstEmptyIndex = string.indexOf(" ", minStart);
  const initial =
    minStart === 0
      ? string
      : string.slice(firstEmptyIndex === -1 ? 0 : firstEmptyIndex + 1);
  const minEnd = Math.min(initial.length, maxLength - suffix.length);
  const lastEmptyIndex = initial.indexOf(" ", minEnd);
  if (lastEmptyIndex === -1) {
    return initial + suffix;
  }
  const final = initial.slice(0, lastEmptyIndex);
  return final + suffix;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  const category = req.nextUrl.searchParams.get("category");
  const headers = new Headers();

  if (process.env.NODE_ENV === "production") {
    headers.set(
      "Cache-Control",
      "public, s-maxage=1800, stale-while-revalidate=86400"
    );
  }

  if (!query) {
    return NextResponse.json([], { status: 200, headers });
  }

  const searchTerm = query;
  const results =
    category && Object.prototype.hasOwnProperty.call(searchers, category)
      ? searchers[category]!.search(searchTerm)
      : searcher.search(searchTerm);
  const items = results.map((result) => {
    const { item, original, match, score } = result;
    const key = getKeyFromOriginal(item, original);
    const maxContentLength = 90;
    const content =
      key !== "content"
        ? truncate(item.content, 0, maxContentLength)
        : truncate(
            item.content,
            Math.max(0, match.index - (maxContentLength - match.length) / 2),
            maxContentLength
          );
    const value = [
      item.title,
      item.parentSection,
      item.section,
      item.category,
      content,
    ].join(" ");
    const words = removeConnectors(value)
      .split(/\p{P}*\s\p{P}*/u)
      .filter(Boolean);
    const terms = searchTerm.split(" ");
    const keywords = terms
      .map((term) => search(term, words, { threshold: 0.8 }))
      .flat();
    return {
      ...item,
      content,
      key,
      score,
      keywords: Array.from(new Set(keywords.slice(0, 5))),
    };
  });

  return NextResponse.json(items.slice(0, 15), { status: 200, headers });
}
