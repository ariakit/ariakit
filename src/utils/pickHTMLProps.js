import { getElementProps, getEventProps } from "react-known-props";

const pickHTMLProps = (tagName, props) => {
  const allowedProps = [
    ...getElementProps(tagName, { legacy: true }),
    ...getEventProps(),
    "role"
  ];

  const testProp = prop =>
    allowedProps.indexOf(prop) >= 0 || /^(data-|aria-).+/.test(prop);

  return Object.keys(props).reduce(
    (finalProps, key) => ({
      ...finalProps,
      ...(testProp(key) ? { [key]: props[key] } : {})
    }),
    {}
  );
};

export default pickHTMLProps;
