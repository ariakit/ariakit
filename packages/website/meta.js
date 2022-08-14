module.exports = {
  guide: [
    {
      slug: "getting-started",
      title: "Getting started",
      description:
        "Ariakit is an open source library that provides lower-level React components and hooks for building accessible web apps, design systems, and component libraries.",
    },
  ],
  components: [
    {
      slug: "button",
      title: "Button",
      description:
        "Trigger an action or event, such as submitting a Form, opening a Dialog, canceling an action, or performing a delete operation in React. This component follows the WAI-ARIA Button Pattern.",
    },
    {
      slug: "checkbox",
      title: "Checkbox",
      description:
        "Select one or more options in a list or toggle a single option using a native or custom checkbox in React. This component follows the WAI-ARIA Checkbox Pattern.",
    },
    {
      slug: "collection",
      title: "Collection",
      description:
        "Track a collection of DOM elements in the exact order they're rendered in the DOM and watch the DOM for any change to their order.",
    },
    {
      slug: "combobox",
      title: "Combobox",
      description:
        "Fill in a React input field with autocomplete & autosuggest functionalities. Choose from a list of suggested values with full keyboard support. This component follows the WAI-ARIA Combobox Pattern.",
    },
    {
      slug: "command",
      title: "Command",
      description:
        "Click with a mouse or keyboard to trigger an action. This abstract component is inspired by the WAI-ARIA Command Role.",
      group: "Abstract components",
    },
    {
      slug: "composite",
      title: "Composite",
      description:
        "Provide a single tab stop on the page and navigate through the focusable descendants with arrow keys. This abstract component is inspired by the WAI-ARIA Composite Role.",
      group: "Abstract components",
    },
    {
      slug: "dialog",
      title: "Dialog",
      description:
        "Open a new window that can be either modal or non-modal and optionally rendered in a React portal. This component follows the WAI-ARIA Dialog Pattern.",
    },
    {
      slug: "disclosure",
      title: "Disclosure",
      description:
        "Click on a button to show (expand, open) or hide (collapse, close) a content element in React. This component follows the WAI-ARIA Disclosure Pattern.",
    },
    {
      slug: "focus-trap",
      title: "FocusTrap",
      description:
        "Click on a button to show (expand, open) or hide (collapse, close) a content element in React. This component follows the WAI-ARIA Disclosure Pattern.",
      group: "Abstract components",
    },
    { slug: "form", title: "Form", description: "Example" },
    { slug: "heading", title: "Heading", description: "Example" },
    { slug: "menu", title: "Menu", description: "Example" },
    { slug: "radio", title: "Radio", description: "Example" },
    { slug: "separator", title: "Separator", description: "example" },
    { slug: "tab", title: "Tab", description: "Example" },
    { slug: "tooltip", title: "Tooltip", description: "Example" },
    {
      slug: "focusable",
      title: "Focusable",
      description:
        "Click or press Tab to move focus to any React element using this abstract component that normalizes the focus behavior across browsers.",
    },
  ],
  examples: [
    {
      slug: "button",
      title: "button",
      description: "Example",
      group: "Button",
    },
    {
      slug: "button-as-div",
      title: "Button as div",
      description:
        "Rendering a Button as a div element, while providing the same accessibility features as a native button.",
      group: "Button",
    },
    {
      slug: "button-as-link",
      title: "button-as-link",
      description: "Example",
      group: "Button",
    },
    {
      slug: "checkbox",
      title: "checkbox",
      description: "Example",
      group: "Checkbox",
    },
    {
      slug: "checkbox-as-button",
      title: "Checkbox as button",
      description:
        "Rendering a custom Checkbox as a button element in React, while keeping it accessible to screen reader and keyboard users.",
      group: "Checkbox",
    },
    {
      slug: "checkbox-controlled",
      title: "Controlled Checkbox",
      description:
        "Using controlled props, such as checked and onChange, with a native Checkbox component in React.",
      group: "Checkbox",
    },
    {
      slug: "checkbox-custom",
      title: "Custom Checkbox",
      description:
        "Rendering a visually hidden Checkbox using the VisuallyHidden component to show a custom checkbox presentation in React.",
      group: "Checkbox",
    },
    {
      slug: "checkbox-group",
      title: "Checkbox group",
      description:
        "Rendering multiple Checkbox elements in React to form a group of checkboxes. The selected values are stored in an array provided by the useCheckboxState hook.",
      group: "Checkbox",
    },
    {
      slug: "checkbox-state",
      title: "useCheckboxState",
      description:
        "Using the useCheckboxState hook to control the state of the Checkbox component.",
      group: "Checkbox",
    },
    {
      slug: "collection",
      title: "collection",
      description: "Example",
      group: "Collection",
    },
    {
      slug: "combobox",
      title: "combobox",
      description: "Example",
      group: "Combobox",
    },
    {
      slug: "combobox-animated",
      title: "Animated Combobox",
      description:
        "Animating a Combobox using CSS transitions in React. The component waits for the transition to finish before completely hiding the popover.",
      group: "Combobox",
    },
    {
      slug: "combobox-cancel",
      title: "ComboboxCancel",
      description:
        "Reseting the value of a Combobox with a button rendered next to it using the ComboboxCancel component.",
      group: "Combobox",
    },
    {
      slug: "combobox-disclosure",
      title: "ComboboxDisclosure",
      description:
        "Opening and closing a Combobox with the help of a button rendered next to it using the ComboboxDisclosure component.",
      group: "Combobox",
    },
    {
      slug: "combobox-group",
      title: "ComboboxGroup",
      description:
        "Organizing combobox items into labelled groups using the ComboboxGroup and ComboboxGroupLabel components in React.",
      group: "Combobox",
    },
    {
      slug: "combobox-links",
      title: "Combobox with links",
      description:
        "Using a Combobox with items rendered as links that can be clicked with keyboard and mouse. This is useful for creating an accessible page search input in React.",
      group: "Combobox",
    },
    {
      slug: "combobox-matches",
      title: "Filterable Combobox",
      description:
        "Filtering the suggestions in a Combobox using the list prop from the useComboboxState hook.",
      group: "Combobox",
    },
    {
      slug: "combobox-multiple",
      title: "Multi-selectable Combobox",
      description:
        "Combining Combobox and Select to create an accessible multi-selectable search input in React.",
      group: "Combobox",
    },
    {
      slug: "combobox-textarea",
      title: "Textarea with inline Combobox",
      description:
        "Rendering Combobox as a textarea element to create an accessible multiline textbox in React. Inserting specific characters triggers a popup with dynamic suggestions.",
      group: "Combobox",
    },
    {
      slug: "command",
      title: "command",
      description: "Example",
      group: "Command",
    },
    {
      slug: "command-enter-disabled",
      title: "command-enter-disabled",
      description: "Example",
      group: "Command",
    },
    {
      slug: "command-space-disabled",
      title: "command-space-disabled",
      description: "Example",
      group: "Command",
    },
    {
      slug: "composite-hover-virtual-focus-events",
      title: "composite-hover-virtual-focus-events",
      description: "Example",
      group: "Composite",
    },
    {
      slug: "dialog",
      title: "dialog",
      description: "Example",
      group: "Dialog",
    },
    {
      slug: "dialog-animated",
      title: "Animated Dialog",
      description:
        "Animating a modal Dialog and its backdrop using CSS. The component waits for the transition to finish before completely hiding the dialog or removing it from the React tree.",
      group: "Dialog",
    },
    {
      slug: "dialog-details",
      title: "Dialog with details & summary",
      description:
        "Combining Dialog with the native details element in React so users can interact with it before JavaScript finishes loading.",
      group: "Dialog",
    },
    {
      slug: "dialog-react-router",
      title: "Dialog with React Router",
      description:
        "Using React Router to create a modal Dialog that's triggered with a link and works with the browser's back and forward buttons.",
      group: "Dialog",
    },
    {
      slug: "disclosure",
      title: "disclosure",
      description: "Example",
      group: "Disclosure",
    },
    {
      slug: "focus-trap",
      title: "focus-trap",
      description: "Example",
      group: "FocusTrap",
    },
    {
      slug: "focus-trap-region",
      title: "focus-trap-region",
      description: "Example",
      group: "FocusTrap",
    },
    { slug: "form", title: "form", description: "Example", group: "Form" },
    {
      slug: "form-select",
      title: "Form with Select",
      description:
        "A Select component rendered as a FormField using the built-in browser validation.",
      group: "Form",
    },
    { slug: "group", title: "group", description: "Example", group: "Group" },
    {
      slug: "heading",
      title: "heading",
      description: "Example",
      group: "Heading",
    },
    {
      slug: "hovercard",
      title: "hovercard",
      description: "Example",
      group: "Hovercard",
    },
    {
      slug: "hovercard-disclosure",
      title: "hovercard-disclosure",
      description: "Example",
      group: "Hovercard",
    },
    { slug: "menu", title: "menu", description: "Example", group: "Menu" },
    {
      slug: "menu-bar",
      title: "menu-bar",
      description: "Example",
      group: "Menu",
    },
    {
      slug: "menu-combobox",
      title: "menu-combobox",
      description: "Example",
      group: "Menu",
    },
    {
      slug: "menu-context-menu",
      title: "menu-context-menu",
      description: "Example",
      group: "Menu",
    },
    {
      slug: "menu-dialog-animated",
      title: "menu-dialog-animated",
      description: "Example",
      group: "Menu",
    },
    {
      slug: "menu-framer-motion",
      title: "menu-framer-motion",
      description: "Example",
      group: "Menu",
    },
    {
      slug: "menu-item-checkbox",
      title: "menu-item-checkbox",
      description: "Example",
      group: "Menu",
    },
    {
      slug: "menu-item-radio",
      title: "menu-item-radio",
      description: "Example",
      group: "Menu",
    },
    {
      slug: "menu-nested",
      title: "menu-nested",
      description: "Example",
      group: "Menu",
    },
    {
      slug: "menu-slide",
      title: "menu-slide",
      description: "Example",
      group: "Menu",
    },
    {
      slug: "popover",
      title: "popover",
      description: "Example",
      group: "Popover",
    },
    {
      slug: "popover-flip",
      title: "popover-flip",
      description: "Example",
      group: "Popover",
    },
    {
      slug: "popover-focus-within",
      title: "popover-focus-within",
      description: "Example",
      group: "Popover",
    },
    {
      slug: "popover-responsive",
      title: "popover-responsive",
      description: "Example",
      group: "Popover",
    },
    {
      slug: "popover-selection",
      title: "popover-selection",
      description: "Example",
      group: "Popover",
    },
    {
      slug: "popover-standalone",
      title: "popover-standalone",
      description: "Example",
      group: "Popover",
    },
    {
      slug: "portal",
      title: "portal",
      description: "Example",
      group: "Portal",
    },
    {
      slug: "portal-lazy",
      title: "portal-lazy",
      description: "Example",
      group: "Portal",
    },
    { slug: "radio", title: "radio", description: "Example", group: "Radio" },
    {
      slug: "select",
      title: "select",
      description: "Example",
      group: "Select",
    },
    {
      slug: "select-animated",
      title: "select-animated",
      description: "Example",
      group: "Select",
    },
    {
      slug: "select-autofill",
      title: "select-autofill",
      description: "Example",
      group: "Select",
    },
    {
      slug: "select-combobox",
      title: "select-combobox",
      description: "Example",
      group: "Select",
    },
    {
      slug: "select-combobox-focus-within",
      title: "select-combobox-focus-within",
      description: "Example",
      group: "Select",
    },
    {
      slug: "select-grid",
      title: "select-grid",
      description: "Example",
      group: "Select",
    },
    {
      slug: "select-group",
      title: "select-group",
      description: "Example",
      group: "Select",
    },
    {
      slug: "select-item-custom",
      title: "select-item-custom",
      description: "Example",
      group: "Select",
    },
    {
      slug: "select-multiple",
      title: "select-multiple",
      description: "Example",
      group: "Select",
    },
    {
      slug: "separator",
      title: "separator",
      description: "Example",
      group: "Separator",
    },
    { slug: "tab", title: "tab", description: "Example", group: "Tab" },
    {
      slug: "tab-react-router",
      title: "tab-react-router",
      description: "Example",
      group: "Tab",
    },
    {
      slug: "toolbar",
      title: "toolbar",
      description: "Example",
      group: "Toolbar",
    },
    {
      slug: "toolbar-select",
      title: "toolbar-select",
      description: "Example",
      group: "Toolbar",
    },
    {
      slug: "tooltip",
      title: "tooltip",
      description: "Example",
      group: "Tooltip",
    },
    {
      slug: "tooltip-placement",
      title: "tooltip-placement",
      description: "Example",
      group: "Tooltip",
    },
    {
      slug: "tooltip-timeout",
      title: "tooltip-timeout",
      description: "Example",
      group: "Tooltip",
    },
    {
      slug: "visually-hidden",
      title: "visually-hidden",
      description: "Example",
      group: "VisuallyHidden",
    },
    { slug: "playground", title: "playground", description: "Example" },
    {
      slug: "playground-client",
      title: "playground-client",
      description: "Example",
    },
    {
      slug: "playground-code",
      title: "playground-code",
      description: "Example",
    },
    {
      slug: "playground-tabs",
      title: "playground-tabs",
      description: "Example",
    },
  ],
  blog: [{ slug: "first-post", title: "First post", description: "Test" }],
};
