import styled from 'styled-components'
import { compose, setDisplayName, setPropTypes, setStatic } from 'recompose'
import as from '../../enhancers/as'
import Base from '../Base'

const Table = styled(Base)`
  display: table;
  table-layout: fixed;
  border-collapse: collapse;
  background-color: white;
  border: 1px solid #bbb;
  line-height: 200%;
`

const enhance = compose(
  as('table'),
  setDisplayName('Table'),
  setPropTypes(Base.propTypes),
  setStatic('defaultProps', {
    role: 'table',
  }),
)

export default enhance(Table)
