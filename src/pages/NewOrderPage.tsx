import { Loader2 } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BOLSAS_PER_KG_META } from "@/lib/meta-bags";
import { createOrder, previewSuggestedOrderTotal } from "@/services/orderService";
import {
  fetchMyProfile,
  portalClienteNombre,
  type PortalProfile,
} from "@/services/profileService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function todayIsoDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
}

export function NewOrderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [kg, setKg] = useState("");
  const [fechaEncargo, setFechaEncargo] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [preview, setPreview] = useState<{ precioPorKg: number; total: number } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewSeq = useRef(0);

  useEffect(() => {
    if (!user?.id) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    setProfileError(null);
    void fetchMyProfile(user.id)
      .then((p) => {
        setProfile(p);
      })
      .catch((e) => {
        setProfile(null);
        setProfileError(e instanceof Error ? e.message : "No se pudo cargar tu perfil.");
      })
      .finally(() => setProfileLoading(false));
  }, [user?.id]);

  const clienteNombreFijo = useMemo(() => (profile ? portalClienteNombre(profile) : ""), [profile]);

  const kgNum = useMemo(() => parseFloat(kg.replace(",", ".")), [kg]);
  const bolsas = useMemo(() => {
    if (!Number.isFinite(kgNum) || kgNum <= 0) return null;
    return Math.round(kgNum * BOLSAS_PER_KG_META);
  }, [kgNum]);

  useEffect(() => {
    if (!Number.isFinite(kgNum) || kgNum <= 0) {
      setPreview(null);
      setPreviewError(null);
      setPreviewLoading(false);
      return;
    }

    const seq = ++previewSeq.current;
    setPreviewLoading(true);
    setPreviewError(null);

    const t = window.setTimeout(() => {
      void previewSuggestedOrderTotal(kgNum)
        .then((p) => {
          if (previewSeq.current !== seq) return;
          setPreview(p);
          setPreviewError(null);
        })
        .catch((e) => {
          if (previewSeq.current !== seq) return;
          setPreview(null);
          setPreviewError(e instanceof Error ? e.message : "No se pudo calcular el precio.");
        })
        .finally(() => {
          if (previewSeq.current !== seq) return;
          setPreviewLoading(false);
        });
    }, 280);

    return () => window.clearTimeout(t);
  }, [kgNum]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user?.id || !profile) {
      setError("Tenés que iniciar sesión con usuario y contraseña.");
      return;
    }
    if (!Number.isFinite(kgNum) || kgNum <= 0) {
      setError("Indicá una cantidad válida en kilos.");
      return;
    }
    const nombre = portalClienteNombre(profile);
    if (!nombre) {
      setError("Tu perfil no tiene un nombre de cliente válido.");
      return;
    }
    const fechaPedido = todayIsoDate();
    const resumen = [
      `Cliente: ${nombre}`,
      `Kilos: ${kgNum}`,
      `Bolsas estimadas: ${bolsas ?? "-"}`,
      `Fecha del pedido: ${fechaPedido}`,
      `Fecha de entrega: ${fechaEncargo.trim() === "" ? "Sin especificar" : fechaEncargo}`,
      `Notas: ${notas.trim() === "" ? "Sin notas" : notas.trim()}`,
    ].join("\n");
    const confirmar = window.confirm(`Confirmá el pedido con estos datos:\n\n${resumen}`);
    if (!confirmar) return;

    setSaving(true);
    try {
      await createOrder({
        cliente_nombre: nombre,
        cantidad_meta_kilos: kgNum,
        fecha_pedido: fechaPedido,
        fecha_encargo: fechaEncargo.trim() === "" ? null : fechaEncargo,
        notas: notas.trim() === "" ? null : notas.trim(),
      });
      navigate("/mis-pedidos", { replace: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el pedido.");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit =
    !!user && !!profile && !profileLoading && Number.isFinite(kgNum) && kgNum > 0 && !saving;

  return (
    <Card className="border-border/70 bg-card/90 shadow-lg backdrop-blur">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-4xl font-bold tracking-tight">Nuevo pedido</CardTitle>
        <CardDescription className="mx-auto max-w-2xl text-base">
          Cargá los datos del pedido. El cliente se toma de tu cuenta y el total se calcula con la tarifa vigente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {profileLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando tu perfil…
          </p>
        ) : profileError ? (
          <p className="text-sm text-destructive">{profileError}</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <p className="rounded-md border border-border/80 bg-background/40 px-3 py-2.5 text-base font-medium text-foreground">
                {clienteNombreFijo}
              </p>
              <p className="text-xs text-muted-foreground">Dato autocompletado desde tu perfil.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="kg">Kilos de meta</Label>
                <Input
                  id="kg"
                  inputMode="decimal"
                  value={kg}
                  onChange={(e) => setKg(e.target.value)}
                  placeholder="Ejemplo: 2"
                  required
                  disabled={saving}
                />
                {bolsas != null ? (
                  <p className="text-xs text-muted-foreground">Estimado: {bolsas} bolsas ({BOLSAS_PER_KG_META} por kilo)</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaEncargo">Fecha de entrega (opcional)</Label>
                <Input
                  id="fechaEncargo"
                  type="date"
                  value={fechaEncargo}
                  onChange={(e) => setFechaEncargo(e.target.value)}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">Indicá el día en que querés recibir la meta.</p>
              </div>
            </div>

            {Number.isFinite(kgNum) && kgNum > 0 ? (
              <div className="rounded-md border border-border bg-card/80 px-3 py-3 text-sm">
                {previewLoading ? (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Calculando precio…
                  </p>
                ) : previewError ? (
                  <p className="text-destructive">{previewError}</p>
                ) : preview ? (
                  <div className="space-y-1">
                    <p className="text-muted-foreground">
                      Precio sugerido: <span className="font-medium text-foreground">{formatMoney(preview.precioPorKg)}</span>{" "}
                      por kg
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      Total estimado: {formatMoney(preview.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">Se confirma al guardar el pedido (misma regla que el sistema).</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                disabled={saving}
                rows={3}
                placeholder="Ej: numero de telefono, referencia de entrega, etc."
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex justify-center">
              <Button type="submit" disabled={!canSubmit} className="h-12 w-full text-base font-semibold">
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Guardando…
                  </>
                ) : (
                  "Crear pedido"
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
