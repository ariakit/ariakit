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
    setOpen(open) {
      if (!open) {
        navigate("/");
      }
    },
  });
  return (
    <Ariakit.Dialog
      store={dialog}
      backdrop={<div className="backdrop" />}
      className="dialog"
    >
      <Ariakit.DialogDismiss
        className="button secondary dismiss"
        render={<Link to="/" />}
      />
      <Ariakit.DialogHeading hidden>Tweet</Ariakit.DialogHeading>
      <form className="form" onSubmit={dialog.hide}>
        <label>
          <Ariakit.VisuallyHidden>Tweet text</Ariakit.VisuallyHidden>
          <Ariakit.Focusable
            autoFocus
            className="input"
            render={<textarea placeholder="What's happening?" rows={5} />}
          />
        </label>
        <Ariakit.Button type="submit" className="button">
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
    // We're using MemoryRouter for demonstration purposes. But you can use
    // BrowserRouter, HashRouter, etc. depending on your needs.
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="/tweet" element={<Tweet />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
