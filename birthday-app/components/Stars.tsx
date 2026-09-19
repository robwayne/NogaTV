"use client";

export function Stars({
  value,
  onChange,
  size = "sm",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md";
}) {
  const cls = size === "md" ? "text-lg" : "text-sm";
  return (
    <span className={`inline-flex gap-0.5 ${cls}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        if (!onChange) {
          return (
            <span key={n} className={filled ? "text-vhs-amber" : "text-vhs-line"}>
              ★
            </span>
          );
        }
        return (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(n === value ? 0 : n)}
            className={`transition-colors hover:text-vhs-amber ${
              filled ? "text-vhs-amber" : "text-vhs-line"
            }`}
          >
            ★
          </button>
        );
      })}
    </span>
  );
}
