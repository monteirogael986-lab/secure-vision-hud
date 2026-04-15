// Access control logic — checks user input for restricted keywords
const RESTRICTED_KEYWORDS = ["salary", "employee", "data", "personal"];

export function checkAccess(input: string): { granted: boolean; message: string } {
  const lower = input.toLowerCase();
  const found = RESTRICTED_KEYWORDS.find((kw) => lower.includes(kw));
  if (found) {
    return {
      granted: false,
      message: `Access denied due to security policy — restricted keyword "${found}" detected.`,
    };
  }
  return {
    granted: true,
    message: "Access granted. Request processed successfully.",
  };
}
