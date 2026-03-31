type BrandLogoProps = {
  compact?: boolean;
  subtitle?: string;
  className?: string;
};

export function BrandLogo({ compact = false, subtitle, className = "" }: BrandLogoProps) {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img src="/logo.png" alt="Logo Yakuza Meta" className="h-8 w-8 rounded-lg" />
        <span className="text-sm font-semibold tracking-wide text-foreground">Yakuza Meta</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <img src="/logo.png" alt="Logo Yakuza Meta" className="mb-3 h-16 w-16 rounded-xl" />
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Yakuza Meta</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
