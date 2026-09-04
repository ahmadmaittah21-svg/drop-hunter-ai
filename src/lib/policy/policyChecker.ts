import type { PolicyCheckResult, PolicyFinding, PolicyLevel } from "@/types/product";

/**
 * POLICY / RISK CHECKER
 *
 * This is an assistance tool, NOT a guarantee of eBay compliance.
 * It flags common red flags in listing text using pattern matching so
 * a seller can review before publishing. It never asserts "100% eBay
 * compliant" — the UI must not phrase results that way either.
 */

interface CheckInput {
  title: string;
  description: string;
  itemSpecifics: Record<string, string>;
  brandDeclared: boolean;
}

const MEDICAL_CLAIM_PATTERNS = [
  /\bcures?\b/i,
  /\btreats? (disease|cancer|diabetes)\b/i,
  /\bfda[- ]approved\b/i,
  /\brelieves? pain permanently\b/i,
  /\bmedical grade\b/i,
];

const MISLEADING_CLAIM_PATTERNS = [
  /\b100% guaranteed\b/i,
  /\bbest (in|on) the (world|market)\b/i,
  /\bonly \d+ left\b/i,
  /\blimited time\b.*\bnever again\b/i,
  /\bas seen on tv\b/i,
];

const TRADEMARK_HINT_PATTERNS = [
  /\b(nike|adidas|apple|iphone|samsung|disney|marvel|gucci|rolex|chanel|louis vuitton)\b/i,
];

const RESTRICTED_HINT_PATTERNS = [
  /\b(weapon|firearm|ammunition|knife blade|taser|pepper spray)\b/i,
  /\b(prescription|controlled substance)\b/i,
  /\breplica\b/i,
  /\bcounterfeit\b/i,
];

const DANGEROUS_GOODS_PATTERNS = [/\blithium battery\b/i, /\bflammable\b/i, /\baerosol\b/i, /\bmagnet(ic)? (strong|neodymium)\b/i];

export function runPolicyCheck(input: CheckInput): PolicyCheckResult {
  const findings: PolicyFinding[] = [];
  const fullText = `${input.title}\n${input.description}`;

  scan(fullText, MEDICAL_CLAIM_PATTERNS, "medical-claim", "YELLOW", "Possible medical claim detected — remove or verify before publishing.", "description", findings);
  scan(fullText, MISLEADING_CLAIM_PATTERNS, "misleading-claim", "YELLOW", "Possible misleading or fake-urgency claim detected.", "description", findings);
  scan(fullText, TRADEMARK_HINT_PATTERNS, "trademark", "RED", "Possible trademarked brand name mentioned — verify you're authorized to reference it.", "title/description", findings);
  scan(fullText, RESTRICTED_HINT_PATTERNS, "restricted-item", "RED", "Possible restricted or prohibited item indicator detected.", "description", findings);
  scan(fullText, DANGEROUS_GOODS_PATTERNS, "dangerous-goods", "YELLOW", "Possible dangerous-goods shipping indicator — check eBay's shipping policy for this item type.", "description", findings);

  // Missing required information
  if (!input.title || input.title.trim().length < 10) {
    findings.push({ level: "YELLOW", category: "missing-info", message: "Title is very short — add more descriptive keywords.", fieldRef: "title" });
  }
  if (!input.description || input.description.trim().length < 40) {
    findings.push({ level: "YELLOW", category: "missing-info", message: "Description is thin — buyers and eBay search both reward detail.", fieldRef: "description" });
  }
  const emptySpecifics = Object.entries(input.itemSpecifics).filter(([, v]) => !v || v.trim().length === 0);
  if (emptySpecifics.length > 0) {
    findings.push({
      level: "YELLOW",
      category: "missing-info",
      message: `${emptySpecifics.length} item specific(s) are empty — fill in what you can verify.`,
      fieldRef: "itemSpecifics",
    });
  }

  // Brand mentioned in title/description but not declared as an item specific
  if (!input.brandDeclared && TRADEMARK_HINT_PATTERNS.some((p) => p.test(fullText))) {
    findings.push({
      level: "RED",
      category: "counterfeit-indicator",
      message: "A recognizable brand name appears in your text but no Brand item specific is set — this combination is a common counterfeit-detection trigger.",
      fieldRef: "itemSpecifics.Brand",
    });
  }

  const overallLevel = worstLevel(findings.map((f) => f.level));

  return { overallLevel, findings };
}

function scan(
  text: string,
  patterns: RegExp[],
  category: string,
  level: PolicyLevel,
  message: string,
  fieldRef: string,
  out: PolicyFinding[]
) {
  if (patterns.some((p) => p.test(text))) {
    out.push({ level, category, message, fieldRef });
  }
}

function worstLevel(levels: PolicyLevel[]): PolicyLevel {
  if (levels.includes("RED")) return "RED";
  if (levels.includes("YELLOW")) return "YELLOW";
  return "GREEN";
}
