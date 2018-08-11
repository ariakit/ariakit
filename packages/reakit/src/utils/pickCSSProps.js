import cssProps from "./cssProps";

const pickCssProps = props =>
  Object.keys(props).reduce((finalObject, key) => {
    if (cssProps[key]) {
      return { ...finalObject, [key]: props[key] };
    }
    return finalObject;
  }, "");

export default pickCssProps;
