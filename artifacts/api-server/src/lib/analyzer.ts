import type { ThreatIndicator } from "@workspace/api-zod";

interface AnalysisOutput {
  score: number;
  verdict: "safe" | "suspicious" | "dangerous";
  indicators: ThreatIndicator[];
  tips: string[];
}

// Heuristic-based phishing/scam/malware detection engine
// Implements OWASP-aligned input validation and threat pattern matching

const PHISHING_DOMAINS = [
  "paypa1", "paypαl", "amaz0n", "g00gle", "micros0ft", "apple-id",
  "securelogin", "account-verify", "update-billing", "confirm-identity",
  "login-secure", "verify-account", "bank-secure", "bankofamerica-",
  "wellsfargo-", "chase-secure", "citibank-", "secure-paypal",
  "paypal-secure", "ebay-secure", "amazon-secure", "support-microsoft",
];

const SUSPICIOUS_TLDS = [
  ".xyz", ".top", ".club", ".online", ".site", ".live", ".click",
  ".download", ".loan", ".win", ".bid", ".review", ".work", ".party",
  ".stream", ".gq", ".ml", ".cf", ".tk", ".ga",
];

const MALWARE_PATTERNS = [
  /\.exe\b/i, /\.bat\b/i, /\.cmd\b/i, /\.scr\b/i, /\.vbs\b/i,
  /\.ps1\b/i, /\.msi\b/i, /\.jar\b/i, /download.*free/i,
  /free.*download/i, /crack.*software/i, /keygen/i, /serial.*key/i,
];

const SCAM_PATTERNS = [
  /you\s+(have\s+)?(won|win)/i,
  /congratulations.*prize/i,
  /claim.*reward/i,
  /urgent.*action.*required/i,
  /account.*suspended/i,
  /verify.*immediately/i,
  /click.*here.*immediately/i,
  /limited.*time.*offer/i,
  /act.*now/i,
  /free.*money/i,
  /lottery.*winner/i,
  /inheritance.*million/i,
  /nigerian/i,
  /bitcoin.*double/i,
  /crypto.*profit.*guaranteed/i,
  /investment.*guaranteed/i,
  /100%.*return/i,
];

const ARABIC_SCAM_PATTERNS = [
  /فزت/i, /ربحت/i, /مبروك.*جائزة/i, /اضغط.*الآن/i,
  /عاجل.*تحقق/i, /حسابك.*معلق/i, /مليون.*دولار/i,
];

const CREDENTIAL_HARVEST_PATTERNS = [
  /login|signin|sign-in|log-in/i,
  /password|passwd|pwd/i,
  /username|user_name/i,
  /credit.?card|creditcard/i,
  /ssn|social.?security/i,
  /bank.?account/i,
];

const URL_SHORTENERS = [
  "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd",
  "buff.ly", "rebrand.ly", "short.io", "tiny.cc", "clck.ru",
];

const HOMOGRAPH_CHARS = /[ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω]/;

function extractUrl(content: string): URL | null {
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/i;
  const match = content.match(urlPattern);
  if (!match) return null;
  try {
    return new URL(match[0]);
  } catch {
    return null;
  }
}

function sanitizeInput(input: string): string {
  // Strip null bytes and control characters
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

export function analyzeContent(rawContent: string): AnalysisOutput {
  const content = sanitizeInput(rawContent);
  const indicators: ThreatIndicator[] = [];
  let score = 0;

  const url = extractUrl(content);
  const hostname = url?.hostname?.toLowerCase() ?? "";
  const fullUrl = url?.href?.toLowerCase() ?? content.toLowerCase();
  const lowerContent = content.toLowerCase();

  // ─── URL-based checks ────────────────────────────────────────────────────

  if (url) {
    // Suspicious TLD
    if (SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld))) {
      score += 25;
      indicators.push({
        category: "domain",
        description: `نطاق مرتبط بالاحتيال: ${hostname.split(".").pop() ?? ""}`,
        severity: "medium",
      });
    }

    // IP address URL (no domain)
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      score += 30;
      indicators.push({
        category: "domain",
        description: "الرابط يستخدم عنوان IP مباشرة بدلاً من اسم النطاق",
        severity: "high",
      });
    }

    // URL shortener
    if (URL_SHORTENERS.some((s) => hostname === s)) {
      score += 20;
      indicators.push({
        category: "domain",
        description: "رابط مختصر يخفي الوجهة الحقيقية",
        severity: "medium",
      });
    }

    // Phishing domain lookalike
    if (PHISHING_DOMAINS.some((p) => hostname.includes(p))) {
      score += 40;
      indicators.push({
        category: "domain",
        description: "النطاق يشبه موقعاً موثوقاً معروفاً (انتحال هوية)",
        severity: "high",
      });
    }

    // Homograph attack (unicode look-alike characters)
    if (HOMOGRAPH_CHARS.test(hostname)) {
      score += 35;
      indicators.push({
        category: "domain",
        description: "يحتوي النطاق على أحرف Unicode تبدو مشابهة للأحرف العادية (هجوم homograph)",
        severity: "high",
      });
    }

    // Excessive subdomains (more than 3)
    const subdomain_count = hostname.split(".").length - 2;
    if (subdomain_count > 3) {
      score += 20;
      indicators.push({
        category: "domain",
        description: `النطاق يحتوي على عدد مفرط من النطاقات الفرعية (${subdomain_count})`,
        severity: "medium",
      });
    }

    // Legitimate brand in subdomain (subdomain spoofing)
    const brandInSubdomain = /^(paypal|amazon|google|microsoft|apple|facebook|instagram|twitter|tiktok|netflix|ebay)\./i;
    if (brandInSubdomain.test(hostname) && !hostname.endsWith(".com") && !hostname.endsWith(".org")) {
      score += 35;
      indicators.push({
        category: "domain",
        description: "اسم علامة تجارية موثوقة في النطاق الفرعي (تحايل على الهوية)",
        severity: "high",
      });
    }

    // HTTP (not HTTPS)
    if (url.protocol === "http:") {
      score += 15;
      indicators.push({
        category: "protocol",
        description: "الرابط يستخدم HTTP غير المشفر بدلاً من HTTPS",
        severity: "medium",
      });
    }

    // Credential harvesting keywords in URL
    if (CREDENTIAL_HARVEST_PATTERNS.some((p) => p.test(fullUrl))) {
      score += 25;
      indicators.push({
        category: "content",
        description: "الرابط يحتوي على كلمات مرتبطة بسرقة البيانات",
        severity: "high",
      });
    }

    // Malware file extensions
    if (MALWARE_PATTERNS.some((p) => p.test(fullUrl))) {
      score += 40;
      indicators.push({
        category: "malware",
        description: "الرابط يشير إلى ملف تنفيذي أو برنامج قد يكون ضاراً",
        severity: "high",
      });
    }

    // Very long URL (obfuscation attempt)
    if (fullUrl.length > 200) {
      score += 10;
      indicators.push({
        category: "pattern",
        description: "الرابط طويل جداً — قد يكون تمويهاً لإخفاء الوجهة الحقيقية",
        severity: "low",
      });
    }

    // URL has encoded characters (possible obfuscation)
    if (/%[0-9a-f]{2}/i.test(fullUrl) && (fullUrl.match(/%[0-9a-f]{2}/gi)?.length ?? 0) > 5) {
      score += 15;
      indicators.push({
        category: "pattern",
        description: "الرابط يحتوي على ترميز URL مفرط (محاولة تمويه)",
        severity: "medium",
      });
    }
  }

  // ─── Content/message checks ───────────────────────────────────────────────

  // Scam patterns in English
  if (SCAM_PATTERNS.some((p) => p.test(lowerContent))) {
    score += 35;
    indicators.push({
      category: "content",
      description: "الرسالة تحتوي على أنماط احتيالية شائعة",
      severity: "high",
    });
  }

  // Scam patterns in Arabic
  if (ARABIC_SCAM_PATTERNS.some((p) => p.test(content))) {
    score += 35;
    indicators.push({
      category: "content",
      description: "الرسالة تحتوي على أنماط احتيال بالعربية",
      severity: "high",
    });
  }

  // Personal data requests in message
  if (/password|كلمة.*سر|رقم.*بطاقة|card.*number|CVV|OTP|رمز.*تحقق/i.test(content)) {
    score += 30;
    indicators.push({
      category: "content",
      description: "الرسالة تطلب بيانات حساسة (كلمة مرور، رقم بطاقة، OTP)",
      severity: "high",
    });
  }

  // Urgency language
  if (/urgent|immediately|expire|suspended|الآن|فوراً|ينتهي|معلق|عاجل/i.test(content)) {
    score += 15;
    indicators.push({
      category: "content",
      description: "الرسالة تستخدم لغة الاستعجال لاستفزازك على التصرف بتهور",
      severity: "medium",
    });
  }

  // Phone number in message (smishing indicator)
  if (/\+?\d[\d\s\-()]{7,}\d/.test(content) && url === null) {
    score += 10;
    indicators.push({
      category: "content",
      description: "الرسالة تحتوي على رقم هاتف (محاولة تحويل التواصل إلى قناة خاصة)",
      severity: "low",
    });
  }

  // Cap score at 100
  score = Math.min(100, score);

  // Determine verdict
  let verdict: "safe" | "suspicious" | "dangerous";
  if (score <= 30) {
    verdict = "safe";
  } else if (score <= 70) {
    verdict = "suspicious";
  } else {
    verdict = "dangerous";
  }

  // Generate context-aware security tips
  const tips = buildTips(indicators, verdict);

  return { score, verdict, indicators, tips };
}

function buildTips(indicators: ThreatIndicator[], verdict: "safe" | "suspicious" | "dangerous"): string[] {
  const tips: string[] = [];
  const categories = new Set(indicators.map((i) => i.category));

  if (categories.has("domain")) {
    tips.push("تحقق دائماً من اسم النطاق بعناية — المواقع الاحتيالية تستخدم أسماء مشابهة للمواقع الموثوقة مع اختلافات طفيفة.");
  }
  if (categories.has("protocol")) {
    tips.push("استخدم دائماً المواقع التي تبدأ بـ HTTPS (القفل الأخضر) وتجنب HTTP خاصةً عند إدخال بيانات حساسة.");
  }
  if (categories.has("content")) {
    tips.push("لا تشارك كلمات المرور أو أرقام البطاقات أو رموز OTP عبر الروابط أو الرسائل مهما كان المصدر.");
    tips.push("الشركات الموثوقة لا تطلب بياناتك الحساسة عبر الرسائل أو روابط البريد الإلكتروني.");
  }
  if (categories.has("malware")) {
    tips.push("لا تقم بتنزيل أي ملف تنفيذي (.exe, .bat) من مصادر غير موثوقة — تأكد من مصدر البرنامج قبل تثبيته.");
  }

  if (verdict === "dangerous") {
    tips.push("لا تفتح هذا الرابط أبداً. إذا وصلك من شخص تعرفه، أبلغه بأن حسابه قد يكون مخترقاً.");
    tips.push("بلّغ عن هذا الرابط لفريق الأمن المختص أو للجهة المنتحَل هويتها.");
  } else if (verdict === "suspicious") {
    tips.push("توخَّ الحذر قبل التفاعل مع هذا الرابط. في حال الشك، تواصل مباشرةً مع الجهة الرسمية.");
  } else {
    tips.push("حتى الروابط الآمنة قد تتغير — احتفظ ببرنامج حماية محدث واستخدم مدير كلمات المرور.");
  }

  // Always add a general tip
  tips.push("فعّل المصادقة الثنائية (2FA) على جميع حساباتك الهامة لحمايتها حتى لو سُرقت كلمة المرور.");

  return tips.slice(0, 5);
}
