import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import omit from 'lodash/omit'
import { pickHTMLProps, pickSVGProps } from 'pick-react-known-prop'
import pickCSSProps from '../utils/pickCSSProps'
import isSVGElement from '../utils/isSVGElement'
import parseTag from '../utils/parseTag'
import parseClassName from '../utils/parseClassName'

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
    return (
      <T {...allProps} ref={props.elementRef}>
        {children}
      </T>
    )
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

  let AsReas = props => (
    <Reas {...props} as={getAs(components, props)} nextAs={undefined} />
  )

  AsReas.displayName = getDisplayName(components)

  if (WrappedComponent.withComponent) {
    AsReas = WrappedComponent.withComponent(AsReas)
    AsReas.displayName = `styled(${getDisplayName(components)})`
  }

  AsReas.propTypes = components.reduce(
    (finalPropTypes, component) => ({
      elementRef: PropTypes.func,
      ...finalPropTypes,
      ...component.propTypes,
    }),
    {},
  )

  AsReas.as = otherElements => as(otherElements)(AsReas)

  Object.defineProperty(AsReas, 'extend', {
    value: (...args) => styled(AsReas)(...args),
  })

  return AsReas
}

export default as
