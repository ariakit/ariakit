import { Role } from "@ariakit/solid";
import { useFocusTrapRegion } from "@ariakit/solid-components/focus-trap/focus-trap-region";
import { useRole } from "@ariakit/solid-components/role/role";
import { useVisuallyHidden } from "@ariakit/solid-components/visually-hidden/visually-hidden";

export default function Example() {
  const hiddenProps = useVisuallyHidden();
  const focusTrapRegionProps = useFocusTrapRegion();
  const roleProps = useRole();

  return (
    <div>
      <a href="#learn">
        Learn more
        <Role.span {...hiddenProps}> about the Solar System</Role.span>.
      </a>
      <Role
        {...focusTrapRegionProps}
        aria-label="Focus trap region"
        role="region"
      >
        Focus trap region rendered
      </Role>
      <Role {...roleProps}>Role rendered</Role>
    </div>
  );
}
