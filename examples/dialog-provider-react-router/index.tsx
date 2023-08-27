import "./style.css";
import * as Ariakit from "@ariakit/react";
import { DialogProvider } from "@ariakit/react-core/dialog/dialog-provider";
import {
  Link,
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

function Tweet() {
  const navigate = useNavigate();
  const hide = () => navigate("/");
  return (
    <DialogProvider
      open
      setOpen={(open) => {
        if (!open) {
          hide();
        }
      }}
    >
      <Ariakit.Dialog
        backdrop={<div className="backdrop" />}
        className="dialog"
      >
        <Ariakit.DialogDismiss
          className="button secondary dismiss"
          render={<Link to="/" />}
        />
        <Ariakit.DialogHeading hidden>Tweet</Ariakit.DialogHeading>
        <form className="form" onSubmit={hide}>
          <label>
            <Ariakit.VisuallyHidden>Tweet text</Ariakit.VisuallyHidden>
            <Ariakit.Focusable
              autoFocus
              className="input"
              render={<textarea placeholder="What's happening?" rows={5} />}
            />
          </label>
          <Ariakit.Button type="submit" className="button primary">
            Tweet
          </Ariakit.Button>
        </form>
      </Ariakit.Dialog>
    </DialogProvider>
  );
}

function Home() {
  return (
    <>
      <Link to="/tweet" className="button primary">
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
