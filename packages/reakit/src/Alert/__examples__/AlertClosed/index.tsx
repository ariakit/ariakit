import * as React from "react";
import { Alert as AlertComponent } from "reakit/Alert";
import { Button } from "reakit/Button";
import { useAlertState } from "reakit/Alert/AlertState";

export default function AlertClosed() {
  const alert = useAlertState({ visible: false });
  return (
    <>
      <AlertComponent {...alert}>Alert</AlertComponent>
      <Button onClick={() => alert.toggle()}>Toggle</Button>
    </>
  );
}
