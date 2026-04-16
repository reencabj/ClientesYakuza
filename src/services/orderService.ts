import { supabase } from "@/lib/supabase";

export async function previewSuggestedOrderTotal(kg: number): Promise<{ precioPorKg: number; total: number }> {
  const { data, error } = await supabase.rpc("resolve_suggested_price_per_kg", {
    p_cantidad_meta_kilos: kg,
  });
  if (error) throw error;
  const precioPorKg = Number(data);
  const total = Math.round(kg * precioPorKg * 100) / 100;
  return { precioPorKg, total };
}

export type OrderListRow = {
  id: string;
  cliente_nombre: string;
  cantidad_meta_kilos: number;
  estado: string;
  fecha_pedido: string | null;
  total_sugerido: number | null;
  created_at: string;
};

export async function createOrder(input: {
  cliente_nombre: string;
  cantidad_meta_kilos: number;
  fecha_pedido: string;
  fecha_encargo: string | null;
  notas: string | null;
  /** Para Discord: display_name o username; si falta, se usa cliente_nombre del pedido. */
  cliente_para_notificacion?: string | null;
}): Promise<string> {
  const { data, error } = await supabase.rpc("create_order", {
    p_cliente_nombre: input.cliente_nombre,
    p_cantidad_meta_kilos: input.cantidad_meta_kilos,
    p_fecha_pedido: input.fecha_pedido,
    p_fecha_encargo: input.fecha_encargo,
    p_notas: input.notas,
  });
  if (error) throw error;

  const clienteDiscord = (
    input.cliente_para_notificacion?.trim() ||
    input.cliente_nombre
  ).trim();

  try {
    const { error: notifyError } = await supabase.functions.invoke("notify-discord", {
      body: {
        tipo_evento: "nuevo_pedido",
        cliente: clienteDiscord,
        kilos: input.cantidad_meta_kilos,
      },
    });
    if (notifyError) {
      console.error("Error notificando Discord:", notifyError);
    }
  } catch (err) {
    console.error("Error notificando Discord:", err);
  }

  return data as string;
}

export async function fetchMyOrders(creadoPorUsuarioId: string): Promise<OrderListRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, cliente_nombre, cantidad_meta_kilos, estado, fecha_pedido, total_sugerido, created_at")
    .eq("is_active", true)
    .eq("creado_por_usuario_id", creadoPorUsuarioId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as OrderListRow[];
}
