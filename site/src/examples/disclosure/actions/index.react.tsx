import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
} from "../disclosure.react.tsx";

export default function Example() {
  return (
    <div className="w-240 max-w-[100cqi] grid gap-4">
      <Disclosure className="ak-frame-card">
        <div className="flex justify-between">
          <DisclosureButton>dsadsa</DisclosureButton>
          <div>dsadsa</div>
        </div>
        <DisclosureContent>Content</DisclosureContent>
      </Disclosure>
    </div>
  );
}
