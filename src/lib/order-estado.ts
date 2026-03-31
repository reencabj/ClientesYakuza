import { cn } from "@/lib/utils";

export const PORTAL_ACTIVE_STATES = ["pendiente", "en_preparacion"] as const;
export const PORTAL_CLOSED_STATES = ["entregado", "cancelado"] as const;

export function isPedidoActivoPortal(estado: string): boolean {
  return (PORTAL_ACTIVE_STATES as readonly string[]).includes(estado);
}

export function estadoLabel(estado: string): string {
  const map: Record<string, string> = {
    pendiente: "Pendiente",
    en_preparacion: "En preparación",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };
  return map[estado] ?? estado.replaceAll("_", " ");
}

/** Colores por estado; `en_preparacion` distingue de pendiente. */
export function estadoBadgeClass(estado: string): string {
  switch (estado) {
    case "pendiente":
      return "border-amber-500/45 bg-amber-950/40 text-amber-100";
    case "en_preparacion":
      return "border-sky-500/50 bg-sky-950/50 text-sky-100";
    case "entregado":
      return "border-emerald-600/45 bg-emerald-950/40 text-emerald-100";
    case "cancelado":
      return "border-rose-500/35 bg-rose-950/30 text-rose-100/95";
    default:
      return "border-border bg-muted/80 text-muted-foreground";
  }
}

export function estadoBadgeClassName(estado: string) {
  return cn("inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium", estadoBadgeClass(estado));
}
