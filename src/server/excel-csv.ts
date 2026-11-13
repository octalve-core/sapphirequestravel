/**
 * Excel-oriented CSV encoder. Customer fields are untrusted and must never
 * be allowed to become formulas when opened in a spreadsheet application.
 * A tab prefix inside quotes is an Excel-resistant defensive measure.
 */
export function excelCsvCell(value: unknown, keepText = false): string {
  let cell = String(value ?? "").replace(/[\r\n\t\x00-\x1f\x7f]/g, " ").trim();
  if (keepText || /^[=+\-@\uFF1D\uFF0B\uFF0D\uFF20]/u.test(cell)) {
    cell = "\t" + cell;
  }
  return '"' + cell.replace(/"/g, '""') + '"';
}
export function excelCsvRow(values: unknown[], textColumns: number[] = []) {
  return values.map((value, index) => excelCsvCell(value, textColumns.includes(index))).join(",");
}
