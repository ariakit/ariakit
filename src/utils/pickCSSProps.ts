import cssProps from "./cssProps";

const pickCssProps = (props: {[key: string]: any}) =>
  Object.keys(props).reduce((finalObject: {}, key) => {
    if (cssProps[key]) {
      return { ...finalObject, [key]: props[key] };
    }
    return finalObject;
  }, "");

export default pickCssProps;
