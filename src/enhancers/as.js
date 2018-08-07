/* eslint-disable no-param-reassign */
import React from "react";
import { isStyledComponent } from "styled-components";
import omit from "../utils/omit";
import pickCSSProps from "../utils/pickCSSProps";
import parseTag from "../utils/parseTag";
import parseClassName from "../utils/parseClassName";
import pickHTMLProps from "../utils/pickHTMLProps";

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
    const { children } = props;
    const propsWithStyle = {
      ...props,
      ...(style ? { style } : {})
    };
    const allProps = {
      ...pickHTMLProps(T, propsWithStyle),
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

  const defineProperties = scope => {
    scope.asComponents = asComponents;
    scope.as = otherComponents => as(otherComponents)(scope);
    return scope;
  };

  if (asComponents === target.asComponents) {
    return defineProperties(WrappedComponent);
  }

  const components = [].concat(WrappedComponent, asComponents);

  const getComponentName = component =>
    component.displayName || component.name || component;

  const getAs = props => components.concat(props.as || [], props.nextAs || []);

  const displayName = `${getComponentName(WrappedComponent)}.as(${[]
    .concat(asComponents)
    .map(getComponentName)})`;

  let Component = props =>
    render({ ...omit(props, "nextAs"), as: getAs(props) });

  Component.displayName = displayName;

  if (isStyledComponent(WrappedComponent)) {
    Component = WrappedComponent.withComponent(Component);
    Component.styledComponentId = WrappedComponent.styledComponentId;
    Component.displayName = `Styled(${displayName})`;
  }

  return defineProperties(Component);
};

export default as;
