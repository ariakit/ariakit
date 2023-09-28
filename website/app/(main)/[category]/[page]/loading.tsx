export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col items-start justify-center md:flex-row-reverse">
      <div className="sticky top-32 m-4 hidden h-screen max-h-[calc(100vh-theme(spacing.36))] w-60 flex-none flex-col gap-8 border-l border-black/10 dark:border-white/10 md:flex">
        <div className="w-full flex-1 flex-col gap-4 overflow-auto p-3 pr-1">
          <div className="flex flex-col gap-2 p-2 md:p-0 md:text-sm">
            <div className="h-6 w-full rounded-lg bg-black/10 dark:bg-white/10" />
            <div className="h-6 w-full rounded-lg bg-black/10 dark:bg-white/10" />
            <div className="h-6 w-full rounded-lg bg-black/10 dark:bg-white/10" />
          </div>
        </div>
      </div>
      <div className="relative mt-8 flex min-h-screen w-full min-w-[1px] max-w-5xl flex-col items-center gap-8 px-3 md:mt-14 md:px-4 lg:px-8">
        <div className="flex w-full flex-col items-center gap-8 [&>*]:w-full [&>*]:max-w-3xl">
          <div className="w-full">
            <div className="h-12 w-3/4 rounded-lg bg-black/10 dark:bg-white/10" />
          </div>
          <div className="flex -translate-y-2 flex-col gap-2">
            <div className="h-5 w-full rounded-lg bg-black/10 dark:bg-white/10 sm:h-6" />
            <div className="h-5 w-full rounded-lg bg-black/10 dark:bg-white/10 sm:h-6" />
            <div className="h-5 w-1/2 rounded-lg bg-black/10 dark:bg-white/10 sm:h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
