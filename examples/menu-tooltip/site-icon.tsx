export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="pl-8 pt-4">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col gap-2">
              <div className="ml-4 flex w-12 flex-col items-center gap-2 rounded bg-gray-450 p-4 pb-0 dark:bg-gray-300">
                <svg
                  viewBox="0 0 16 16"
                  width={12}
                  height={12}
                  className="-mb-2 flex-none"
                >
                  <foreignObject
                    width={12}
                    height={12}
                    transform="rotate(45 8 8)"
                  >
                    <div className="h-3 w-3 bg-gray-450 dark:bg-gray-300" />
                  </foreignObject>
                </svg>
              </div>
              <div className="ml-[30px] mt-1 h-5 w-5 rounded-md bg-blue-600" />
              <div className="ml-4 flex w-32 flex-col gap-3 rounded-md border border-black/20 bg-white p-3 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
                <div className="h-2 w-16 bg-black/50 dark:bg-white/50" />
                <div className="h-2 w-12 bg-blue-600 dark:bg-blue-500" />
                <div className="h-2 w-14 bg-black/50 dark:bg-white/50" />
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
