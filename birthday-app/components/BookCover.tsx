import type { LibraryBook } from "@/lib/store";

/**
 * A generated cover: no artwork to work with, so the book gets a spine, a
 * gradient and its own title set properly.
 */
export function BookCover({ book, size = "md" }: { book: LibraryBook; size?: "sm" | "md" | "lg" }) {
  const width = size === "lg" ? "w-36" : size === "sm" ? "w-20" : "w-28";
  const title = size === "lg" ? "text-base" : size === "sm" ? "text-[0.6rem]" : "text-xs";

  return (
    <div
      className={`${width} relative aspect-[2/3] shrink-0 overflow-hidden rounded-sm shadow-[0_10px_30px_-12px_rgba(0,0,0,0.9)]`}
      style={{
        background: `linear-gradient(145deg, ${book.color}, color-mix(in srgb, ${book.color} 35%, #07060d))`,
      }}
    >
      {/* the spine */}
      <div
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: "rgba(0,0,0,0.45)", boxShadow: "1px 0 0 rgba(255,255,255,0.12)" }}
      />
      <div className="flex h-full flex-col justify-between p-2.5 pl-4">
        <div
          className={`${title} font-bold leading-tight text-black/80`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {book.title}
        </div>
        <div className="text-[0.55rem] uppercase tracking-[0.1em] text-black/55">{book.author}</div>
      </div>
    </div>
  );
}
