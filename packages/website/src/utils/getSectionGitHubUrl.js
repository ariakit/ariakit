import isComponentSection from "./isComponentSection";

const packagesUrl = "https://github.com/reakit/reakit/tree/master/packages";

const getComponentGithubSrcUrl = (section, extension) => {
  if (!section.filepath) {
    return null;
  }
  if (extension === "js") {
    if (!isComponentSection(section)) return null;
    return `${packagesUrl}/${section.filepath.replace(/^\.\.\//, "")}`;
  }
  const [, filePathWithoutExtension] = section.filepath.match(/\/(.+)\.[^.]+/);
  return `${packagesUrl}/${filePathWithoutExtension}.${extension}`;
};

export default getComponentGithubSrcUrl;
