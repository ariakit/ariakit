import { compose, withProps, mapProps } from 'recompose'
import omit from 'lodash/omit'
import difference from 'lodash/difference'

export const namespace = (defaultName, hocsOrFn, includeProps = []) => (
  optionsOrComponent = defaultName,
) => {
  const name =
    typeof optionsOrComponent === 'string' ? optionsOrComponent : defaultName
  const options =
    typeof optionsOrComponent === 'object'
      ? { name, ...optionsOrComponent }
      : { name }
  const Component =
    typeof optionsOrComponent === 'function' && optionsOrComponent
  const hocs = typeof hocsOrFn === 'function' ? hocsOrFn(options) : hocsOrFn

  const enhance = compose(
    withProps(props => ({ $parentProps: props })),
    ...hocs,
    mapProps(props => ({
      [options.name]: {
        ...omit(
          props,
          options.name,
          '$parentProps',
          ...difference(Object.keys(props.$parentProps), includeProps),
        ),
        ...props[options.name],
      },
      ...props.$parentProps,
    })),
  )

  if (Component) {
    return enhance(Component)
  }
  return enhance
}

export default namespace
