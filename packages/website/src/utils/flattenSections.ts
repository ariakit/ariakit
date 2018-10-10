import getSections from "./getSections";
import { Section } from "./types";

const flattenSections = (sections: Section[]): Section[] =>
  sections.filter(Boolean).reduce(
    (acc, section) => {
      const childSections = getSections(section);
      if (childSections.length) {
        return [...acc, section, ...flattenSections(childSections)];
      }
      return [...acc, section];
    },
    [] as Section[]
  );

export default flattenSections;
