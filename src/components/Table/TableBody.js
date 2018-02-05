import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const TableBody = styled(Base)`
  display: table-row-group;
  border: inherit;
`

const enhance = compose(
  as('tbody'),
  setDisplayName('TableBody'),
  setPropTypes(Base.propTypes),
  setStatic('defaultProps', {
    role: 'rowgroup',
  }),
)

export default enhance(TableBody)
