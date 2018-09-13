import { Section } from "./types";

const getSectionUrl = (
  sections: Section[],
  sectionOrNameOrSlug: Section | string,
  prepend = "/"
): string => {
  const nameOrSlug =
    typeof sectionOrNameOrSlug === "string"
      ? sectionOrNameOrSlug
      : sectionOrNameOrSlug.name;

  return sections
    .filter(Boolean)
    .reduce(
      (slugs, section) => {
        if (section.name === nameOrSlug || section.slug === nameOrSlug) {
          return [...slugs, section.slug];
        }
        if (section.sections && section.sections.length) {
          const slugsString = slugs.join("").replace("//", "/");
          const childUrl = getSectionUrl(
            section.sections,
            nameOrSlug,
            slugsString
          ).replace("//", "/");
          if (childUrl !== slugsString) {
            return [...slugs, section.slug, childUrl];
          }
        }
        return slugs;
      },
      [prepend]
    )
    .filter(Boolean)
    .join("");
};

export default getSectionUrl;
