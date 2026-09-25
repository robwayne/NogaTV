import { INSPIRATIONS, LETTER, SITE } from "@/data/content";

export function Inspirations() {
  return (
    <div className="space-y-10">
      <ol className="space-y-6">
        {INSPIRATIONS.map((item, i) => (
          <li key={i} className="border-l-2 border-vhs-line pl-5">
            <div className="text-[0.6rem] uppercase tracking-[0.35em] text-vhs-magenta">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="mt-1 text-lg font-bold">{item.heading}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-vhs-dim">{item.body}</p>
          </li>
        ))}
      </ol>

      <div className="tape rounded-md p-6 sm:p-8">
        {LETTER.split(/\n\s*\n/).map((para, i) => (
          <p key={i} className="mb-4 text-sm leading-7 text-vhs-text last:mb-0">
            {para}
          </p>
        ))}
        <p className="mt-6 text-[0.65rem] uppercase tracking-[0.3em] text-vhs-dim">
          {SITE.fromName}
        </p>
      </div>
    </div>
  );
}
