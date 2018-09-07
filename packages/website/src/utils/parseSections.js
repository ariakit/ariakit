import get from "lodash/get";
import kebabCase from "lodash/kebabCase";
import flattenSections from "./flattenSections";

const groups = {
  Primitives: ["Base", "Block", "Flex", "Inline", "InlineBlock", "InlineFlex"]
};

const getGroupName = sectioName =>
  Object.keys(groups).find(key => groups[key].includes(sectioName));

const findUses = (sections, name) =>
  sections
    .filter(x => get(x, "props.uses", []).includes(name))
    .map(x => x.name);

const parseSections = (sections, rootSections = sections) => {
  if (!sections) return [];
  const flattenedSections = flattenSections(rootSections);

  return sections.filter(Boolean).reduce((acc, { components, ...section }) => {
    const groupName = getGroupName(section.name);

    const finalSection = {
      ...section,
      props: {
        ...section.props,
        usedBy: findUses(flattenedSections, section.name)
      },
      sections: parseSections(
        [...(section.sections || []), ...(components || [])],
        rootSections
      ),
      slug: section.slug.replace(/-\d$/, "")
    };

    if (groupName) {
      const group = acc.find(x => x.name === groupName) || {
        name: groupName,
        slug: kebabCase(groupName),
        sections: []
      };
      return [
        { ...group, sections: [...(group.sections || []), finalSection] },
        ...acc.filter(x => x.name !== groupName)
      ];
    }

    const parent = acc.find(x => section.name.startsWith(x.name));

    if (parent) {
      return [
        ...acc.filter(x => x.name !== parent.name),
        { ...parent, sections: [...(parent.sections || []), finalSection] }
      ];
    }

    return [...acc, finalSection];
  }, []);
};

export default parseSections;
