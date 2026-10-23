import {
  Input,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import { useId } from "react";

export default function Example() {
  const id = useId();
  return (
    <div className="grid w-[30rem] max-w-full grid-cols-[repeat(auto-fill,minmax(min(100%,13rem),1fr))] gap-x-5 gap-y-6">
      <InputField>
        <InputLabel htmlFor={`${id}-coupon`}>Coupon</InputLabel>
        <Input id={`${id}-coupon`} placeholder="SPRING-25" $rounded="full" />
      </InputField>
      {/* The field and its input scale with the font size around them. */}
      <InputField className="text-sm">
        <InputLabel htmlFor={`${id}-filter`}>Filter</InputLabel>
        <Input id={`${id}-filter`} placeholder="Type to filter" />
      </InputField>
      {/* Less padding fits dense layouts, such as rows in a table. */}
      <InputField>
        <InputLabel htmlFor={`${id}-quantity`}>Quantity</InputLabel>
        <Input
          id={`${id}-quantity`}
          inputMode="numeric"
          defaultValue="12"
          $p={1}
        />
      </InputField>
      <InputField>
        <InputLabel htmlFor={`${id}-company`}>Company</InputLabel>
        <Input
          id={`${id}-company`}
          placeholder="Analytical Engines Ltd."
          $p={3}
        />
      </InputField>
      {/* $size scales only the input, so the label keeps the size of the
          other labels. */}
      <InputField className="col-span-full">
        <InputLabel htmlFor={`${id}-title`}>Title</InputLabel>
        <Input
          id={`${id}-title`}
          defaultValue="Notes on the Analytical Engine"
          $size="xl"
        />
      </InputField>
    </div>
  );
}
