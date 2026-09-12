import "./style.css";

const surface = "ak-layer ak-layer-3 ak-ink-0 ak-frame ak-frame-lg/3 border";

export default function Example() {
  return (
    <div className="ak-layer ak-layer-white dark:ak-layer-gray-950 grid gap-4 p-6">
      <button className={surface} disabled>
        Native disabled
        <span className="ak-layer ak-layer-blue-600 ak-ink-0 block">
          Native badge
        </span>
        <span className="ak-text ak-text-blue-600 block">
          Native colored text
        </span>
      </button>
      <button className={surface} aria-disabled="true">
        ARIA disabled
      </button>
      <label className={`${surface} ak-disabled`}>
        <input type="file" disabled className="sr-only" />
        Disabled upload
        <span className="ak-layer ak-layer-blue-600 ak-ink-0 block">
          Upload badge
        </span>
        <span className="ak-text ak-text-blue-600 block">
          Upload colored text
        </span>
      </label>
      <button className={`${surface} ak-disabled`} disabled>
        Both disabled paths
      </button>
      <button className={surface}>Enabled</button>
    </div>
  );
}
