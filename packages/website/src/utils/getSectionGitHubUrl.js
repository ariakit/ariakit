import isComponentSection from "./isComponentSection";

const repoUrl = "https://github.com/reakit/reakit/tree/master";

const getComponentGithubSrcUrl = (section, extension) => {
  if (!section.filepath) {
    return null;
  }
  if (extension === "js" && !isComponentSection(section)) {
    return null;
  }
  const filePathWithoutExtension = section.filepath.split(".")[0];
  return `${repoUrl}/${filePathWithoutExtension}.${extension}`;
};

export default getComponentGithubSrcUrl;
