import { Router, type IRouter } from "express";
import { AnalyzeContentBody } from "@workspace/api-zod";
import { analyzeContent } from "../lib/analyzer";
import { checkRateLimit } from "../lib/rateLimiter";
import { statsStore } from "../lib/statsStore";

const router: IRouter = Router();

router.post("/analyze", async (req, res): Promise<void> => {
  // Rate limiting — use X-Forwarded-For if behind proxy, fallback to req.ip
  const rawIp =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
    req.ip ??
    "unknown";

  // Sanitize IP to prevent log injection
  const ip = rawIp.replace(/[^a-fA-F0-9.:]/g, "").slice(0, 45);
  const rateCheck = checkRateLimit(ip);

  res.setHeader("X-RateLimit-Remaining", rateCheck.remaining.toString());
  res.setHeader("X-RateLimit-Reset", rateCheck.resetAt.toString());

  if (!rateCheck.allowed) {
    res.status(429).json({ error: "تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد دقيقة." });
    return;
  }

  // Input validation via Zod (OWASP: validate & sanitize all user inputs)
  const parsed = AnalyzeContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "مدخل غير صالح: " + parsed.error.issues[0]?.message });
    return;
  }

  const { content } = parsed.data;

  // XSS protection: ensure we never reflect raw content back — only analysis results
  const result = analyzeContent(content);

  // Record aggregate stats (no user content stored)
  const uniqueCategories = [...new Set(result.indicators.map((i) => i.category))];
  statsStore.recordScan(result.verdict, result.score, uniqueCategories);

  req.log.info({ verdict: result.verdict, score: result.score }, "Analysis completed");

  res.json({
    score: result.score,
    verdict: result.verdict,
    indicators: result.indicators,
    tips: result.tips,
    analyzedAt: new Date().toISOString(),
  });
});

export default router;
