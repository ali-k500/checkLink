import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { ThreatIndicatorSeverity } from "@workspace/api-zod";

export default function ThreatIndicatorCard({ indicator }: { indicator: { category: string, description: string, severity: ThreatIndicatorSeverity } }) {
  const getSeverityDetails = () => {
    switch(indicator.severity) {
      case 'high':
        return {
          icon: AlertTriangle,
          colorClass: "text-destructive",
          bgClass: "bg-destructive/10",
          borderClass: "border-destructive/30",
          glowClass: "shadow-[0_0_10px_0_hsl(var(--destructive)/0.2)]",
          label: "عالي الخطورة"
        };
      case 'medium':
        return {
          icon: AlertCircle,
          colorClass: "text-amber-500",
          bgClass: "bg-amber-500/10",
          borderClass: "border-amber-500/30",
          glowClass: "shadow-[0_0_10px_0_rgba(245,158,11,0.2)]",
          label: "متوسط الخطورة"
        };
      case 'low':
      default:
        return {
          icon: Info,
          colorClass: "text-blue-400",
          bgClass: "bg-blue-400/10",
          borderClass: "border-blue-400/30",
          glowClass: "shadow-[0_0_10px_0_rgba(96,165,250,0.2)]",
          label: "منخفض الخطورة"
        };
    }
  };

  const details = getSeverityDetails();
  const Icon = details.icon;

  return (
    <div className={`p-4 rounded-lg border ${details.borderClass} ${details.bgClass} ${details.glowClass} flex items-start gap-4 transition-all duration-300 hover:bg-opacity-20`}>
      <div className={`p-2 rounded-md bg-background/50 border ${details.borderClass}`}>
        <Icon className={`w-5 h-5 ${details.colorClass}`} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-semibold text-foreground">{indicator.category}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full bg-background border ${details.borderClass} ${details.colorClass}`}>
            {details.label}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{indicator.description}</p>
      </div>
    </div>
  );
}