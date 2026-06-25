// In-memory stats store — no user data persisted, only aggregate counts
// Privacy-preserving: stores counts and verdicts only, never content or IPs

interface ThreatCount {
  [category: string]: number;
}

interface RecentScan {
  verdict: "safe" | "suspicious" | "dangerous";
  score: number;
  scannedAt: string;
}

class StatsStore {
  private totalAnalyzed = 0;
  private safeCount = 0;
  private suspiciousCount = 0;
  private dangerousCount = 0;
  private threatCounts: ThreatCount = {};
  private recentScans: RecentScan[] = [];

  private readonly MAX_RECENT = 10;

  recordScan(verdict: "safe" | "suspicious" | "dangerous", score: number, threatCategories: string[]): void {
    this.totalAnalyzed += 1;

    if (verdict === "safe") this.safeCount += 1;
    else if (verdict === "suspicious") this.suspiciousCount += 1;
    else this.dangerousCount += 1;

    for (const cat of threatCategories) {
      this.threatCounts[cat] = (this.threatCounts[cat] ?? 0) + 1;
    }

    this.recentScans.unshift({
      verdict,
      score,
      scannedAt: new Date().toISOString(),
    });

    if (this.recentScans.length > this.MAX_RECENT) {
      this.recentScans = this.recentScans.slice(0, this.MAX_RECENT);
    }
  }

  getStats() {
    const topThreats = Object.entries(this.threatCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    return {
      totalAnalyzed: this.totalAnalyzed,
      safeCount: this.safeCount,
      suspiciousCount: this.suspiciousCount,
      dangerousCount: this.dangerousCount,
      topThreats,
      recentActivity: [...this.recentScans],
    };
  }
}

// Singleton — shared across all requests in the process
export const statsStore = new StatsStore();
