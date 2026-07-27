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

function getOption(options: Record<string, string>, value: string) {
  if (!Object.hasOwn(options, value)) return;
  return options[value];
}

export function getLabel(
  options: Record<string, string>,
  value?: string | string[],
  defaultValue?: string,
) {
  if (!value?.length) return defaultValue;
  if (Array.isArray(value)) {
    const selected = value.filter((item) => Object.hasOwn(options, item));
    if (selected.length === 1) {
      const selectedValue = selected[0];
      if (selectedValue == null) {
        return defaultValue;
      }
      return getOption(options, selectedValue) || defaultValue;
    }
    return `${selected.length} selected`;
  }
  return getOption(options, value) || defaultValue;
}

export function getLanguage(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) return;
  if (!value) return "en";
  if (Object.hasOwn(languages, value)) return value;
  return;
}

export function getStatuses(value?: string | string[]) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.filter((item) => Object.hasOwn(statuses, item));
}
