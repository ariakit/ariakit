const getSectionUrl = (sections, sectionOrNameOrSlug, prepend = "/") => {
  const nameOrSlug = sectionOrNameOrSlug.name || sectionOrNameOrSlug;
  return sections
    .filter(Boolean)
    .reduce(
      (slugs, section) => {
        if (section.name === nameOrSlug || section.slug === nameOrSlug) {
          return [...slugs, section.slug];
        }
        if (section.sections && section.sections.length) {
          const slugsString = slugs.join("");
          const childUrl = getSectionUrl(
            section.sections,
            nameOrSlug,
            slugsString
          );
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
