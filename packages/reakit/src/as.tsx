/* eslint-disable no-param-reassign */
import React, { ReactElement, ComponentType, HTMLProps, Ref } from "react";
import pickCSSProps from "./_utils/pickCSSProps";
import parseTag from "./_utils/parseTag";
import parseClassName from "./_utils/parseClassName";
import pickHTMLProps from "./_utils/pickHTMLProps";
import CSSProps from "./_utils/CSSProps";
import getComponentName from "./_utils/getComponentName";
import { isStyledComponent } from "./styled";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

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
  as?: AsProp | null;
  nextAs?: SingleAsProp | null;
  elementRef?: Ref<T>;
}

export type ReaKitComponent<P extends AllProps = object> = ComponentType<P> & {
  asComponents: AsProp;
  as: (asComponents: AsProp) => ReaKitComponent<P>;
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
      ...pickHTMLProps(propsWithStyle),
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

type AllPropsReplaceAs<P extends AllProps> = Omit<P, "as"> & AllProps;

function as(asComponents: AsProp) {
  return <P extends AllProps>(WrappedComponent: ComponentType<P>) => {
    const target = isStyledComponent(WrappedComponent)
      ? WrappedComponent.target
      : WrappedComponent;

    const defineProperties = (scope: typeof WrappedComponent) => {
      const xscope = scope as ReaKitComponent<AllPropsReplaceAs<P>>;
      xscope.asComponents = asComponents;
      xscope.as = otherComponents => as(otherComponents)(scope);
      return xscope;
    };

    if (isWrappedWithAs(target) && asComponents === target.asComponents) {
      return defineProperties(WrappedComponent);
    }

    const getAs = (props: AllProps): SingleAsProp[] =>
      ([] as any[]).concat(
        WrappedComponent,
        asComponents,
        props.as || [],
        props.nextAs || []
      );

    const componentName = getComponentName(WrappedComponent);
    const commaSeparatedAs = ([] as any[])
      .concat(asComponents)
      .map(getComponentName);
    const displayName = `${componentName}.as(${commaSeparatedAs})`;

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
