import { Searcher, search } from "fast-fuzzy";
import type { NextRequest } from "next/server";
import contents from "../../pages.contents";

const searcherOptions = {
  keySelector: (obj: typeof contents[number]) => [
    obj.title || "",
    obj.section || "",
    obj.content || "",
    obj.category || "",
    [obj.title, obj.section, obj.category].join(" "),
  ],
  useSellers: true,
  useDamerau: true,
  returnMatchData: true,
} as const;

const searcher = new Searcher(contents, searcherOptions);
const searchers: Record<string, typeof searcher> = {};

const categories = contents.reduce<Record<string, typeof contents>>(
  (acc, curr) => {
    const category = curr.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category]?.push(curr);
    return acc;
  },
  {}
);

const entries = Object.entries(categories);

for (const [category, contents] of entries) {
  searchers[category] = new Searcher(contents, searcherOptions);
}

function removeConnectors(string: string) {
  return string.replace(/\b(a|an|and|the)\b/gi, "$3");
}

function getKeyFromOriginal(item: typeof contents[number], original: string) {
  const { title, section, content, category } = item;
  if (original === title) return "title";
  if (original === section) return "section";
  if (original === content) return "content";
  if (original === category) return "category";
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
      : string.substring(firstEmptyIndex === -1 ? 0 : firstEmptyIndex + 1);
  const lastEmptyIndex = initial.lastIndexOf(" ", maxLength - suffix.length);
  const final = initial.substring(0, lastEmptyIndex);
  return final + suffix;
}

export const config = {
  runtime: "experimental-edge",
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const category = searchParams.get("category");
  const responseInit = {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, s-maxage=1200, stale-while-revalidate=600",
    },
  };
  if (!query) {
    return new Response("[]", responseInit);
  }
  const searchTerm = removeConnectors(query);
  const results =
    category && Object.prototype.hasOwnProperty.call(searchers, category)
      ? searchers[category]!.search(searchTerm)
      : searcher.search(searchTerm);
  const items = results.map((result) => {
    const { item, original, match } = result;
    const key = getKeyFromOriginal(item, original);
    const maxContentLength = 60;
    const content =
      key !== "content"
        ? truncate(item.content, 0, maxContentLength)
        : truncate(
            item.content,
            Math.max(0, match.index - (maxContentLength + match.length) / 2),
            maxContentLength
          );
    const value = [item.title, item.section, item.category, content].join(" ");
    const words = value.split(/\p{Punctuation}*\s/u);
    const terms = searchTerm.split(" ");
    const keywords = terms
      .map((term) => search(term, words, { threshold: 0.8 }))
      .flat();
    return {
      ...item,
      content,
      key,
      keywords: keywords.slice(0, 3),
    };
  });
  return new Response(JSON.stringify(items), responseInit);
}
