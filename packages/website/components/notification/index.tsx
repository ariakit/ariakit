import tw from "../../utils/tw";

const style = {
  wrapper: tw`
    group
    flex items-center gap-2
    p-3
    !rounded-lg border-2 border-solid
    border-black/10 dark:border-white/10
    text-sm !no-underline tracking-normal
    bg-black/[2%] dark:bg-white/[4%]
    hover:bg-black/[4%] dark:hover:bg-white/[6%]
    focus-visible:ariakit-outline
  `,
  badge: tw`
    flex items-center justify-center
    p-1 px-2
    rounded
    text-xs font-semibold tracking-wider
    text-warn-2 dark:text-warn-2-dark
    bg-warn-2 dark:bg-warn-2-dark
  `,
  text: tw`
    text-black dark:text-canvas-5-dark
  `,
  link: tw`
    rounded-lg
    underline group-hover:decoration-[3px] [text-decoration-skip-ink:none]
    text-link dark:text-link-dark
  `,
};

export default function Notification() {
  return (
    <a href="https://newsletter.ariakit.org" className={style.wrapper}>
      <div className={style.badge}>WIP</div>
      <div className={style.text}>
        This site is under construction. You can{" "}
        <span className={style.link}>subscribe to our newsletter</span> to get
        major updates.
      </div>
    </a>
  );
}
