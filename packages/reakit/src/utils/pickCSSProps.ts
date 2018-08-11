import cssProps from "./cssProps";

interface UnknownProps {
  [key: string]: any;
}

const pickCSSProps = (props: UnknownProps) =>
  Object.keys(props).reduce((finalObject: {}, key) => {
    if (key in cssProps) {
      return { ...finalObject, [key]: props[key] };
    }
    return finalObject;
  }, "");

export default pickCSSProps;
