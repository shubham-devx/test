export function spreadsheetCsvCell(value: unknown): string {
  const rawText = String(value ?? "");
  const text = /^[\s]*[=+\-@]/.test(rawText) ? `'${rawText}` : rawText;
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}
