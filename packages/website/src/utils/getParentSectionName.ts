import { Section } from "./types";

const getParentSectionName = (section: Section) => {
  if (section.filepath) {
    const [, dirname, filename] =
      section.filepath.match(/([^/]+)\/([^/]+)\.[jt]sx?$/) || Array(3);
    if (dirname !== filename) {
      return dirname;
    }
  }

  return undefined;
};

export default getParentSectionName;
