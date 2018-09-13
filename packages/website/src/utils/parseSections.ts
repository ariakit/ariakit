import { get } from "lodash";
import { Section } from "./types";
import flattenSections from "./flattenSections";
import sortSections from "./sortSections";
import getParentSectionName from "./getParentSectionName";

const groups = ["Primitives", "Containers"];

const findUses = (sections: Section[], name: string) =>
  sections
    .filter(x => get(x, "props.uses", []).includes(name))
    .map(x => x.name);

const parseSections = (sections: Section[], rootSections = sections) => {
  if (!sections) return [];
  const flattenedSections = flattenSections(rootSections);

  return sortSections(sections)
    .filter(Boolean)
    .reduce(
      (acc, { components, ...section }) => {
        const finalSection: Section = {
          ...section,
          props: {
            ...section.props,
            usedBy: findUses(flattenedSections, section.name)
          },
          sections: parseSections(
            [...(section.sections || []), ...(components || [])],
            rootSections
          ),
          slug: groups.includes(section.name)
            ? ""
            : section.slug.replace(/-\d$/, "")
        };

        const parentName = getParentSectionName(section);
        const parent = acc.find(x => x.name === parentName);

        if (parent) {
          return [
            ...acc.filter(x => x.name !== parent.name),
            { ...parent, sections: [...(parent.sections || []), finalSection] }
          ];
        }

        return [...acc, finalSection];
      },
      [] as Section[]
    );
};

export default parseSections;
