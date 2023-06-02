import "./style.css";
import { useId, useState } from "react";
import { Button, Dialog, DialogDismiss, DialogHeading } from "./dialog.jsx";

export default function Example() {
  const [open, setOpen] = useState(false);

  const [nested, setNested] = useState(false);
  const [nestedNested, setNestedNested] = useState(false);

  const [nestedUnmount, setNestedUnmount] = useState(false);
  const [nestedUnmountNested, setNestedUnmountNested] = useState(false);

  const [nestedNoPortal, setNestedNoPortal] = useState(false);
  const [nestedNoPortalNested, setNestedNoPortalNested] = useState(false);

  const [nestedNoPortalPortal, setNestedNoPortalPortal] = useState(false);
  const [nestedNoPortalPortalNested, setNestedNoPortalPortalNested] =
    useState(false);

  const [nestedNoBackdrop, setNestedNoBackdrop] = useState(false);
  const [nestedNoBackdropNested, setNestedNoBackdropNested] = useState(false);

  const [sibling, setSibling] = useState(false);
  const [siblingSibling, setSiblingSibling] = useState(false);

  const [siblingUnmount, setSiblingUnmount] = useState(false);
  const [siblingUnmountSibling, setSiblingUnmountSibling] = useState(false);

  const [siblingNoPortal, setSiblingNoPortal] = useState(false);
  const [siblingNoPortalSibling, setSiblingNoPortalSibling] = useState(false);

  const [siblingNoPortalPortal, setSiblingNoPortalPortal] = useState(false);
  const [siblingNoPortalPortalSibling, setSiblingNoPortalPortalSibling] =
    useState(false);

  const [siblingNoBackdrop, setSiblingNoBackdrop] = useState(false);
  const [siblingNoBackdropSibling, setSiblingNoBackdropSibling] =
    useState(false);

  const siblindId = useId();
  const siblingSiblingId = useId();
  const siblingNoPortalId = useId();
  const siblingNoPortalSiblingId = useId();
  const siblingNoPortalPortalId = useId();
  const siblingNoPortalPortalSiblingId = useId();
  const siblingNoBackdropId = useId();
  const siblingNoBackdropSiblingId = useId();

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        unmount
        getPersistentElements={() => [
          document.getElementById(siblindId)!,
          document.getElementById(siblingSiblingId)!,
          document.getElementById(siblingNoPortalId)!,
          document.getElementById(siblingNoPortalSiblingId)!,
          document.getElementById(siblingNoPortalPortalId)!,
          document.getElementById(siblingNoPortalPortalSiblingId)!,
          document.getElementById(siblingNoBackdropId)!,
          document.getElementById(siblingNoBackdropSiblingId)!,
        ]}
      >
        <DialogHeading>Dialog</DialogHeading>
        <DialogDismiss>Close</DialogDismiss>

        {/* Nested buttons */}
        <Button onClick={() => setNested(true)}>nested</Button>

        <Button onClick={() => setNestedUnmount(true)}>nested unmount</Button>

        <Button onClick={() => setNestedNoPortal(true)}>
          nested no portal
        </Button>

        <Button onClick={() => setNestedNoPortalPortal(true)}>
          nested no portal portal
        </Button>

        <Button onClick={() => setNestedNoBackdrop(true)}>
          nested no backdrop
        </Button>

        {/* Sibling buttons */}
        <Button onClick={() => setSibling(true)}>sibling</Button>

        <Button onClick={() => setSiblingUnmount(true)}>sibling unmount</Button>

        <Button onClick={() => setSiblingNoPortal(true)}>
          sibling no portal
        </Button>

        <Button onClick={() => setSiblingNoPortalPortal(true)}>
          sibling no portal portal
        </Button>

        <Button onClick={() => setSiblingNoBackdrop(true)}>
          sibling no backdrop
        </Button>

        {/* Nested default */}
        <Dialog open={nested} onClose={() => setNested(false)}>
          <DialogHeading>nested</DialogHeading>
          <DialogDismiss>Close</DialogDismiss>

          <Button onClick={() => setNestedNested(true)}>nested nested</Button>

          <Dialog open={nestedNested} onClose={() => setNestedNested(false)}>
            <DialogHeading>nested nested</DialogHeading>
            <DialogDismiss>Close</DialogDismiss>
          </Dialog>
        </Dialog>

        {/* Nested unmount */}
        <Dialog
          open={nestedUnmount}
          onClose={() => setNestedUnmount(false)}
          unmount
        >
          <DialogHeading>nested unmount</DialogHeading>
          <DialogDismiss>Close</DialogDismiss>

          <Button onClick={() => setNestedUnmountNested(true)}>
            nested unmount nested
          </Button>

          <Dialog
            open={nestedUnmountNested}
            onClose={() => setNestedUnmountNested(false)}
            unmount
          >
            <DialogHeading>nested unmount nested</DialogHeading>
            <DialogDismiss>Close</DialogDismiss>
          </Dialog>
        </Dialog>

        {/* Nested no portal */}
        <Dialog
          open={nestedNoPortal}
          onClose={() => setNestedNoPortal(false)}
          portal={false}
        >
          <DialogHeading>nested no portal</DialogHeading>
          <DialogDismiss>Close</DialogDismiss>

          <Button onClick={() => setNestedNoPortalNested(true)}>
            nested no portal nested
          </Button>

          <Dialog
            open={nestedNoPortalNested}
            onClose={() => setNestedNoPortalNested(false)}
            portal={false}
          >
            <DialogHeading>nested no portal nested</DialogHeading>
            <DialogDismiss>Close</DialogDismiss>
          </Dialog>
        </Dialog>

        {/* Nested no backdrop */}
        <Dialog
          open={nestedNoBackdrop}
          onClose={() => setNestedNoBackdrop(false)}
          backdrop={false}
        >
          <DialogHeading>nested no backdrop</DialogHeading>
          <DialogDismiss>Close</DialogDismiss>

          <Button onClick={() => setNestedNoBackdropNested(true)}>
            nested no backdrop nested
          </Button>

          <Dialog
            open={nestedNoBackdropNested}
            onClose={() => setNestedNoBackdropNested(false)}
            backdrop={false}
          >
            <DialogHeading>nested no backdrop nested</DialogHeading>
            <DialogDismiss>Close</DialogDismiss>
          </Dialog>
        </Dialog>

        {/* Nested no portal portal */}
        <Dialog
          open={nestedNoPortalPortal}
          onClose={() => setNestedNoPortalPortal(false)}
          portal={false}
        >
          <DialogHeading>nested no portal portal</DialogHeading>
          <DialogDismiss>Close</DialogDismiss>

          <Button onClick={() => setNestedNoPortalPortalNested(true)}>
            nested no portal portal nested
          </Button>

          <Dialog
            open={nestedNoPortalPortalNested}
            onClose={() => setNestedNoPortalPortalNested(false)}
          >
            <DialogHeading>nested no portal portal nested</DialogHeading>
            <DialogDismiss>Close</DialogDismiss>
          </Dialog>
        </Dialog>
      </Dialog>

      {/* Sibling */}
      <Dialog
        id={siblindId}
        open={sibling}
        style={{ zIndex: 100 }}
        onClose={() => setSibling(false)}
        getPersistentElements={() => [
          document.getElementById(siblingSiblingId)!,
        ]}
      >
        <DialogHeading>sibling</DialogHeading>
        <DialogDismiss>Close</DialogDismiss>
        <Button onClick={() => setSiblingSibling(true)}>sibling sibling</Button>
      </Dialog>

      {/* SiblingSibling */}
      <Dialog
        id={siblingSiblingId}
        open={siblingSibling}
        style={{ zIndex: 100 }}
        onClose={() => setSiblingSibling(false)}
      >
        <DialogHeading>sibling sibling</DialogHeading>
        <DialogDismiss>Close</DialogDismiss>
      </Dialog>

      {/* Sibling unmount */}
      <Dialog
        open={siblingUnmount}
        onClose={() => setSiblingUnmount(false)}
        unmount
      >
        <DialogHeading>sibling unmount</DialogHeading>
        <DialogDismiss>Close</DialogDismiss>
        <Button onClick={() => setSiblingUnmountSibling(true)}>
          sibling unmount sibling
        </Button>
      </Dialog>

      {/* Sibling unmount sibling */}
      <Dialog
        open={siblingUnmountSibling}
        onClose={() => setSiblingUnmountSibling(false)}
        unmount
      >
        <DialogHeading>sibling unmount sibling</DialogHeading>
        <DialogDismiss>Close</DialogDismiss>
      </Dialog>

      {/* Sibling no portal */}
      <Dialog
        id={siblingNoPortalId}
        open={siblingNoPortal}
        style={{ zIndex: 100 }}
        onClose={() => setSiblingNoPortal(false)}
        portal={false}
        getPersistentElements={() => [
          document.getElementById(siblingNoPortalSiblingId)!,
        ]}
      >
        <DialogHeading>sibling no portal</DialogHeading>
        <DialogDismiss>Close</DialogDismiss>
        <Button onClick={() => setSiblingNoPortalSibling(true)}>
          sibling no portal sibling
        </Button>
      </Dialog>

      {/* Sibling no portal sibling */}
      <Dialog
        id={siblingNoPortalSiblingId}
        open={siblingNoPortalSibling}
        style={{ zIndex: 100 }}
        onClose={() => setSiblingNoPortalSibling(false)}
        portal={false}
      >
        <DialogHeading>sibling no portal sibling</DialogHeading>
        <DialogDismiss>Close</DialogDismiss>
      </Dialog>

      {/* Sibling no portal portal */}
      <Dialog
        id={siblingNoPortalPortalId}
        open={siblingNoPortalPortal}
        style={{ zIndex: 100 }}
        onClose={() => setSiblingNoPortalPortal(false)}
        portal={false}
        getPersistentElements={() => [
          document.getElementById(siblingNoPortalPortalSiblingId)!,
        ]}
      >
        <DialogHeading>sibling no portal portal</DialogHeading>
        <DialogDismiss>Close</DialogDismiss>
        <Button onClick={() => setSiblingNoPortalPortalSibling(true)}>
          sibling no portal portal sibling
        </Button>
      </Dialog>

      {/* Sibling no portal portal sibling */}
      <Dialog
        id={siblingNoPortalPortalSiblingId}
        open={siblingNoPortalPortalSibling}
        style={{ zIndex: 100 }}
        onClose={() => setSiblingNoPortalPortalSibling(false)}
      >
        <DialogHeading>sibling no portal portal sibling</DialogHeading>
        <DialogDismiss>Close</DialogDismiss>
      </Dialog>

      {/* Sibling no backdrop */}
      <Dialog
        id={siblingNoBackdropId}
        open={siblingNoBackdrop}
        style={{ zIndex: 100 }}
        onClose={() => setSiblingNoBackdrop(false)}
        backdrop={false}
        getPersistentElements={() => [
          document.getElementById(siblingNoBackdropSiblingId)!,
        ]}
      >
        <DialogHeading>sibling no backdrop</DialogHeading>
        <DialogDismiss>Close</DialogDismiss>
        <Button onClick={() => setSiblingNoBackdropSibling(true)}>
          sibling no backdrop sibling
        </Button>
      </Dialog>

      {/* Sibling no backdrop sibling */}
      <Dialog
        id={siblingNoBackdropSiblingId}
        open={siblingNoBackdropSibling}
        style={{ zIndex: 100 }}
        onClose={() => setSiblingNoBackdropSibling(false)}
        backdrop={false}
      >
        <DialogHeading>sibling no backdrop sibling</DialogHeading>
        <DialogDismiss>Close</DialogDismiss>
      </Dialog>
    </>
  );
}
