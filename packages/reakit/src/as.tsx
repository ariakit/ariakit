/* eslint-disable no-param-reassign */
import * as React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import pickCSSProps from "./_utils/pickCSSProps";
import parseTag from "./_utils/parseTag";
import parseClassName from "./_utils/parseClassName";
import pickHTMLProps from "./_utils/pickHTMLProps";
import getComponentName from "./_utils/getComponentName";
import toArray from "./_utils/toArray";
import omit from "./_utils/omit";
import { AsProps, Dictionary, AsElement, AsComponent } from "./_utils/types";

function As(props: AsProps<any>) {
  return render(Object.assign({}, omit(props, "nextAs"), { as: props.nextAs }));
}

function render(props: AsProps<any>) {
  const T = parseTag(props.as);

  if (Array.isArray(T)) {
    const [First, ...others] = T.filter(x => x !== As);
    const other = others.length === 1 ? others[0] : others;
    // @ts-ignore: We can't be sure if First accepts `as` or `nextAs`
    return <First {...props} as={As} nextAs={other} />;
  }

  const style = pickCSSProps(props);
  const className = parseClassName(props.className);

  if (typeof T === "string") {
    const propsWithStyle = Object.assign({}, props, style ? { style } : {});
    const allProps = Object.assign(pickHTMLProps(propsWithStyle), {
      className
    });

    return <T {...allProps} ref={props.elementRef} />;
  }

  const allProps = Object.assign(
    {},
    omit(props, "as"),
    { className },
    style ? { style } : {}
  );

  return <T {...allProps} />;
}

function isAsComponent(target: any): target is AsComponent<any, any> {
  return typeof target.asComponents !== "undefined";
}

function as<T extends AsElement<any>>(asComponents: T | T[]) {
  return <P extends Dictionary>(WrappedComponent: React.ComponentType<P>) => {
    // Transform WrappedComponent into ReakitComponent
    const defineProperties = (scope: AsComponent<T, P>) => {
      scope.asComponents = asComponents;
      // @ts-ignore
      scope.as = otherComponents => as(otherComponents)(scope);
      return scope;
    };

    // WrappedComponent was already enhanced with the same arguments
    if (
      isAsComponent(WrappedComponent) &&
      asComponents === WrappedComponent.asComponents
    ) {
      return defineProperties(WrappedComponent as AsComponent<T, P>);
    }

    const componentName = getComponentName(WrappedComponent);
    const commaSeparatedAs = ([] as any[])
      .concat(asComponents)
      .map(getComponentName);
    const displayName = `${componentName}.as(${commaSeparatedAs})`;

    const EnhancedComponent = (props =>
      render(
        Object.assign({}, props, {
          as: [
            WrappedComponent,
            ...toArray(asComponents),
            ...toArray(props.as || []),
            ...toArray(props.nextAs || [])
          ]
        })
      )) as AsComponent<T, P>;

    EnhancedComponent.displayName = displayName;
    // @ts-ignore: Only docs
    EnhancedComponent.propTypes = WrappedComponent.propTypes;
    // @ts-ignore: Only docs
    EnhancedComponent.defaultProps = WrappedComponent.defaultProps;
    // @ts-ignore
    hoistNonReactStatics(EnhancedComponent, WrappedComponent);

    return defineProperties(EnhancedComponent);
  };
}

export default as;
