/* eslint-disable no-param-reassign */
import React from "react";
import { isStyledComponent } from "styled-components";
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
    const [First, ...others] = T.filter(x => x !== As);
    return <First {...props} as={As} nextAs={others} />;
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
  const target = isStyledComponent(WrappedComponent)
    ? WrappedComponent.target
    : WrappedComponent;

  const components = [].concat(WrappedComponent, asComponents);

  const getComponentName = component =>
    component.displayName || component.name || component;

  const displayName = `${getComponentName(WrappedComponent)}.as(${[]
    .concat(asComponents)
    .map(getComponentName)})`;

  const defineProperties = scope => {
    scope.asComponents = asComponents;
    scope.as = otherComponents => as(otherComponents)(scope);
    return scope;
  };

  if (asComponents === target.asComponents) {
    return defineProperties(WrappedComponent);
  }

  const getAs = props => components.concat(props.as || [], props.nextAs || []);

  let Component = props =>
    render({ ...omit(props, "nextAs"), as: getAs(props) });

  Component.displayName = displayName;

  if (isStyledComponent(WrappedComponent)) {
    Component = WrappedComponent.withComponent(Component);
    Component.displayName = `Styled(${displayName})`;
  }

  return defineProperties(Component);
};

export default as;
