import { Reasoning } from "./reasoning.react.tsx";

export default function Example() {
  return (
    <div className="w-100 max-w-[100cqi] grid gap-4">
      <Reasoning defaultExpanded>
        <p>
          I will begin by breaking down this prompt into its fundamental
          requirements and then formulate a plan for implementation, considering
          state management, user interaction, and accessibility.
        </p>
        <Reasoning button="Deconstructing the Core Request">
          <p>
            The user's prompt contains three key concepts that I need to
            synthesize:
          </p>
          <ol>
            <li>
              <p>
                <strong>The UI Pattern: Dropdown</strong>
              </p>
              <p>
                This implies a UI element that is initially hidden and can be
                toggled into view by a user action, typically a click on a
                button or icon. It will contain a list of actions.
              </p>
            </li>
            <li>
              <p>
                <strong>The Context: User Management</strong>
              </p>
              <p>
                This tells me the actions within the dropdown are not generic.
                They are specific to a user entity. This means the component
                must be aware of the context in which it is placed, such as a
                row in a user table. Actions will likely include things like
                "Edit User," "Change Role," or "Delete User."
              </p>
            </li>
            <li>
              <p>
                <strong>The Implementation Goal: Component</strong>
              </p>
              <p>
                This signals the need for a self-contained, reusable, and
                configurable piece of code, likely within a modern frontend
                framework. I will assume a React-like environment for my
                reasoning process.
              </p>
            </li>
          </ol>
        </Reasoning>
        <Reasoning button="State and Structural Planning">
          <p>
            To function correctly, the component needs to manage its own state.
            The most critical piece of state is its visibility.
          </p>
          <p>
            I will need a boolean state variable, let's call it{" "}
            <code>isOpen</code>, initialized to <code>false</code>. A user
            clicking the trigger element (e.g., a "..." icon button) will toggle
            this state.
          </p>
          <p>The component's structure will consist of:</p>
          <ul>
            <li>
              A container element to hold everything and establish a positional
              context.
            </li>
            <li>
              The trigger button that the user interacts with. Its{" "}
              <code>onClick</code> handler will manage the <code>isOpen</code>{" "}
              state.
            </li>
            <li>
              The menu panel, which will be rendered conditionally based on the{" "}
              <code>isOpen</code> state. It will be positioned absolutely
              relative to the container.
            </li>
            <li>
              Inside the menu, a list of action items. These items should not be
              hardcoded; they should be generated based on props passed into the
              component to make it reusable.
            </li>
          </ul>
          <p>
            The component's props interface will therefore need to accept
            handlers for these actions, such as an <code>onEdit</code> function
            and an <code>onDelete</code> function.
          </p>
        </Reasoning>
        <p>
          Thinking ahead, a dropdown that only closes when the trigger is
          clicked again feels clunky. I need to consider more intuitive closing
          mechanisms for a better user experience.
        </p>
        <Reasoning button="Handling User Interactions and Side Effects">
          <p>
            To improve usability, the dropdown must close automatically in
            response to certain events. I'll need to manage these side effects.
          </p>
          <ol>
            <li>
              <p>
                <strong>Clicking Outside</strong>
              </p>
              <p>
                When the menu is open, I'll attach a global event listener to
                the document to listen for clicks. If a click occurs outside the
                component's boundaries, I will set <code>isOpen</code> to{" "}
                <code>false</code>. This requires a way to reference the
                component's main DOM element to perform this check.
              </p>
            </li>
            <li>
              <p>
                <strong>Pressing the Escape Key</strong>
              </p>
              <p>
                Similarly, I will listen for keyboard events. If the user
                presses the 'Escape' key while the menu is open, it should also
                close. This is a standard and expected behavior for modal-like
                elements.
              </p>
            </li>
          </ol>
          <p>
            It's critical that these global event listeners are only active when
            the dropdown is open. They must be added when <code>isOpen</code>{" "}
            becomes true and, importantly, removed (cleaned up) when it becomes
            false or when the component is removed from the UI, to prevent
            memory leaks.
          </p>
        </Reasoning>
        <Reasoning button="Ensuring Accessibility and Semantics">
          <p>
            A functional component is incomplete if it's not accessible. I must
            incorporate ARIA attributes to provide semantic meaning for screen
            readers and other assistive technologies.
          </p>
          <ul>
            <li>
              The trigger button needs <code>aria-haspopup="true"</code> to
              indicate it controls a menu.
            </li>
            <li>
              The button also needs <code>aria-expanded</code>, which will be
              dynamically set to match the <code>isOpen</code> state. This tells
              assistive tech whether the menu it controls is currently visible.
            </li>
            <li>
              The list of actions should be wrapped in an element with{" "}
              <code>role="menu"</code>.
            </li>
            <li>
              Each individual, clickable action within the list should have a{" "}
              <code>role="menuitem"</code>. Using a <code>&lt;button&gt;</code>{" "}
              for each is semantically correct.
            </li>
          </ul>
          <p>
            This semantic structure ensures the component can be understood and
            navigated by all users, not just those who can see its visual
            representation.
          </p>
        </Reasoning>
      </Reasoning>
    </div>
  );
}
