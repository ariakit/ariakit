import "./style.css";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogDescription,
  DialogDismiss,
  DialogHeading,
  VisuallyHidden,
} from "@ariakit/react";

export default function Example() {
  const [cartOpen, setCartOpen] = useState(false);
  const [removing, setRemoving] = useState("");
  const [products, setProducts] = useState([
    "Summer T-Shirt",
    "Warm Jacket",
    "Slim Shorts",
  ]);

  const confirmRemove = () => {
    setProducts((products) => {
      return products.filter((product) => product !== removing);
    });
  };

  return (
    <>
      <Button onClick={() => setCartOpen(true)} className="button">
        View Cart
      </Button>

      <Dialog
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        backdrop={<div className="backdrop" />}
        className="dialog"
      >
        <div className="header">
          <DialogHeading className="heading">Your Shopping Cart</DialogHeading>
          <DialogDismiss className="button secondary dismiss" />
        </div>

        <table className="table">
          <tbody className="table-body">
            {products.map((product) => (
              <tr key={product}>
                <td className="table-cell">{product}</td>
                <td className="table-cell">
                  <Button
                    onClick={() => setRemoving(product)}
                    className="button danger"
                  >
                    Remove
                    <VisuallyHidden> {product}</VisuallyHidden>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <DialogDismiss className="button primary">Checkout</DialogDismiss>
      </Dialog>

      <Dialog
        unmountOnHide
        open={!!removing}
        onClose={() => setRemoving("")}
        backdrop={<div className="backdrop" />}
        className="dialog"
      >
        <DialogHeading className="heading">Remove product</DialogHeading>
        <DialogDescription className="description">
          Are you sure you want to remove &quot;{removing}&quot; from your cart?
        </DialogDescription>
        <div className="buttons">
          <DialogDismiss onClick={confirmRemove} className="button danger">
            Remove
          </DialogDismiss>
          <DialogDismiss autoFocus className="button secondary">
            Cancel
          </DialogDismiss>
        </div>
      </Dialog>
    </>
  );
}
