import { describe, expect, it } from "vitest";
import { spreadsheetCsvCell } from "../lib/csv";

describe("Excel-compatible CSV values", () => {
  it("quotes and escapes spreadsheet cells", () => {
    expect(spreadsheetCsvCell('founder "one"\nteam')).toBe('"founder ""one"" team"');
  });

  it("neutralizes formula-like values", () => {
    expect(spreadsheetCsvCell("=HYPERLINK(\"https://example.com\")")).toBe(
      `"'=HYPERLINK(""https://example.com"")"`
    );
    expect(spreadsheetCsvCell("  @SUM(A1:A2)")).toBe('"\'  @SUM(A1:A2)"');
  });
});
