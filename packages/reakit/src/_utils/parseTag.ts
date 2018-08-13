import { AsProp } from "../as";

const parseTag = (tag?: AsProp | null) => {
  if (Array.isArray(tag)) {
    const tags = tag.filter(
      (currentTag, i) => typeof currentTag !== "string" || i === tag.length - 1
    );
    return tags.length <= 1 ? tags[0] || "div" : tags;
  }
  return tag || "div";
};

export default parseTag;
