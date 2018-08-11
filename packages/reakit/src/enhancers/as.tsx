/* eslint-disable no-param-reassign */
import React, {
  Component,
  ComponentClass,
  ComponentType,
  CSSProperties,
  ReactNode,
  Ref
} from "react";
import { isStyledComponent } from "styled-components";
import pickCSSProps from "../utils/pickCSSProps";
import parseTag from "../utils/parseTag";
import parseClassName from "../utils/parseClassName";
import pickHTMLProps from "../utils/pickHTMLProps";

export type AsComponent = keyof JSX.IntrinsicElements | ComponentType<any>;
export type AsComponents = AsComponent | AsComponent[];
export interface AsProps {
  as?: AsComponents;
  nextAs?: AsComponent;
}

export type ReakitComponentProps = CSSProperties & AsProps;

export interface ReakitComponent<Props = any>
  extends ComponentClass<Props & ReakitComponentProps> {
  asComponents: AsComponents;
  as: (
    asComponents: AsComponents
  ) => (
    WrappedComponent: Component<AsProps>
  ) => ReakitComponent<Props & ReakitComponentProps>;
  displayName: string;
}

const As = ({ nextAs, ...props }: { nextAs: AsComponent }) =>
  render({ ...props, as: nextAs });

interface IRenderProps extends AsProps {
  className?: string;
  children?: ReactNode;
  elementRef?: Ref<any>;
}

const render = ({ as: t, ...props }: IRenderProps): React.ReactNode => {
  const T = parseTag(t) as AsComponents;

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

function isWrappedWithAs(target: any): target is ReakitComponent<any> {
  return typeof target.asComponents !== "undefined";
}

const as = (asComponents: AsComponents) => <Props extends AsProps>(
  WrappedComponent: ComponentType<Props>
): ReakitComponent<Props> => {
  const target = isStyledComponent(WrappedComponent)
    ? WrappedComponent.target
    : WrappedComponent;

  const defineProperties = (scope: ReakitComponent) => {
    scope.asComponents = asComponents;
    // @ts-ignore
    scope.as = otherComponents => as(otherComponents)(scope);
    return scope;
  };

  if (isWrappedWithAs(target) && asComponents === target.asComponents) {
    return defineProperties(WrappedComponent as ReakitComponent);
  }

  const components = [].concat(WrappedComponent, asComponents);

  const getComponentName = (component: ComponentType<any>): any =>
    // @ts-ignore
    component.displayName || component.name || component;

  const getAs = (props: {
    as: AsComponents;
    nextAs: AsComponent;
  }): AsComponents => components.concat(props.as || [], props.nextAs || []);

  const displayName = `${getComponentName(WrappedComponent)}.as(${[]
    .concat(asComponents)
    .map(getComponentName)})`;

  let EnhancedComponent = (props: { as: AsComponents; nextAs: AsComponent }) =>
    render({ ...props, as: getAs(props) });

  // @ts-ignore
  EnhancedComponent.displayName = displayName;

  if (isStyledComponent(WrappedComponent)) {
    // @ts-ignore
    EnhancedComponent = WrappedComponent.withComponent(
      // @ts-ignore
      EnhancedComponent
    ) as ReakitComponent;
    // @ts-ignore
    EnhancedComponent.styledComponentId = WrappedComponent.styledComponentId;
    // @ts-ignore
    EnhancedComponent.displayName = `Styled(${displayName})`;
  }

  return defineProperties(
    (EnhancedComponent as any) as ReakitComponent
  ) as ReakitComponent<Props>;
};

export default as;
