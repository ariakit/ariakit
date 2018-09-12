import { Section } from "./types";

const findSectionByLocation = (sections: Section[], location: Location) => {
  const slugs = location.pathname.split("/").filter(Boolean);

  const finalSection = slugs.reduce(
    (acc: Section | Section[] | undefined, slug) => {
      const items = Array.isArray(acc) ? acc : acc && acc.sections;
      if (!items) return items;

      // include sections of sections with empty slug
      const allItems = items
        .filter(item => !item.slug)
        .reduce(
          (finalItems, item) => [...finalItems, ...(item.sections || [])],
          items
        );
      return allItems.find(item => item.slug === slug);
    },
    sections
  );

  if (Array.isArray(finalSection)) {
    return finalSection[0];
  }
  return finalSection;
};

export default findSectionByLocation;
