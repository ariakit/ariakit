import SVGAttributes from "svg-attributes";

const pickSVGProps = props =>
  Object.keys(props).reduce(
    (finalProps, key) => ({
      ...finalProps,
      ...(SVGAttributes[key] ? { [key]: props[key] } : {})
    }),
    {}
  );

export default pickSVGProps;
