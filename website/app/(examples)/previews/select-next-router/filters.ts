export const statuses = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const languages = {
  en: "English",
  fr: "French",
  de: "German",
};

export function getLabel(
  options: Record<string, string>,
  value?: string | string[],
  defaultValue?: string,
) {
  if (!value?.length) return defaultValue;
  if (Array.isArray(value)) {
    const selected = value.filter((v) => options[v]);
    if (selected.length === 1 && selected[0]) {
      return options[selected[0]] || defaultValue;
    }
    return `${selected.length} selected`;
  }
  return options[value] || defaultValue;
}
