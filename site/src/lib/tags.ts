type Tags = Record<string, { label: string }>;

const customTags = {
  plus: { label: "Plus" },
  dropdowns: { label: "Dropdowns" },
  forms: { label: "Forms" },
  search: { label: "Search" },
} as const satisfies Tags;

export const tags = {
  ...customTags,
} as const satisfies Tags;
