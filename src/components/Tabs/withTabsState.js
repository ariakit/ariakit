import namespace from '../../enhancers/namespace'
import withStepState from '../Step/withStepState'

const withTabsState = namespace('tabs', options => [
  withStepState({ loop: true, current: 0, ...options }),
])

export default withTabsState
