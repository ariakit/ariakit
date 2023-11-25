export function CodePlaceholder() {
  const pink = "bg-[#AF00DB] dark:bg-[#C586C0]";
  const orange = "bg-[#A31515] dark:bg-[#CE9178]";
  const blue = "bg-[#001080] dark:bg-[#9CDCFE]";
  const darkBlue = "bg-[#0000FF] dark:bg-[#569CD6]";
  const yellow = "bg-[#795E26] dark:bg-[#DCDCAA]";
  const green = "bg-[#267F99] dark:bg-[#4EC9B0]";
  const foreground = "bg-[#000000] dark:bg-[#D4D4D4]";
  return (
    <div className="relative opacity-20 [&>*>*]:h-3 [&>*>*]:rounded-sm [&>*]:flex [&>*]:h-[21px] [&>*]:items-center [&>*]:gap-3">
      <div>
        <div className={`w-16 ${pink}`} />
        <div className={`w-24 ${orange}`} />
      </div>
      <div>
        <div className={`w-16 ${pink}`} />
        <div className={`w-32 ${blue}`} />
        <div className={`w-10 ${pink}`} />
        <div className={`w-10 ${orange}`} />
      </div>
      <div />
      <div>
        <div className={`w-14 ${pink}`} />
        <div className={`w-16 ${pink}`} />
        <div className={`w-20 ${darkBlue}`} />
        <div className={`w-20 ${yellow}`} />
        <div className={`w-4 ${foreground}`} />
      </div>
      <div>
        <div />
        <div className={`w-20 ${pink}`} />
        <div className={`w-4 ${foreground}`} />
      </div>
      <div>
        <div />
        <div />
        <div className={`w-10 ${darkBlue}`} />
        <div className={`w-16 ${blue}`} />
        <div className={`w-14 ${orange}`} />
      </div>
      <div>
        <div />
        <div />
        <div />
        <div className={`w-56 ${green}`} />
      </div>
      <div>
        <div />
        <div />
        <div />
        <div />
        <div className={`w-12 ${darkBlue}`} />
        <div className={`w-16 ${blue}`} />
        <div className={`w-12 ${orange}`} />
      </div>
      <div>
        <div />
        <div />
        <div />
        <div />
        <div />
        <div className={`w-40 ${foreground}`} />
      </div>
      <div className="absolute inset-0 !h-full bg-gradient-to-b from-white/0 to-white dark:from-gray-850/0 dark:to-gray-850" />
    </div>
  );
}
