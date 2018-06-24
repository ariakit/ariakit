const findSectionByLocation = (sections, location) => {
  const slugs = location.pathname.split("/").filter(Boolean);
  return slugs.reduce((acc, slug) => {
    const items = Array.isArray(acc) ? acc : acc.sections;
    return items.find(item => item.slug === slug);
  }, sections);
};

export default findSectionByLocation;
