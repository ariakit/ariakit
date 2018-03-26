import React from 'react'
import StepState from '../Step/StepState'

const TabsState = props => <StepState loop current={0} {...props} />

TabsState.propTypes = StepState.propTypes

export default TabsState
