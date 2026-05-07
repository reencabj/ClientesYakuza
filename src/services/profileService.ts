import { supabase } from "@/lib/supabase";

export type PortalProfile = {
  username: string;
  display_name: string | null;
  role: "admin" | "user" | "cliente" | "cliente_vip";
};

export async function fetchMyProfile(userId: string): Promise<PortalProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("username, display_name, role")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as PortalProfile;
}

/** Nombre de cliente fijo del portal: display_name o username, en minúsculas (misma cuenta). */
export function portalClienteNombre(p: PortalProfile): string {
  const raw = (p.display_name?.trim() || p.username).trim();
  return raw.toLowerCase();
}
