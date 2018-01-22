import cssProps from './cssProps'

const positions = ['static', 'absolute', 'fixed', 'relative', 'sticky']

const pickCssProps = props => (
  Object.keys(props).reduce((finalObject, key) => {
    if (cssProps[key]) {
      return { ...finalObject, [key]: props[key] }
    } else if (positions.includes(key) && props[key] === true) {
      return { ...finalObject, position: key }
    }
    return finalObject
  }, '')
)

export default pickCssProps
