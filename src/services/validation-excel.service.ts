import type {
  XLSFormData,
  XLSFormSheetData,
  XLSFormSheetName,
  XLSFormValidationIssue
} from "../types";

const XLSFORM_SHEETS: XLSFormSheetName[] = ["survey", "choices", "settings"];

export async function readCurrentXLSForm(): Promise<XLSFormData> {
  return Excel.run(async (context) => {
    const result: XLSFormData = {};
    for (const sheetName of XLSFORM_SHEETS) {
      const sheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
      sheet.load("isNullObject");
      await context.sync();
      if (sheet.isNullObject) continue;
      const usedRange = sheet.getUsedRangeOrNullObject();
      usedRange.load(["isNullObject", "values"]);
      await context.sync();
      result[sheetName] = {
        name: sheetName,
        rows: usedRange.isNullObject ? [] : usedRange.values
      } as XLSFormSheetData;
    }
    return result;
  });
}

export async function selectValidationIssue(issue: XLSFormValidationIssue): Promise<void> {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getItemOrNullObject(issue.sheetName);
    sheet.load("isNullObject");
    await context.sync();
    if (sheet.isNullObject) return;
    sheet.activate();
    const rowIndex = Math.max((issue.rowNumber || 1) - 1, 0);
    const columnIndex = Math.max((issue.columnNumber || 1) - 1, 0);
    sheet.getCell(rowIndex, columnIndex).select();
    await context.sync();
  });
}

export async function writeValidationReport(issues: XLSFormValidationIssue[]): Promise<void> {
  await Excel.run(async (context) => {
    const sheets = context.workbook.worksheets;
    const existing = sheets.getItemOrNullObject("_validation_report");
    existing.load("isNullObject");
    await context.sync();
    const sheet = existing.isNullObject ? sheets.add("_validation_report") : existing;
    if (!existing.isNullObject) sheet.getUsedRange().clear(Excel.ClearApplyTo.all);

    const headers = [["severity", "check", "sheet", "name", "list_name", "cell", "detail"]];
    const reportColumnCount = 7;
    sheet.getRangeByIndexes(0, 0, 1, reportColumnCount).values = headers;
    sheet.getRangeByIndexes(0, 0, 1, reportColumnCount).format.font.bold = true;

    if (issues.length > 0) {
      const rows = issues.map((issue) => [
        issue.severity,
        issue.check,
        issue.sheetName,
        issue.name,
        issue.listName || "",
        issue.rowNumber ? `${issue.sheetName}!R${issue.rowNumber}C${issue.columnNumber || 1}` : "",
        issue.detail
      ]);
      sheet.getRangeByIndexes(1, 0, rows.length, reportColumnCount).values = rows;
    }
    sheet.getUsedRange().format.autofitColumns();
    sheet.getUsedRange().format.autofitRows();
    sheet.activate();
    await context.sync();
  });
}
