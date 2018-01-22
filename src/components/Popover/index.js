import Popover from './Popover'
import PopoverArrow from './PopoverArrow'
import PopoverToggle from './PopoverToggle'
import Hidden from '../Hidden'

Popover.Arrow = PopoverArrow
Popover.Toggle = PopoverToggle
Popover.Show = Hidden.Show
Popover.Hide = Hidden.Hide

export default Popover

export withPopoverState from './withPopoverState'
