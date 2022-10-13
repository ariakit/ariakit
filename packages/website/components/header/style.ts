import tw from "../../utils/tw";

export const popoverStyle = tw`
  flex flex-col
  overflow-hidden
  max-h-[min(var(--popover-available-height,800px),800px)]
  shadow-lg dark:shadow-lg-dark
  text-black dark:text-white
  rounded-lg border border-gray-250 dark:border-gray-600
  bg-white dark:bg-gray-700
  outline-none
  z-50
`;

export const popoverScrollerStyle = tw`
  flex flex-col
  p-2
  overflow-auto overscroll-contain
  bg-[color:inherit]
`;

export const separatorStyle = tw`
  w-full my-2 h-0
  border-t border-gray-250 dark:border-gray-550
`;

export const itemIconStyle = tw`
  w-4 h-4
  stroke-black/75 dark:stroke-white/75 group-active-item:stroke-current
`;
