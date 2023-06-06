import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  const dialog = Ariakit.useDialogStore();
  const mounted = dialog.useState("mounted");
  return (
    <>
      <Ariakit.Button onClick={dialog.show} className="button">
        View recipe
      </Ariakit.Button>
      <Ariakit.Dialog
        store={dialog}
        backdrop={false}
        className="dialog"
        render={(props) => (
          <div className="backdrop" hidden={!mounted}>
            <div {...props} />
          </div>
        )}
      >
        <div className="header">
          <Ariakit.DialogHeading className="heading">
            Homemade Cake
          </Ariakit.DialogHeading>
          <Ariakit.DialogDismiss className="button secondary">
            Close
          </Ariakit.DialogDismiss>
        </div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
          vehicula nisl leo, eget posuere turpis suscipit id. Sed auctor purus
          urna, imperdiet consectetur est laoreet id. Donec vehicula enim vitae
          sem molestie commodo quis in lacus. Vestibulum ligula felis, interdum
          non risus ut, ultrices euismod urna. Aenean euismod elit tortor, in
          porttitor risus ornare in. Maecenas condimentum a enim a lacinia.
          Pellentesque volutpat hendrerit suscipit. Cras pulvinar nunc vitae
          justo semper, eu fermentum lorem vulputate. Nulla facilisi. Etiam
          vestibulum tellus congue urna consectetur, ac mattis massa varius.
          Etiam vel tellus arcu. Donec a vestibulum orci, ut fringilla sem. Sed
          vitae augue id lorem tempor imperdiet at et quam.
        </p>
        <p>
          Morbi vitae luctus mauris, fermentum vehicula orci. Duis et lobortis
          nunc, non tempor metus. Curabitur ultrices ante a lorem ornare, vel
          venenatis felis molestie. Fusce orci nunc, maximus ullamcorper ipsum
          non, tristique sagittis diam. Donec sed ante vel massa feugiat
          condimentum. Sed rutrum leo id velit semper vulputate. Sed varius sit
          amet massa sit amet sagittis. Maecenas vel accumsan sem. Nunc commodo
          tincidunt urna et ultricies. Ut et dolor eget lacus consectetur
          ultricies. Aenean condimentum libero mi, nec accumsan mi lacinia sed.
          Pellentesque pharetra lacus elit, vel aliquam dui tincidunt ut. In
          rhoncus porttitor pharetra. Etiam placerat ligula quis metus imperdiet
          suscipit.
        </p>
        <p>
          Pellentesque maximus eu magna at pellentesque. Pellentesque habitant
          morbi tristique senectus et netus et malesuada fames ac turpis
          egestas. Sed vel faucibus leo. Vivamus at mi vel ligula suscipit
          malesuada. Aliquam pharetra magna convallis, mattis ipsum id,
          venenatis risus. Suspendisse pulvinar, mi non condimentum vehicula,
          magna enim gravida risus, id laoreet massa nibh nec purus. Sed
          facilisis, nibh vitae tristique commodo, dolor lacus tempus diam, nec
          blandit massa nulla at leo. Maecenas ut nunc sem. Morbi aliquam nisi
          et felis vehicula, ultricies viverra massa pharetra. Vestibulum
          suscipit feugiat libero ac pulvinar. Nullam ullamcorper augue sed
          consequat lacinia. Nam nec nunc eget tellus maximus ullamcorper sit
          amet vitae nunc. Mauris dignissim mi nunc, nec tincidunt mauris mattis
          in. In porta semper est eu imperdiet. Sed volutpat, felis vel iaculis
          euismod, sapien lorem egestas diam, non elementum risus nisi vitae
          sem. Nulla vehicula elementum egestas.
        </p>
        <p>
          Vivamus varius velit quis facilisis cursus. Cras malesuada turpis ac
          leo gravida, a consectetur diam tincidunt. Nam fermentum, lacus vitae
          laoreet efficitur, velit neque cursus nisi, in elementum ante turpis
          vitae nisi. Sed in varius mauris. Aliquam in interdum mauris. Morbi
          commodo metus arcu, vitae tincidunt mauris lacinia aliquam. Aliquam in
          viverra purus, ac pulvinar nunc.
        </p>
        <p>
          Duis hendrerit a lacus nec tincidunt. Quisque aliquet enim eget
          molestie facilisis. Nulla lacinia est lectus, id lobortis odio
          bibendum eget. Nulla id bibendum nunc. Vestibulum ornare est eu tempus
          dignissim. Vestibulum porta porttitor eleifend. Morbi velit tortor,
          interdum pretium nibh quis, volutpat maximus tortor. Duis varius lacus
          id bibendum ullamcorper. Duis ac mi vitae nisi finibus semper non vel
          quam.
        </p>
      </Ariakit.Dialog>
    </>
  );
}
