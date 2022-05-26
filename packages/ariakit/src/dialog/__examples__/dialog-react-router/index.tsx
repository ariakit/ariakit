import { Button } from "ariakit/button";
import {
  Dialog,
  DialogDismiss,
  DialogHeading,
  useDialogState,
} from "ariakit/dialog";
import { Link, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import "./style.css";

function Login() {
  const navigate = useNavigate();
  const dialog = useDialogState({
    visible: true,
    setVisible: (visible) => {
      if (!visible) {
        navigate("/");
      }
    },
  });
  return (
    <Dialog state={dialog} modal={false} className="dialog">
      <header className="header">
        <DialogHeading className="heading">Log in</DialogHeading>
        <DialogDismiss as={Link} to="/" className="button dismiss" />
      </header>
      <form className="form">
        <label className="label">
          Username
          <input className="input" type="text" />
        </label>
        <label className="label">
          Password
          <input className="input" type="password" />
        </label>
        <Button onClick={dialog.toggle} className="button">
          Log in
        </Button>
      </form>
    </Dialog>
  );
}

function Home() {
  return (
    <>
      <Link to="/login" className="button">
        Log in
      </Link>
      <Outlet />
    </>
  );
}

export default function Example() {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>
  );
}
