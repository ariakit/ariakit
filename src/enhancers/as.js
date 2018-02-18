import React from 'react'
import styled from 'styled-components'
import omit from 'lodash/omit'
import { pickHTMLProps, pickSVGProps } from 'pick-react-known-prop'
import pickCSSProps from '../utils/pickCSSProps'
import isSVGElement from '../utils/isSVGElement'
import parseTag from '../utils/parseTag'
import parseClassName from '../utils/parseClassName'
import escapeClassName from '../utils/escapeClassName'

const Next = ({ nextAs, ...props }) => <Reas {...props} as={nextAs} />

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
    const propsWithStyle = {
      ...propsWithoutStyle,
      ...(style ? { style } : {}),
    }
    const otherProps = dangerouslySetInnerHTML
      ? { dangerouslySetInnerHTML }
      : {}
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

const getComponentName = component =>
  component.displayName || component.name || component

const getDisplayName = ([Component, ...elements]) =>
  `${getComponentName(Component)}.as(${elements.map(getComponentName)})`

const getAs = (components, props) =>
  components.concat(props.as || [], props.nextAs || [])

const as = asComponents => WrappedComponent => {
  const components = [].concat(WrappedComponent, asComponents)

  const AsReas = props => (
    <Reas {...props} as={getAs(components, props)} nextAs={undefined} />
  )

  AsReas.displayName = getDisplayName(components)

  const StyledAsReas = styled(AsReas)`
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font-family: inherit;
    vertical-align: baseline;
    box-sizing: border-box;
  `
  StyledAsReas.displayName = `styled(${AsReas.displayName})`
  StyledAsReas.styledComponentId = escapeClassName(StyledAsReas.displayName)

  StyledAsReas.propTypes = components.reduce(
    (finalPropTypes, component) => ({
      ...finalPropTypes,
      ...component.propTypes,
    }),
    {},
  )

  StyledAsReas.as = otherElements => as(otherElements)(StyledAsReas)

  const originalExtend = StyledAsReas.extend

  Object.defineProperty(StyledAsReas, 'extend', {
    value: (strings, ...interpolations) => {
      const modifiedStrings = [
        `&& {${strings[0] || ''}`,
        ...strings.slice(1, -1),
        `${strings[strings.length - 1] || ''}}`,
      ]
      const extension = originalExtend(modifiedStrings, ...interpolations)

      extension.displayName = StyledAsReas.displayName
      extension.styledComponentId = `${
        StyledAsReas.styledComponentId
      }--extended`

      return extension
    },
  })

  return StyledAsReas
}

export default as
