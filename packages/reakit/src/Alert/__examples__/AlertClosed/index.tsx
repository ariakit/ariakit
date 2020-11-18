import * as React from "react";
import { Alert as AlertComponent } from "reakit/Alert";
import { Button } from "reakit/Button";
import { useAlertState } from "reakit/Alert/AlertState";

export default function AlertAsAside() {
  const alert = useAlertState({ visible: false });
  return (
    <>
      <Button onClick={() => alert.toggle()}>Toggle</Button>
      <AlertComponent {...alert}>Alert</AlertComponent>
    </>
  );
}
