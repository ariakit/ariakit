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

function Post() {
  const navigate = useNavigate();
  const close = () => navigate("/");
  return (
    <Ariakit.Dialog
      open
      onClose={close}
      backdrop={<div className="backdrop" />}
      className="dialog"
    >
      <Ariakit.DialogDismiss
        className="button secondary dismiss"
        render={<Link to="/" />}
      />
      <Ariakit.DialogHeading hidden>Post</Ariakit.DialogHeading>
      <form className="form" onSubmit={close}>
        <label>
          <Ariakit.VisuallyHidden>Post</Ariakit.VisuallyHidden>
          <Ariakit.Focusable
            autoFocus
            className="input"
            render={<textarea placeholder="What's happening?" rows={5} />}
          />
        </label>
        <Ariakit.Button type="submit" className="button primary">
          Post
        </Ariakit.Button>
      </form>
    </Ariakit.Dialog>
  );
}

function Home() {
  return (
    <>
      <Link to="/post" className="button">
        Post
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
          <Route path="/post" element={<Post />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
