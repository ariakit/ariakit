/* eslint-disable no-param-reassign */
import React, { ReactElement, ComponentType, HTMLProps, Ref } from "react";
import { isStyledComponent } from "styled-components";
import pickCSSProps from "../utils/pickCSSProps";
import parseTag from "../utils/parseTag";
import parseClassName from "../utils/parseClassName";
import pickHTMLProps from "../utils/pickHTMLProps";
import CSSProps from "../utils/CSSProps";

export type Omit<T, K extends keyof T> = Pick<
  T,
  ({ [P in keyof T]: P } & { [P in K]: never })[keyof T]
>;

export type CSSProperties = {
  [key in keyof typeof CSSProps]?: string | number
};

export type AllProps<T = any> = Omit<HTMLProps<T>, "as"> &
  ReaKitProps<T> &
  CSSProperties;

export type SingleAsProp =
  | keyof JSX.IntrinsicElements
  | ComponentType<AllProps>;

export type AsProp = SingleAsProp | SingleAsProp[];

export interface ReaKitProps<T = any> {
  as?: AsProp;
  nextAs?: SingleAsProp;
  elementRef?: Ref<T>;
}

export type ReaKitComponent<P extends AllProps = {}> = ComponentType<P> & {
  asComponents?: AsProp;
  as?: (asComponents: AsProp) => ReaKitComponent<P>;
};

function As({ nextAs, ...props }: AllProps) {
  return render({ ...props, as: nextAs });
}

function render({ as: t, ...props }: AllProps): ReactElement<any> | null {
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

  const allProps: AllProps = {
    ...props,
    className,
    ...(style ? { style } : {})
  };
  return <T {...allProps} />;
}

function isWrappedWithAs(target: any): target is ReaKitComponent {
  return typeof target.asComponents !== "undefined";
}

// RENAME
type Foo<T extends AllProps> = Omit<T, "as"> & AllProps;

function as(asComponents: AsProp) {
  // RENAME
  return function lol<P>(
    WrappedComponent: ComponentType<P>
  ): ReaKitComponent<Foo<P>> {
    const target = isStyledComponent(WrappedComponent)
      ? WrappedComponent.target
      : WrappedComponent;

    const defineProperties = (scope: typeof WrappedComponent) => {
      const xscope = scope as ReaKitComponent<Foo<P>>;
      xscope.asComponents = asComponents;
      xscope.as = otherComponents => as(otherComponents)(scope);
      return xscope;
    };

    if (isWrappedWithAs(target) && asComponents === target.asComponents) {
      return defineProperties(WrappedComponent);
    }

    const getComponentName = (component: typeof WrappedComponent): any =>
      component.displayName || component.name || component;

    const components = ([] as any[]).concat(WrappedComponent, asComponents);

    const getAs = (props: AllProps): SingleAsProp[] =>
      components.concat(props.as || [], props.nextAs || []);

    const displayName = `${getComponentName(
      WrappedComponent
    )}.as(${([] as any[]).concat(asComponents).map(getComponentName)})`;

    const EnhancedComponent: typeof WrappedComponent = (props: AllProps) =>
      render({ ...props, as: getAs(props) });

    EnhancedComponent.displayName = displayName;

    if (isStyledComponent(WrappedComponent)) {
      const StyledComponent = WrappedComponent.withComponent(EnhancedComponent);
      StyledComponent.styledComponentId = WrappedComponent.styledComponentId;
      StyledComponent.displayName = `Styled(${displayName})`;
      return defineProperties(StyledComponent);
    }

    return defineProperties(EnhancedComponent);
  };
}

export default as;
