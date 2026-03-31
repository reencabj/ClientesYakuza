import { ClipboardList, LogOut, PackagePlus } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BrandLogo } from "@/components/BrandLogo";
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
      <header className="sticky top-0 z-10 border-b border-border bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <BrandLogo compact />
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
      <main className="mx-auto w-full max-w-3xl flex-1 p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
