import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const TableRow = styled(Base)`
  display: table-row;
  border: inherit;
`

const enhance = compose(
  as('tr'),
  setDisplayName('TableRow'),
  setPropTypes(Base.propTypes),
  setStatic('defaultProps', {
    role: 'row',
  }),
)

export default enhance(TableRow)
