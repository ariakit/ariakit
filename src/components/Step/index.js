import Step from './Step'
import StepHide from './StepHide'
import StepNext from './StepNext'
import StepPrevious from './StepPrevious'
import StepShow from './StepShow'
import StepToggle from './StepToggle'

Step.Hide = StepHide
Step.Next = StepNext
Step.Previous = StepPrevious
Step.Show = StepShow
Step.Toggle = StepToggle

export default Step

export withStepState from './withStepState'
