import { Role } from "@ariakit/solid";
import { useFocusTrapRegion } from "@ariakit/solid-components/focus-trap/focus-trap-region";
import { useRole } from "@ariakit/solid-components/role/role";
import { useVisuallyHidden } from "@ariakit/solid-components/visually-hidden/visually-hidden";

export default function Example() {
  // TODO: Remove explicit props once the fix for
  // https://github.com/ariakit/ariakit/issues/6304 lands.
  const hiddenProps = useVisuallyHidden({});
  const focusTrapRegionProps = useFocusTrapRegion({});
  const roleProps = useRole({});

  return (
    <div>
      <a href="#learn">
        Learn more
        <Role {...hiddenProps}> about the Solar System</Role>.
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
