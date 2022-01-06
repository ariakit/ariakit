const tabs: Record<string, string> = {
  "button.js": `export default function Button() {
  return <button>Button</button>;
}`,
  "checkbox.js": `export default function Checkbox() {
  return <input type="checkbox" />;
}`,
  "input.js": `export default function Input() {
  return <input />;
}`,
  "label.js": `export default function Label() {
  return <label>Label</label>;
}`,
  "radio.js": `export default function Radio() {
  return <input type="radio" />;
}`,
  "select.js": `export default function Select() {
  return (
    <select>
      <option>Option 1</option>
      <option>Option 2</option>
    </select>
  );
}`,
  "textarea.js": `export default function Textarea() {
  return <textarea />;
}`,
  "tab.js": `export default function Tab() {
  return <div>Tab</div>;
}`,
  "number-input.js": `export default function NumberInput() {
  return <input type="number" />;
}`,
  "date-input.js": `export default function DateInput() {
  return <input type="date" />;
}`,
};

export default tabs;
