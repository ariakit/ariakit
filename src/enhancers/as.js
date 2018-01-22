import React from 'react'
import styled from 'styled-components'
import omit from 'lodash/omit'
import { pickHTMLProps, pickSVGProps } from 'pick-react-known-prop'
import pickCSSProps from '../utils/pickCSSProps'
import isSVGElement from '../utils/isSVGElement'
import parseTag from '../utils/parseTag'
import parseClassName from '../utils/parseClassName'

const Next = ({ nextAs, ...props }) => <StyledReas {...props} as={nextAs} />

const Reas = ({ as: t, ...props }) => {
  const T = parseTag(t)

  if (Array.isArray(T)) {
    const FirstT = T[0]
    return <FirstT as={Next} {...props} nextAs={T.slice(1)} />
  }

  const style = pickCSSProps(props)
  const className = parseClassName(props.className)

  if (typeof T === 'string') {
    const { dangerouslySetInnerHTML, children } = props
    const propsWithoutStyle = omit(props, Object.keys(style))
    const propsWithStyle = { ...propsWithoutStyle, ...(style ? { style } : {}) }
    const otherProps = dangerouslySetInnerHTML ? { dangerouslySetInnerHTML } : {}
    const allProps = {
      ...(isSVGElement(T) && pickSVGProps(propsWithStyle)),
      ...pickHTMLProps(propsWithStyle),
      ...otherProps,
      className,
    }
    return <T {...allProps}>{children}</T>
  }

  return <T {...props} className={className} {...(style ? { style } : {})} />
}

const StyledReas = styled(Reas)`
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
  box-sizing: border-box;
`

StyledReas.displayName = 'styled(Reas)'

const getComponentName = component => (
  component.displayName || component.name || component
)

const getDisplayName = ([Component, ...elements]) => (
  `${getComponentName(Component)}.as(${elements.map(getComponentName)})`
)

const getAs = (components, props) => (
  components.concat(props.as || [], props.nextAs || [])
)

const as = asComponents => (WrappedComponent) => {
  const components = [].concat(WrappedComponent, asComponents)
  const AsStyledReas = props => <StyledReas {...props} as={getAs(components, props)} />
  AsStyledReas.displayName = getDisplayName(components)

  const StyledAsStyledReas = styled(AsStyledReas)``
  StyledAsStyledReas.displayName = getComponentName(WrappedComponent)
  StyledAsStyledReas.styledComponentId = StyledAsStyledReas.displayName

  StyledAsStyledReas.propTypes = components.reduce((finalPropTypes, component) => ({
    ...finalPropTypes,
    ...component.propTypes,
  }), {})

  StyledAsStyledReas.as = otherElements => as(otherElements)(StyledAsStyledReas)

  StyledAsStyledReas.$extend = StyledAsStyledReas.extend

  Object.defineProperty(StyledAsStyledReas, 'extend', {
    value: (strings, ...interpolations) => {
      const modifiedStrings = [
        `&& {${strings[0] || ''}`,
        ...strings.slice(1, -1),
        `${strings[strings.length - 1] || ''}}`,
      ]
      return StyledAsStyledReas.$extend(modifiedStrings, ...interpolations)
    },
  })

  return StyledAsStyledReas
}

export default as
