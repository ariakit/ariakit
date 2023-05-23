export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full items-center justify-center p-4">
          <div className="flex flex-col gap-2 rounded-lg border-[3px] border-blue-600 bg-white p-2 dark:bg-gray-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 p-2">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={4}
                className="h-full w-full stroke-white"
              >
                <path d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="h-2 w-14 bg-black/50 dark:bg-white/50" />
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
