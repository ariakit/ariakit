type Tags = Record<string, { label: string; description: string }>;

const customTags = {
  search: {
    label: "Search",
    description: "All content related to search",
  },
  dropdowns: {
    label: "Dropdowns",
    description: "All content related to dropdowns",
  },
  forms: {
    label: "Forms",
    description: "All content related to forms",
  },
} as const satisfies Tags;

export const tags = {
  ...customTags,
} as const satisfies Tags;
