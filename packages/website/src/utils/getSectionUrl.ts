import { Section } from "./types";

const getSectionUrl = (
  sections: Section[],
  sectionOrName: Section | string,
  prepend = "/"
): string => {
  const name =
    typeof sectionOrName === "string" ? sectionOrName : sectionOrName.name;

  return sections
    .filter(Boolean)
    .reduce(
      (slugs, section) => {
        if (section.name === name) {
          return [...slugs, section.slug];
        }
        if (section.sections && section.sections.length) {
          const slugsString = slugs.join("").replace("//", "/");
          const childUrl = getSectionUrl(
            section.sections,
            name,
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
