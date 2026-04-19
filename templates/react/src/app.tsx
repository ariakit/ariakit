import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Ariakit.Button
        onClick={() => setOpen(true)}
        className="ak-frame-xl/2.5 px-4 flex items-center justify-center whitespace-nowrap ak-layer-pop-12 hover:ak-layer-hover"
      >
        View details
      </Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        backdrop={
          <div className="ak-layer-current bg-(--ak-layer)/10 ak-dark:bg-(--ak-layer)/30 backdrop-blur-xs transition-[overlay,display,opacity] data-open:opacity-100 data-open:starting:opacity-0 not-data-open:opacity-0" />
        }
        className="grid gap-4 ak-layer ak-frame-force-2xl/4 ak-bordering shadow-2xl z-10 transition-discrete transition-[overlay,display,scale,opacity] max-w-120 data-open:starting:scale-95 data-open:starting:opacity-0 not-data-open:scale-95 not-data-open:opacity-0 [--inset:--spacing(3)] inset-(--inset) fixed m-auto h-fit max-h-[calc(100dvh-var(--inset)*2)]"
      >
        <header className="flex items-center justify-between">
          <Ariakit.DialogHeading className="text-2xl font-medium">
            Apples
          </Ariakit.DialogHeading>
          <Ariakit.DialogDismiss className="ak-frame-lg size-10 grid place-items-center hover:ak-layer-hover" />
        </header>
        <ul>
          <li>
            <strong>Calories:</strong> 95
          </li>
          <li>
            <strong>Carbs:</strong> 25 grams
          </li>
          <li>
            <strong>Fibers:</strong> 4 grams
          </li>
          <li>
            <strong>Vitamin C:</strong> 14% of the Reference Daily Intake (RDI)
          </li>
          <li>
            <strong>Potassium:</strong> 6% of the RDI
          </li>
          <li>
            <strong>Vitamin K:</strong> 5% of the RDI
          </li>
        </ul>
      </Ariakit.Dialog>
    </>
  );
}
