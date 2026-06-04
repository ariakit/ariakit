---
"@ariakit/react-components": patch
---

Fixed cross-oriented nested group sizing in virtualized renderers

`CollectionRenderer`, `CompositeRenderer`, and `SelectRenderer` reserved the wrong amount of space for a nested group whose `orientation` runs perpendicular to the parent — for example, a horizontal group inside a vertical list.

The group's children were summed along their own axis (their widths) and that sum was reserved as the group's height, leaving a large empty gap after the group and inflating the scroll size. The group is now measured along the parent's axis, from the rendered element or the largest child extent, instead of being summed from the children's cross-axis extents.
