export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="h-full overflow-hidden">
          <div className="ml-6 mt-6 flex w-40 flex-col gap-4 rounded-xl border-4 border-blue-600 bg-white p-4 pb-6 dark:bg-gray-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 p-2">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={4}
                className="h-full w-full stroke-white"
              >
                <path d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="h-2 w-16 bg-black/50 dark:bg-white/50" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
