import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, Zap, Server, ChevronLeft, Search, BarChart2, Lock, Eye, Link2, AlertTriangle, Wifi, KeyRound, RefreshCw, MousePointerClick } from "lucide-react";
import { useAnalyzeContent } from "@workspace/api-client-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import RiskGauge from "@/components/RiskGauge";
import ThreatIndicatorCard from "@/components/ThreatIndicator";
import ScanAnimation from "@/components/ScanAnimation";
import { AnalysisResult } from "@workspace/api-zod";

export default function Scanner() {
  const [content, setContent] = useState("");
  const analyzeMutation = useAnalyzeContent();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = () => {
    if (!content.trim()) return;
    
    analyzeMutation.mutate(
      { data: { content } },
      {
        onSuccess: (data) => {
          setResult(data);
        }
      }
    );
  };

  const getVerdictDetails = (verdict: string) => {
    switch (verdict) {
      case "dangerous":
        return { label: "خطير", color: "text-destructive", icon: ShieldAlert, bg: "bg-destructive/10 border-destructive/30" };
      case "suspicious":
        return { label: "مشبوه", color: "text-amber-500", icon: AlertTriangleIcon, bg: "bg-amber-500/10 border-amber-500/30" };
      case "safe":
      default:
        return { label: "آمن", color: "text-green-500", icon: ShieldCheck, bg: "bg-green-500/10 border-green-500/30" };
    }
  };

  // Simple icon component for suspicious
  const AlertTriangleIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  );

  const howItWorks = [
    {
      icon: Link2,
      title: "الصق الرابط أو الرسالة",
      desc: "انسخ أي رابط مشبوه أو رسالة تصلك وضعها في مربع الفحص"
    },
    {
      icon: Search,
      title: "تحليل فوري",
      desc: "يحلل checkLink المحتوى فورياً باستخدام محرك كشف التهديدات الذكي"
    },
    {
      icon: BarChart2,
      title: "نتيجة واضحة",
      desc: "تحصل على درجة خطورة من 0 إلى 100 وحكم واضح: آمن، مشبوه، أو خطير"
    }
  ];

  const securityTips = [
    {
      icon: Eye,
      title: "تحقق من الرابط قبل النقر",
      desc: "مرر الماوس فوق أي رابط لترى عنوانه الحقيقي قبل فتحه. الروابط المشبوهة تحتوي كلمات غريبة أو أرقام بدل الحروف."
    },
    {
      icon: Lock,
      title: "ابحث عن HTTPS",
      desc: "تأكد أن المواقع التي تدخل بياناتها الشخصية تبدأ بـ https:// وعليها قفل أخضر في المتصفح."
    },
    {
      icon: AlertTriangle,
      title: "احذر من الإلحاح المصطنع",
      desc: "رسائل مثل 'حسابك سيُغلق الآن!' أو 'فزت بجائزة!' هي أكثر علامات التصيد شيوعاً. خذ وقتك ولا تتسرع."
    },
    {
      icon: KeyRound,
      title: "لا تدخل كلمة مرورك في روابط مجهولة",
      desc: "البنوك والمواقع الرسمية لن تطلب منك كلمة مرورك عبر رسالة أو بريد إلكتروني. أي طلب كهذا هو احتيال."
    },
    {
      icon: Wifi,
      title: "تجنب الواي فاي العام للمعاملات الحساسة",
      desc: "لا تفتح حساباتك البنكية أو تدخل بياناتك الشخصية وأنت متصل بشبكة واي فاي عامة غير مشفرة."
    },
    {
      icon: RefreshCw,
      title: "حدّث تطبيقاتك باستمرار",
      desc: "التحديثات تُصلح ثغرات أمنية. فعّل التحديث التلقائي لنظام تشغيلك وتطبيقاتك دائماً."
    },
    {
      icon: MousePointerClick,
      title: "لا تنقر على روابط الرسائل المجهولة",
      desc: "سواء على واتساب أو بريدك الإلكتروني، لا تفتح رابطاً من شخص لا تعرفه قبل فحصه هنا أولاً."
    },
    {
      icon: ShieldCheck,
      title: "استخدم مصادقة ثنائية",
      desc: "فعّل التحقق بخطوتين على كل حساباتك المهمة. حتى لو سُرقت كلمة مرورك، يبقى حسابك محمياً."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-primary/10 border border-primary/20 glow-primary"
        >
          <Shield className="w-12 h-12 text-primary" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
        >
          check<span className="text-primary">Link</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-muted-foreground font-medium"
        >
          احمِ نفسك من التهديدات الرقمية
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={result ? "lg:col-span-7" : "lg:col-span-12"}
        >
          <div className="relative p-1 rounded-xl bg-gradient-to-b from-border/50 to-transparent">
            <div className="relative bg-card rounded-lg p-6 border border-border shadow-lg">
              {analyzeMutation.isPending && <ScanAnimation />}
              
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <Server className="w-4 h-4" />
                <span className="text-sm font-mono tracking-widest uppercase">Target Input</span>
              </div>
              
              <Textarea
                placeholder="الصق الرابط أو الرسالة المشبوهة هنا..."
                className="min-h-[200px] resize-y bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 text-lg mb-6 font-mono p-4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              
              <Button 
                onClick={handleAnalyze} 
                disabled={!content.trim() || analyzeMutation.isPending}
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_0_hsl(var(--primary)/0.4)] transition-all hover:shadow-[0_0_30px_0_hsl(var(--primary)/0.6)]"
              >
                <Zap className="w-5 h-5 ml-2" />
                تحليل الآن
              </Button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              className="lg:col-span-5 flex flex-col gap-6"
            >
              <div className="bg-card rounded-xl border border-border p-6 shadow-xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 ${getVerdictDetails(result.verdict).bg.split(' ')[0]}`} />
                
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  نتيجة الفحص
                </h3>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                  <RiskGauge score={result.score} />
                  
                  <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-right">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getVerdictDetails(result.verdict).bg} ${getVerdictDetails(result.verdict).color} font-bold text-lg mb-2`}>
                      {(() => {
                        const Icon = getVerdictDetails(result.verdict).icon;
                        return <Icon className="w-5 h-5" />;
                      })()}
                      {getVerdictDetails(result.verdict).label}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      تم الفحص في: {new Date(result.analyzedAt).toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                </div>

                {result.indicators.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <ChevronLeft className="w-4 h-4" />
                      مؤشرات التهديد
                    </h4>
                    <div className="flex flex-col gap-3">
                      {result.indicators.map((indicator, i) => (
                        <ThreatIndicatorCard key={i} indicator={indicator} />
                      ))}
                    </div>
                  </div>
                )}

                {result.tips.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <ChevronLeft className="w-4 h-4" />
                      نصائح الأمان
                    </h4>
                    <ul className="space-y-2">
                      {result.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80 bg-background/50 p-3 rounded-md border border-border/50">
                          <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* كيف يعمل checkLink */}
      <section className="mt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20 mb-4">
            كيف يعمل؟
          </span>
          <h2 className="text-3xl font-bold">checkLink في ثلاث خطوات</h2>
          <p className="text-muted-foreground mt-2">بسيط وسريع وبدون تسجيل — خصوصيتك محمية بالكامل</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {howItWorks.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center gap-4 hover:border-primary/40 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <span className="absolute top-4 left-4 text-4xl font-black text-primary/10 select-none leading-none">
                  {i + 1}
                </span>
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* نصائح الأمن السيبراني */}
      <section className="mt-20 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-destructive/10 text-destructive border border-destructive/20 mb-4">
            أمن رقمي
          </span>
          <h2 className="text-3xl font-bold">نصائح الأمن السيبراني</h2>
          <p className="text-muted-foreground mt-2">احمِ نفسك وعائلتك من عمليات الاحتيال الإلكتروني</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityTips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: (i % 4) * 0.07 }}
                className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-primary/30 hover:bg-card/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:glow-primary transition-all">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-sm leading-snug">{tip.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}