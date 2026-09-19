import { serviceById } from "@/lib/services";

/**
 * The little "where to watch" chip. `fallback` marks it as the Stremio default
 * rather than something either of us actually chose, so it sits back a bit.
 */
export function ServiceBadge({
  id,
  fallback = false,
  size = "sm",
  title,
}: {
  id: string | undefined;
  fallback?: boolean;
  size?: "xs" | "sm" | "md";
  title?: string;
}) {
  const service = serviceById(id);
  const padding = size === "md" ? "px-2.5 py-1.5" : size === "sm" ? "px-2 py-1" : "px-1.5 py-0.5";
  const text = size === "md" ? "text-[0.7rem]" : size === "xs" ? "text-[0.5rem]" : "text-[0.55rem]";

  return (
    <span
      title={title ?? (fallback ? `${service.name} (assumed)` : `On ${service.name}`)}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-sm border font-bold uppercase leading-none tracking-[0.08em] ${padding} ${text}`}
      style={{
        borderColor: service.color,
        color: service.color,
        background: `color-mix(in srgb, ${service.color} 12%, transparent)`,
        opacity: fallback ? 0.55 : 1,
      }}
    >
      {service.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={service.image} alt={service.name} className="h-3 w-auto" />
      ) : (
        service.name
      )}
    </span>
  );
}
