export function Section({
  id,
  index,
  title,
  blurb,
  children,
}: {
  id: string;
  index: string;
  title: string;
  blurb?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-5xl px-4 py-14 sm:py-20">
      <header className="mb-8 border-b border-vhs-line pb-4">
        <div className="flex items-baseline gap-3">
          <span className="text-xs tracking-[0.3em] text-vhs-cyan">{index}</span>
          <h2 className="chroma-soft text-xl font-bold uppercase tracking-[0.2em] sm:text-2xl">
            {title}
          </h2>
        </div>
        {blurb ? <p className="mt-2 max-w-2xl text-sm text-vhs-dim">{blurb}</p> : null}
      </header>
      {children}
    </section>
  );
}
