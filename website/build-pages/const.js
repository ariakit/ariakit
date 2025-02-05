export const PAGE_INDEX_FILE_REGEX =
  /\/[^\/]+\/((index(\.(react|solid))?|page|layout)\.[tj]sx?|readme\.md)/i;
export const PAGE_FILE_REGEX = new RegExp(
  `(${PAGE_INDEX_FILE_REGEX.source}|\/((?!.*license\.md$).*\.md))$`,
  "i",
);
