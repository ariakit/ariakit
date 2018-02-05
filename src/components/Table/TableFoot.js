import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const TableFoot = styled(Base)`
  display: table-footer-group;
  border: inherit;
`

const enhance = compose(
  as('tfoot'),
  setDisplayName('TableFoot'),
  setPropTypes(Base.propTypes),
  setStatic('defaultProps', {
    role: 'rowgroup',
  }),
)

export default enhance(TableFoot)
