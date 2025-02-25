---
tags:
  - Progress
---

# Progress

<div data-description>

A customizable progress component that provides visual feedback about an ongoing process with appropriate ARIA attributes for accessibility.

</div>

<div data-tags></div>

<aside data-type="note" title="Simulation demonstration">
This example demonstrates a progress simulation that starts at 40% and increments in 10% steps. When the progress reaches 100%, it resets back to 0% and begins incrementing again. The component automatically updates every 5 seconds, providing a realistic visualization of how it behaves in real-world scenarios like file uploads or processing tasks. The progress indicator can be individually customized and visually styled to match your design requirements while maintaining accessibility.
</aside>

<a href="./index.react.tsx" data-playground>Example</a>

## Accessibility

The Progress component is built with accessibility in mind:

- Uses `role="progressbar"` to communicate purpose to assistive technologies
- Provides `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` attributes
- Includes `aria-valuetext` for a human-readable description of the current value
- Associates the label with the progress bar using `aria-labelledby`
- Ensures the progress indicator has sufficient color contrast in both light and dark modes

## Component Structure

### ProgressRoot

The main container that provides context and ARIA attributes. It accepts the following props:

- `value` (required): Current progress value
- `min`: Minimum value (default: 0)
- `max`: Maximum value (default: 100)
- `children`: Child components

### ProgressLabel

Text label describing what the progress bar represents:

- `children` (required): The label content
- `id`: Optional custom ID (auto-generated if not provided)

### ProgressValue

Displays the numerical value of the progress:

- `value` (required): Current progress value to display

### ProgressTrack

The background container that houses the progress indicator.

### ProgressIndicator

The visual element that represents the amount of progress completed:

- `value` (required): Current progress value
- `min`: Minimum value (default: 0)
- `max`: Maximum value (default: 100)

## Styling

The Progress component ensures accessibility by adhering to WCAG contrast guidelines. The colors used for the progress indicator, track, and border have been tested to meet a minimum contrast ratio of **4:1 for text elements** and **3:1 for UI components**. This guarantees that the progress bar remains visible and legible in both light and dark modes, providing an inclusive user experience.
