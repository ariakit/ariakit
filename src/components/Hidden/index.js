import Hidden from './Hidden'
import HiddenHide from './HiddenHide'
import HiddenShow from './HiddenShow'
import HiddenToggle from './HiddenToggle'

Hidden.Hide = HiddenHide
Hidden.Show = HiddenShow
Hidden.Toggle = HiddenToggle

export default Hidden

export withHiddenState from './withHiddenState'
