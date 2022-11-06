import { useRef } from "react";
import { Button } from "ariakit/button";
import {
  Dialog,
  DialogDismiss,
  DialogHeading,
  useDialogStore,
} from "ariakit/dialog/store";
import { VisuallyHidden } from "ariakit/visually-hidden";
import {
  Link,
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import "./style.css";

function Tweet() {
  const initialFocusRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const dialog = useDialogStore({
    open: true,
    setOpen: (open) => {
      if (!open) {
        navigate("/");
      }
    },
  });
  return (
    <Dialog
      store={dialog}
      portal={typeof window !== "undefined"}
      initialFocusRef={initialFocusRef}
      className="dialog"
    >
      <DialogDismiss as={Link} to="/" className="button secondary dismiss" />
      <DialogHeading hidden className="heading">
        Tweet
      </DialogHeading>
      <form className="form">
        <label>
          <VisuallyHidden>Tweet text</VisuallyHidden>
          <textarea
            ref={initialFocusRef}
            placeholder="What's happening?"
            className="input"
            rows={5}
          />
        </label>
        <Button onClick={dialog.toggle} className="button">
          Tweet
        </Button>
      </form>
    </Dialog>
  );
}

function Home() {
  return (
    <>
      <Link to="/tweet" className="button">
        Tweet
      </Link>
      <Outlet />
    </>
  );
}

export default function Example() {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="/tweet" element={<Tweet />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
