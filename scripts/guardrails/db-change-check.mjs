#!/usr/bin/env node
/**
 * DB Change Detection Script
 * 
 * Detects changes in database-related files and risky SQL keywords.
 * Used as a guardrail to prevent accidental production DB changes.
 * 
 * Usage: node scripts/guardrails/db-change-check.mjs [--staged]
 *   --staged: Check only staged files (for pre-commit hooks)
 */

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

// File patterns that indicate potential DB changes
const DB_FILE_PATTERNS = [
  /^prisma\//,
  /^prisma\/migrations\//,
  /\.sql$/,
];

// SQL keywords that indicate risky operations
const RISKY_KEYWORDS = [
  "DROP TABLE",
  "TRUNCATE",
  "DELETE FROM",
  "ALTER TABLE",
  "CREATE POLICY",
  "DROP POLICY",
  "ENABLE ROW LEVEL SECURITY",
  "DISABLE ROW LEVEL SECURITY",
  "prisma db push",
  "DROP INDEX",
  "DROP COLUMN",
  "DROP CONSTRAINT",
];

// High-risk keywords that require explicit approval
const HIGH_RISK_KEYWORDS = [
  "DROP TABLE",
  "TRUNCATE",
  "DELETE FROM",
  "DROP POLICY",
  "DROP COLUMN",
];

function getChangedFiles(staged = false) {
  try {
    const cmd = staged
      ? "git diff --cached --name-only"
      : "git diff --name-only HEAD~1";
    const output = execSync(cmd, { cwd: ROOT, encoding: "utf-8" });
    return output.trim().split("\n").filter(Boolean);
  } catch {
    // Fallback: check all uncommitted changes
    try {
      const output = execSync("git status --porcelain", { cwd: ROOT, encoding: "utf-8" });
      return output
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => line.slice(3));
    } catch {
      return [];
    }
  }
}

function getDiffContent(staged = false) {
  try {
    const cmd = staged
      ? "git diff --cached"
      : "git diff HEAD~1";
    return execSync(cmd, { cwd: ROOT, encoding: "utf-8" });
  } catch {
    return "";
  }
}

function isDbRelatedFile(file) {
  // Check against patterns
  if (DB_FILE_PATTERNS.some((pattern) => pattern.test(file))) {
    return true;
  }
  
  // Check scripts folder for SQL keywords
  if (file.startsWith("scripts/") && !file.includes("guardrails")) {
    try {
      const content = readFileSync(resolve(ROOT, file), "utf-8");
      return RISKY_KEYWORDS.some((kw) => content.toUpperCase().includes(kw.toUpperCase()));
    } catch {
      return false;
    }
  }
  
  return false;
}

function findRiskyKeywords(content) {
  const found = [];
  const upperContent = content.toUpperCase();
  
  for (const keyword of RISKY_KEYWORDS) {
    if (upperContent.includes(keyword.toUpperCase())) {
      found.push(keyword);
    }
  }
  
  return [...new Set(found)];
}

function hasHighRiskKeywords(keywords) {
  return keywords.some((kw) =>
    HIGH_RISK_KEYWORDS.some((hrk) => kw.toUpperCase().includes(hrk.toUpperCase()))
  );
}

function checkRiskReport() {
  const reportPath = resolve(ROOT, "docs/DB-RISK-REPORT.md");
  if (!existsSync(reportPath)) {
    return { exists: false, approved: false, content: null };
  }
  
  const content = readFileSync(reportPath, "utf-8");
  const approved = content.includes("[x]") && content.includes("APPROVED");
  
  return { exists: true, approved, content };
}

function main() {
  const staged = process.argv.includes("--staged");
  const verbose = process.argv.includes("--verbose");
  
  console.log("🔍 DB Change Detection Check");
  console.log("=".repeat(50));
  
  // Get changed files
  const changedFiles = getChangedFiles(staged);
  const dbRelatedFiles = changedFiles.filter(isDbRelatedFile);
  
  // Get diff content and scan for risky keywords
  const diffContent = getDiffContent(staged);
  const riskyKeywords = findRiskyKeywords(diffContent);
  
  // Determine if DB change detected
  const dbChangeDetected = dbRelatedFiles.length > 0 || riskyKeywords.length > 0;
  
  // Output results
  console.log(`\nDB_CHANGE_DETECTED=${dbChangeDetected}`);
  
  if (dbRelatedFiles.length > 0) {
    console.log("\n📁 DB-related files changed:");
    dbRelatedFiles.forEach((f) => console.log(`   - ${f}`));
  }
  
  if (riskyKeywords.length > 0) {
    console.log("\n⚠️  Risky keywords detected:");
    riskyKeywords.forEach((kw) => console.log(`   - ${kw}`));
  }
  
  if (!dbChangeDetected) {
    console.log("\n✅ No DB changes detected. Safe to proceed.");
    process.exit(0);
  }
  
  // DB change detected - check for risk report
  console.log("\n" + "=".repeat(50));
  console.log("🚨 DB CHANGE DETECTED - Checking guardrails...");
  
  const report = checkRiskReport();
  
  if (!report.exists) {
    console.log("\n❌ BLOCKED: No DB Risk Report found.");
    console.log("   Create docs/DB-RISK-REPORT.md from the template:");
    console.log("   cp docs/DB-RISK-REPORT.template.md docs/DB-RISK-REPORT.md");
    console.log("\n   Fill in all sections and get approval before proceeding.");
    process.exit(1);
  }
  
  if (hasHighRiskKeywords(riskyKeywords) && !report.approved) {
    console.log("\n❌ BLOCKED: High-risk keywords detected but report not approved.");
    console.log("   High-risk operations require explicit approval.");
    console.log("   Ensure docs/DB-RISK-REPORT.md has [x] APPROVED checkbox marked.");
    process.exit(1);
  }
  
  if (!report.approved) {
    console.log("\n⚠️  WARNING: DB Risk Report exists but not approved.");
    console.log("   For high-risk changes, get approval before merging.");
    console.log("   Mark [x] APPROVED in docs/DB-RISK-REPORT.md after review.");
  } else {
    console.log("\n✅ DB Risk Report found and approved.");
  }
  
  console.log("\n📋 Summary:");
  console.log(`   - DB files changed: ${dbRelatedFiles.length}`);
  console.log(`   - Risky keywords: ${riskyKeywords.length}`);
  console.log(`   - Risk report: ${report.exists ? "EXISTS" : "MISSING"}`);
  console.log(`   - Approved: ${report.approved ? "YES" : "NO"}`);
  
  // Exit with warning code if not approved but not high-risk
  if (!report.approved && !hasHighRiskKeywords(riskyKeywords)) {
    process.exit(0); // Soft warning, allow proceed
  }
  
  process.exit(0);
}

main();
