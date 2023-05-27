export default function Icon() {
  return (
    <svg viewBox="0 0 128 128" width={128} height={128}>
      <foreignObject width={128} height={128}>
        <div className="pl-8 pt-4">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col gap-2">
              <div className="ml-6 h-5 w-12 rounded bg-blue-600" />
              <div className="flex w-32 flex-col gap-2 rounded-md border border-black/20 bg-white p-3 px-1 shadow dark:border-white/10 dark:bg-white/10 dark:shadow-dark">
                <div className="flex items-center gap-2">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={4}
                    className="h-4 w-4 stroke-white/50 dark:stroke-white/50"
                  >
                    <path d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div className="h-2 w-14 bg-black/50 dark:bg-white/50" />
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={4}
                    className="h-4 w-4 stroke-blue-600 dark:stroke-blue-500"
                  >
                    <path d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div className="h-2 w-10 bg-blue-600 dark:bg-blue-500" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4" />
                  <div className="h-2 w-12 bg-black/50 dark:bg-white/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  );
}
