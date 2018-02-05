import { lifecycle } from 'recompose'
import uniqueId from 'lodash/uniqueId'

const withId = (prefix, prop = 'id') =>
  lifecycle({
    componentWillMount() {
      this.setState({
        [prop]: uniqueId(prefix),
      })
    },
  })

export default withId
