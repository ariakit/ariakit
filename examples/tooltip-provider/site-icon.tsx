export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="flex h-full flex-col items-center justify-center gap-4 p-5">
          <div className="flex w-14 flex-col items-center gap-2 rounded bg-gray-450 p-4 pb-0 dark:bg-gray-300">
            <svg
              viewBox="0 0 16 16"
              width={16}
              height={16}
              className="-mb-2 flex-none"
            >
              <foreignObject width={16} height={16} transform="rotate(45 8 8)">
                <div className="h-3 w-3 bg-gray-450 dark:bg-gray-300" />
              </foreignObject>
            </svg>
          </div>
          <div className="h-2 w-6 bg-blue-600 dark:bg-blue-400" />
        </div>
      </foreignObject>
    </svg>
  );
}
