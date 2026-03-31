import { Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import {
  estadoBadgeClassName,
  estadoLabel,
  isPedidoActivoPortal,
} from "@/lib/order-estado";
import { fetchMyOrders, type OrderListRow } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatDate(s: string | null) {
  if (!s) return "—";
  try {
    return new Date(s + (s.length === 10 ? "T12:00:00" : "")).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
}

function formatMoney(n: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
}

function sortByCreatedDesc(a: OrderListRow, b: OrderListRow) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

type OrderRowProps = {
  o: OrderListRow;
  compact?: boolean;
};

function OrderRow({ o, compact }: OrderRowProps) {
  const pad = compact ? "px-2.5 py-2" : "px-3 py-3.5";
  const titleCls = compact ? "text-xs font-medium" : "text-sm font-semibold";
  const metaCls = compact ? "text-[11px] text-muted-foreground" : "text-xs text-muted-foreground";
  const moneyCls = compact ? "text-[11px]" : "text-xs";

  return (
    <li className={`${pad} transition-colors hover:bg-primary/5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`${titleCls} text-foreground`}>{o.cliente_nombre}</span>
        <span className={estadoBadgeClassName(o.estado)}>{estadoLabel(o.estado)}</span>
      </div>
      <div className={`mt-1 grid gap-1 sm:grid-cols-2 ${metaCls}`}>
        <span>
          {o.cantidad_meta_kilos} kg meta · {formatDate(o.fecha_pedido)}
        </span>
        <span className="sm:text-right">
          <span className={compact ? "text-muted-foreground" : undefined}>Total sugerido: </span>
          <span className={`font-medium tabular-nums text-foreground/95 ${moneyCls}`}>{formatMoney(o.total_sugerido)}</span>
        </span>
      </div>
    </li>
  );
}

export function MyOrdersPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<OrderListRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const uid = user?.id;
    if (!uid) {
      setRows([]);
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await fetchMyOrders(uid);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los pedidos.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const { activos, historial } = useMemo(() => {
    if (!rows?.length) return { activos: [] as OrderListRow[], historial: [] as OrderListRow[] };
    const activos = rows.filter((o) => isPedidoActivoPortal(o.estado)).sort(sortByCreatedDesc);
    const historial = rows.filter((o) => !isPedidoActivoPortal(o.estado)).sort(sortByCreatedDesc);
    return { activos, historial };
  }, [rows]);

  return (
    <Card className="overflow-hidden border-border/80 shadow-md shadow-black/20">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 border-b border-border/60 bg-gradient-to-r from-primary/10 via-transparent to-sky-500/5">
        <div>
          <CardTitle className="text-lg">Mis pedidos</CardTitle>
          <CardDescription>Solo pedidos cargados con tu usuario.</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <RefreshCw className="size-4" />}
          Actualizar
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {loading && rows === null ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : !rows?.length ? (
          <p className="text-sm text-muted-foreground">No hay pedidos para mostrar.</p>
        ) : (
          <>
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary ring-2 ring-primary/35" aria-hidden />
                <h2 className="text-sm font-semibold tracking-tight text-foreground">En curso</h2>
                <span className="text-xs text-muted-foreground">pendiente o en preparación</span>
              </div>
              {activos.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
                  No tenés pedidos activos en este momento.
                </p>
              ) : (
                <ul className="divide-y divide-border/80 rounded-xl border border-primary/25 bg-gradient-to-b from-primary/5 to-transparent">
                  {activos.map((o) => (
                    <OrderRow key={o.id} o={o} />
                  ))}
                </ul>
              )}
            </section>

            {historial.length > 0 ? (
              <section className="space-y-2 border-t border-border/60 pt-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historial</h2>
                <p className="text-[11px] text-muted-foreground">Entregados y cancelados</p>
                <ul className="divide-y divide-border/60 rounded-lg border border-border/70 bg-card/40">
                  {historial.map((o) => (
                    <OrderRow key={o.id} o={o} compact />
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
