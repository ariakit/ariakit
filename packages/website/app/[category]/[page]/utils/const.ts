export const PAGE_INDEX_FILE_REGEX = /\/[^\/]+\/(index\.[tj]sx?|readme\.md)/i;
export const PAGE_FILE_REGEX = new RegExp(
  `(${PAGE_INDEX_FILE_REGEX.source}|\.md)$`,
  "i"
);
