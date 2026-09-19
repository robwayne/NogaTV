/** The shell every page shares: a title, a line of attitude, then the goods. */
export function Page({
  index,
  title,
  blurb,
  children,
}: {
  index: string;
  title: string;
  blurb?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14">
      <header className="mb-8 border-b border-vhs-line pb-5">
        <div className="text-xs tracking-[0.3em] text-vhs-cyan">{index}</div>
        <h1 className="chroma mt-2 text-3xl font-bold uppercase leading-none tracking-tight sm:text-5xl">
          {title}
        </h1>
        {blurb ? <p className="mt-4 max-w-2xl text-sm leading-relaxed text-vhs-dim">{blurb}</p> : null}
      </header>
      {children}
    </div>
  );
}
