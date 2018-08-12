import CSSProps from "./CSSProps";

interface UnknownProps {
  [key: string]: any;
}

const pickCSSProps = (props: UnknownProps) =>
  Object.keys(props).reduce((finalObject: {}, key) => {
    if (key in CSSProps) {
      return { ...finalObject, [key]: props[key] };
    }
    return finalObject;
  }, "");

export default pickCSSProps;
