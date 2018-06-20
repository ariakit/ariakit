import kebabCase from "lodash/kebabCase";

const groups = {
  Primitives: [
    "Base",
    "Block",
    "Box",
    "Flex",
    "Inline",
    "InlineBlock",
    "InlineFlex"
  ]
};

const getGroupName = sectioName =>
  Object.keys(groups).find(key => groups[key].includes(sectioName));

const parseSections = sections => {
  if (!sections) return [];
  return sections.filter(Boolean).reduce((acc, { components, ...section }) => {
    const groupName = getGroupName(section.name);

    const finalSection = {
      ...section,
      sections: parseSections([...section.sections, ...components]),
      slug: section.slug.replace(/-\d$/, "")
    };

    if (groupName) {
      const group = acc.find(x => x.name === groupName) || {
        name: groupName,
        slug: kebabCase(groupName),
        sections: []
      };
      return [
        { ...group, sections: [...group.sections, finalSection] },
        ...acc.filter(x => x.name !== groupName)
      ];
    }

    const parent = acc.find(x => section.name.startsWith(x.name));

    if (parent) {
      return [
        ...acc.filter(x => x.name !== parent.name),
        { ...parent, sections: [...parent.sections, finalSection] }
      ];
    }

    return [...acc, finalSection];
  }, []);
};

export default parseSections;
