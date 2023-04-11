import * as Ariakit from "@ariakit/react";
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
  const navigate = useNavigate();
  const dialog = Ariakit.useDialogStore({
    open: true,
    setOpen: (open) => {
      if (!open) {
        navigate("/");
      }
    },
  });
  return (
    <Ariakit.Dialog
      store={dialog}
      portal={typeof window !== "undefined"}
      className="dialog"
    >
      <Ariakit.DialogDismiss
        as={Link}
        to="/"
        className="button secondary dismiss"
      />
      <Ariakit.DialogHeading hidden className="heading">
        Tweet
      </Ariakit.DialogHeading>
      <form className="form">
        <label>
          <Ariakit.VisuallyHidden>Tweet text</Ariakit.VisuallyHidden>
          <Ariakit.Focusable
            as="textarea"
            className="input"
            placeholder="What's happening?"
            rows={5}
            autoFocus
          />
        </label>
        <Ariakit.Button onClick={dialog.toggle} className="button">
          Tweet
        </Ariakit.Button>
      </form>
    </Ariakit.Dialog>
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
