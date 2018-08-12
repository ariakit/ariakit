import { getElementProps, getEventProps } from "react-known-props";

const pickHTMLProps = (tagName: string, props: { [key: string]: any }) => {
  const allowedProps = [
    ...getElementProps(tagName, { legacy: true }),
    ...getEventProps()
  ];

  const testProp = (prop: string) =>
    allowedProps.indexOf(prop) >= 0 || /^data-.+/.test(prop);

  return Object.keys(props).reduce(
    (finalProps, key) => ({
      ...finalProps,
      ...(testProp(key) ? { [key]: props[key] } : {})
    }),
    {}
  );
};

export default pickHTMLProps;
