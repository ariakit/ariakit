export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full items-center justify-center p-4">
          <div className="flex items-center justify-center rounded bg-blue-600 p-2">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={4}
              className="h-8 w-8 stroke-white dark:stroke-white/90"
            >
              <path d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
