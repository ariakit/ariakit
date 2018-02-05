import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const TableColumn = styled(Base)`
  display: table-column;
`

const enhance = compose(
  as('col'),
  setDisplayName('TableColumn'),
  setPropTypes(Base.propTypes),
)

export default enhance(TableColumn)
