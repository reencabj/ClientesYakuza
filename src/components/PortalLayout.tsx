import { ClipboardList, LogOut, PackagePlus } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  );

export function PortalLayout() {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Yakuza Meta</span>
          <nav className="flex items-center gap-1">
            <NavLink to="/pedido/nuevo" className={navClass} end>
              <PackagePlus className="size-4" />
              Nuevo pedido
            </NavLink>
            <NavLink to="/mis-pedidos" className={navClass}>
              <ClipboardList className="size-4" />
              Mis pedidos
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            {user?.email ? (
              <span className="hidden max-w-[140px] truncate text-xs text-muted-foreground sm:inline">{user.email}</span>
            ) : null}
            <Button type="button" variant="outline" size="sm" onClick={() => void signOut()}>
              <LogOut className="size-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
