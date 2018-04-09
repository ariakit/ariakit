import React from "react";
import styled from "styled-components";
import omit from "lodash/omit";
import { pickHTMLProps, pickSVGProps } from "pick-react-known-prop";
import pickCSSProps from "../utils/pickCSSProps";
import isSVGElement from "../utils/isSVGElement";
import parseTag from "../utils/parseTag";
import parseClassName from "../utils/parseClassName";

// eslint-disable-next-line no-use-before-define
const As = ({ nextAs, ...props }) => render({ ...props, as: nextAs });

const render = ({ as: t, ...props }) => {
  const T = parseTag(t);

  if (Array.isArray(T)) {
    const FirstT = T[0];
    const nextAs = T.slice(1).filter(x => x !== As);
    return <FirstT as={As} {...props} nextAs={nextAs} />;
  }

  const style = pickCSSProps(props);
  const className = parseClassName(props.className);

  if (typeof T === "string") {
    const { dangerouslySetInnerHTML, children } = props;
    const propsWithoutStyle = omit(props, Object.keys(style));
    const propsWithStyle = {
      ...propsWithoutStyle,
      ...(style ? { style } : {})
    };
    const otherProps = dangerouslySetInnerHTML
      ? { dangerouslySetInnerHTML }
      : {};
    const allProps = {
      ...(isSVGElement(T) && pickSVGProps(propsWithStyle)),
      ...pickHTMLProps(propsWithStyle),
      ...otherProps,
      className
    };

    return (
      <T {...allProps} ref={props.elementRef}>
        {children}
      </T>
    );
  }

  return <T {...props} className={className} {...(style ? { style } : {})} />;
};

const as = asComponents => WrappedComponent => {
  const components = [].concat(WrappedComponent, asComponents);

  const getComponentName = component =>
    component.displayName || component.name || component;

  const displayName = `${getComponentName(WrappedComponent)}.as(${[]
    .concat(asComponents)
    .map(getComponentName)})`;

  const getAs = props => components.concat(props.as || [], props.nextAs || []);

  let Reas = props => render({ ...omit(props, "nextAs"), as: getAs(props) });

  Reas.displayName = displayName;

  if (WrappedComponent.withComponent) {
    Reas = WrappedComponent.withComponent(Reas);
    Reas.displayName = `styled(${displayName})`;
  }

  Reas.as = otherElements => as(otherElements)(Reas);

  Object.defineProperty(Reas, "extend", {
    value: (...args) => styled(Reas)(...args)
  });

  return Reas;
};

export default as;
