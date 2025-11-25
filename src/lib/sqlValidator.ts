import { z } from "zod";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateSQLQuery = (query: string, dbType: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Trim and check if query is empty
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    errors.push("Query cannot be empty");
    return { isValid: false, errors, warnings };
  }

  // Security: Check for destructive operations
  const destructiveKeywords = [
    "DROP", "DELETE", "TRUNCATE", "UPDATE", "INSERT", 
    "ALTER", "CREATE", "GRANT", "REVOKE"
  ];
  
  const upperQuery = trimmedQuery.toUpperCase();
  for (const keyword of destructiveKeywords) {
    if (upperQuery.includes(keyword)) {
      errors.push(`Destructive operation detected: ${keyword} is not allowed. Only SELECT queries are permitted.`);
    }
  }

  // Check if query starts with SELECT
  if (!upperQuery.startsWith("SELECT")) {
    errors.push("Query must start with SELECT. Only read operations are allowed.");
  }

  // Check for basic SQL injection patterns
  const dangerousPatterns = [
    /;\s*DROP/i,
    /;\s*DELETE/i,
    /;\s*INSERT/i,
    /UNION\s+SELECT/i,
    /--\s*$/m,
    /\/\*.*\*\//,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmedQuery)) {
      errors.push("Potential SQL injection pattern detected. Please review your query.");
    }
  }

  // Check for balanced parentheses
  const openParens = (trimmedQuery.match(/\(/g) || []).length;
  const closeParens = (trimmedQuery.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`Unbalanced parentheses: ${openParens} opening, ${closeParens} closing`);
  }

  // Check for balanced quotes
  const singleQuotes = (trimmedQuery.match(/'/g) || []).length;
  const doubleQuotes = (trimmedQuery.match(/"/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    errors.push("Unbalanced single quotes detected");
  }
  if (doubleQuotes % 2 !== 0) {
    errors.push("Unbalanced double quotes detected");
  }

  // Check for SELECT without FROM (unless it's a valid constant query)
  if (upperQuery.includes("SELECT") && !upperQuery.includes("FROM") && !upperQuery.match(/SELECT\s+\d+/i)) {
    warnings.push("SELECT query without FROM clause detected. This may be intentional for testing.");
  }

  // Check for wildcards in large queries
  if (upperQuery.includes("SELECT *") && !upperQuery.includes("LIMIT")) {
    warnings.push("Using SELECT * without LIMIT may return a large dataset. Consider adding a LIMIT clause.");
  }

  // Check for LIMIT value
  const limitMatch = trimmedQuery.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    const limitValue = parseInt(limitMatch[1]);
    if (limitValue > 10000) {
      errors.push("LIMIT value cannot exceed 10,000 rows");
    }
  }

  // Database-specific validations
  if (dbType === "mysql") {
    // MySQL allows backticks for identifiers
    const backticks = (trimmedQuery.match(/`/g) || []).length;
    if (backticks % 2 !== 0) {
      errors.push("Unbalanced backticks detected (MySQL identifier quotes)");
    }
  }

  // Check for common typos in keywords
  const commonTypos = [
    { pattern: /\bSELCT\b/i, correct: "SELECT" },
    { pattern: /\bFORM\b(?!\s+AS)/i, correct: "FROM" },
    { pattern: /\bWERE\b/i, correct: "WHERE" },
    { pattern: /\bORDER BY\s+BY\b/i, correct: "ORDER BY" },
    { pattern: /\bGROUP BY\s+BY\b/i, correct: "GROUP BY" },
  ];

  for (const typo of commonTypos) {
    if (typo.pattern.test(trimmedQuery)) {
      warnings.push(`Possible typo detected. Did you mean ${typo.correct}?`);
    }
  }

  // Check for JOIN without ON
  if (/JOIN\s+\w+\s+(?!ON)/i.test(trimmedQuery) && !/CROSS\s+JOIN/i.test(trimmedQuery)) {
    errors.push("JOIN clause found without ON condition. Every JOIN must have an ON clause.");
  }

  // Check for GROUP BY with aggregate functions
  if (/(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(trimmedQuery) && !upperQuery.includes("GROUP BY")) {
    warnings.push("Aggregate functions detected without GROUP BY. This may not be intentional.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Schema validation for connection details
export const connectionSchema = z.object({
  host: z.string().trim().min(1, "Host is required").max(255, "Host too long"),
  port: z.number().int().positive("Port must be positive").max(65535, "Invalid port number"),
  database: z.string().trim().min(1, "Database name is required").max(63, "Database name too long"),
  username: z.string().trim().min(1, "Username is required").max(63, "Username too long"),
  password: z.string().max(255, "Password too long"),
  query: z.string().trim().min(1, "Query is required").max(10000, "Query too long"),
});

export type ConnectionFormData = z.infer<typeof connectionSchema>;
