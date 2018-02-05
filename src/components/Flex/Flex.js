import PropTypes from 'prop-types'
import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import { bool, value } from '../../utils/styledProps'
import Base from '../Base'

const Flex = styled(Base)`
  display: flex;

  &&& {
    ${bool('flex-direction', ['row', 'column', 'rowReverse', 'columnReverse'])}
    ${bool('flex-wrap', ['nowrap', 'wrap', 'wrapReverse'])}
    ${value('flex-grow', 'grow')}
    ${value('flex-shrink', 'shrink')}
  }
`

const valueType = PropTypes.oneOfType([PropTypes.string, PropTypes.number])

const enhance = compose(
  as('div'),
  setDisplayName('Flex'),
  setPropTypes({
    ...Base.propTypes,
    row: PropTypes.bool,
    column: PropTypes.bool,
    rowReverse: PropTypes.bool,
    columnReverse: PropTypes.bool,
    nowrap: PropTypes.bool,
    wrap: PropTypes.bool,
    wrapReverse: PropTypes.bool,
    grow: valueType,
    shrink: valueType,
  }),
)

export default enhance(Flex)
