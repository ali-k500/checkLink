import { Link, useLocation } from "wouter";
import { Shield, Activity, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "الفحص", icon: Activity },
    { href: "/dashboard", label: "لوحة التحكم", icon: ShieldAlert },
  ];

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:glow-primary transition-all duration-300">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">checkLink</span>
        </Link>
        
        <nav className="flex items-center gap-2">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium",
                location === link.href 
                  ? "bg-primary/10 text-primary border border-primary/20 glow-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}