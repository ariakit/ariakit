import PropTypes from 'prop-types'
import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import { value } from '../../utils/styledProps'
import Base from '../Base'

const GridItem = styled(Base)`
  &&& {
    ${value('grid-area', 'area')};
    ${value('grid-column', 'column')};
    ${value('grid-row', 'row')};
    ${value('grid-column-start', 'columnStart')};
    ${value('grid-column-end', 'columnEnd')};
    ${value('grid-row-start', 'rowStart')};
    ${value('grid-row-end', 'rowEnd')};
  }
`

const valueType = PropTypes.oneOfType([PropTypes.string, PropTypes.number])

const enhance = compose(
  as('div'),
  setDisplayName('GridItem'),
  setPropTypes({
    ...Base.propTypes,
    area: valueType,
    column: valueType,
    row: valueType,
    columnStart: valueType,
    columnEnd: valueType,
    rowStart: valueType,
    rowEnd: valueType,
  }),
)

export default enhance(GridItem)
