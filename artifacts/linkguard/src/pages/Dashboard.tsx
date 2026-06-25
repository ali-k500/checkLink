import { useGetStats } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, AlertTriangle, ShieldAlert, BarChart3, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useGetStats();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-primary font-mono animate-pulse">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="bg-destructive/10 border border-destructive text-destructive p-6 rounded-lg max-w-md text-center">
          <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">خطأ في تحميل البيانات</h2>
          <p>يرجى المحاولة مرة أخرى لاحقاً.</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "آمن", value: stats.safeCount, color: "hsl(150 80% 50%)" },
    { name: "مشبوه", value: stats.suspiciousCount, color: "hsl(45 90% 55%)" },
    { name: "خطير", value: stats.dangerousCount, color: "hsl(0 84% 60%)" }
  ].filter(d => d.value > 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const getVerdictDetails = (verdict: string) => {
    switch (verdict) {
      case "dangerous":
        return { label: "خطير", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" };
      case "suspicious":
        return { label: "مشبوه", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" };
      case "safe":
      default:
        return { label: "آمن", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <Activity className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-1 bg-primary/50" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-muted-foreground font-medium">إجمالي الفحوصات</h3>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <p className="text-4xl font-bold font-mono">{stats.totalAnalyzed.toLocaleString()}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6 relative overflow-hidden group hover:border-green-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-full h-1 bg-green-500/50" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-muted-foreground font-medium">آمن</h3>
            <ShieldCheck className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-4xl font-bold font-mono text-green-500">{stats.safeCount.toLocaleString()}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-full h-1 bg-amber-500/50" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-muted-foreground font-medium">مشبوه</h3>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-4xl font-bold font-mono text-amber-500">{stats.suspiciousCount.toLocaleString()}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6 relative overflow-hidden group hover:border-destructive/50 transition-colors hover:shadow-[0_0_20px_0_hsl(var(--destructive)/0.2)]">
          <div className="absolute top-0 right-0 w-full h-1 bg-destructive/50" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-muted-foreground font-medium">خطير</h3>
            <ShieldAlert className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-4xl font-bold font-mono text-destructive">{stats.dangerousCount.toLocaleString()}</p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">أبرز التهديدات</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topThreats} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="category" type="category" width={100} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">توزيع النتائج</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-3 bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">النشاط الأخير</h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-sm">
                  <th className="pb-3 font-medium">الوقت</th>
                  <th className="pb-3 font-medium">النتيجة</th>
                  <th className="pb-3 font-medium text-left">درجة الخطر</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.map((scan, i) => {
                  const details = getVerdictDetails(scan.verdict);
                  return (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-4 text-sm font-mono text-muted-foreground">
                        {new Date(scan.scannedAt).toLocaleString('ar-SA')}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${details.bg} ${details.color} ${details.border}`}>
                          {details.label}
                        </span>
                      </td>
                      <td className="py-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-2 bg-background rounded-full overflow-hidden border border-border">
                            <div 
                              className={`h-full ${scan.score > 70 ? 'bg-destructive' : scan.score > 30 ? 'bg-amber-500' : 'bg-green-500'}`}
                              style={{ width: `${scan.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono w-8">{scan.score}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {stats.recentActivity.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted-foreground">
                      لا يوجد نشاط أخير
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}