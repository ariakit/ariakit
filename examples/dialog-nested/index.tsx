import { useState } from "react";
import * as Ariakit from "@ariakit/react";
import { ConfirmDialog } from "./confirm-dialog.js";
import "./style.css";

export default function Example() {
  const dialog = Ariakit.useDialogStore();

  const [removing, setRemoving] = useState("");
  const [products, setProducts] = useState([
    "Summer T-Shirt",
    "Warm Jacket",
    "Slim Shorts",
  ]);

  return (
    <>
      <Ariakit.Button onClick={dialog.show} className="button">
        View Cart
      </Ariakit.Button>

      <Ariakit.Dialog
        store={dialog}
        backdrop={<div className="backdrop" />}
        className="dialog"
      >
        <div className="header">
          <Ariakit.DialogHeading className="heading">
            Your Shopping Cart
          </Ariakit.DialogHeading>
          <Ariakit.DialogDismiss className="button secondary dismiss" />
        </div>

        <table className="table">
          <tbody className="table-body">
            {products.map((product) => (
              <tr key={product}>
                <td className="table-cell">{product}</td>
                <td className="table-cell">
                  <Ariakit.Button
                    onClick={() => setRemoving(product)}
                    className="button danger"
                  >
                    Remove
                    <Ariakit.VisuallyHidden> {product}</Ariakit.VisuallyHidden>
                  </Ariakit.Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Ariakit.DialogDismiss className="button">
          Checkout
        </Ariakit.DialogDismiss>

        <ConfirmDialog
          title="Remove product"
          description={`Are you sure you want to remove "${removing}" from your cart?`}
          confirmLabel="Remove"
          danger
          open={!!removing}
          onConfirm={() =>
            setProducts((products) =>
              products.filter((product) => product !== removing),
            )
          }
          onClose={() => setRemoving("")}
        />
      </Ariakit.Dialog>
    </>
  );
}
