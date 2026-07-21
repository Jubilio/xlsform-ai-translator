import type { ApplyMetadata, ColumnPlan, PendingTranslation, TranslationPlan } from "../types";
import {
  isFormula,
  isTranslatableHeader,
  isTranslatableValue,
  normaliseHeader,
  targetHeaderFor
} from "./xlsform.service";

function columnToLetters(columnIndex: number): string {
  let n = columnIndex + 1;
  let result = "";
  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

function cellAddress(rowIndex: number, columnIndex: number): string {
  return `${columnToLetters(columnIndex)}${rowIndex + 1}`;
}

export async function collectSelectionPlan(): Promise<TranslationPlan> {
  return Excel.run(async (context) => {
    const range = context.workbook.getSelectedRange();
    range.load(["values", "formulas", "rowCount", "columnCount", "rowIndex", "columnIndex"]);
    range.worksheet.load("name");
    await context.sync();

    const targetStartColumn = range.columnIndex + range.columnCount;
    const targetRange = range.worksheet.getRangeByIndexes(
      range.rowIndex,
      targetStartColumn,
      range.rowCount,
      range.columnCount
    );
    targetRange.load(["values", "formulas"]);
    await context.sync();

    const targetHasContent = targetRange.values.some((row) =>
      row.some((value) => value !== null && value !== undefined && String(value).trim() !== "")
    );
    const targetHasFormula = targetRange.formulas.some((row) =>
      row.some((formula) => isFormula(formula))
    );

    if (targetHasContent || targetHasFormula) {
      throw new Error(
        "O bloco de destino à direita da selecção já contém dados ou fórmulas. Limpe-o ou escolha outra selecção."
      );
    }

    const jobs: PendingTranslation[] = [];
    let skipped = 0;

    for (let r = 0; r < range.rowCount; r++) {
      for (let c = 0; c < range.columnCount; c++) {
        const value = range.values[r]?.[c];
        const formula = range.formulas[r]?.[c];
        if (!isTranslatableValue(value) || isFormula(formula)) {
          skipped++;
          continue;
        }

        const sourceRowIndex = range.rowIndex + r;
        const sourceColumnIndex = range.columnIndex + c;
        const targetRowIndex = sourceRowIndex;
        const targetColumnIndex = targetStartColumn + c;

        jobs.push({
          id: `${range.worksheet.name}!${cellAddress(targetRowIndex, targetColumnIndex)}`,
          sheetName: range.worksheet.name,
          sourceRowIndex,
          sourceColumnIndex,
          targetRowIndex,
          targetColumnIndex,
          original: value,
          translated: "",
          warnings: []
        });
      }
    }

    const columns: ColumnPlan[] = [];
    for (let c = 0; c < range.columnCount; c++) {
      columns.push({
        sheetName: range.worksheet.name,
        sourceColumnIndex: range.columnIndex + c,
        targetColumnIndex: targetStartColumn + c,
        sourceHeader: "",
        targetHeader: "",
        rowCount: range.rowCount,
        createTargetColumn: true
      });
    }

    return { mode: "selection", columns, jobs, skipped };
  });
}

interface XLSFormOptions {
  sheetNames: string[];
  sourceHeaderLanguage: string;
  targetHeaderLanguage: string;
  overwriteExisting: boolean;
}

export async function collectXLSFormPlan(options: XLSFormOptions): Promise<TranslationPlan> {
  return Excel.run(async (context) => {
    const jobs: PendingTranslation[] = [];
    const columns: ColumnPlan[] = [];
    let skipped = 0;

    for (const sheetName of options.sheetNames) {
      const worksheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
      worksheet.load(["name", "isNullObject"]);
      await context.sync();
      if (worksheet.isNullObject) continue;

      const usedRange = worksheet.getUsedRange();
      usedRange.load(["values", "formulas", "rowCount", "columnCount"]);
      await context.sync();

      const headers = (usedRange.values[0] || []).map(normaliseHeader);
      let nextColumnIndex = usedRange.columnCount;

      for (let sourceColumnIndex = 0; sourceColumnIndex < headers.length; sourceColumnIndex++) {
        const sourceHeader = headers[sourceColumnIndex] || "";
        if (!isTranslatableHeader(sourceHeader, options.sourceHeaderLanguage)) continue;

        const targetHeader = targetHeaderFor(sourceHeader, options.targetHeaderLanguage);
        let targetColumnIndex = headers.findIndex(
          (header) => header.toLowerCase() === targetHeader.toLowerCase()
        );
        const createTargetColumn = targetColumnIndex < 0;
        if (createTargetColumn) {
          targetColumnIndex = nextColumnIndex++;
          headers[targetColumnIndex] = targetHeader;
        }

        columns.push({
          sheetName,
          sourceColumnIndex,
          targetColumnIndex,
          sourceHeader,
          targetHeader,
          rowCount: usedRange.rowCount,
          createTargetColumn
        });

        for (let rowIndex = 1; rowIndex < usedRange.rowCount; rowIndex++) {
          const original = usedRange.values[rowIndex]?.[sourceColumnIndex];
          const sourceFormula = usedRange.formulas[rowIndex]?.[sourceColumnIndex];
          const targetValue = createTargetColumn ? "" : usedRange.values[rowIndex]?.[targetColumnIndex];
          const targetFormula = createTargetColumn ? "" : usedRange.formulas[rowIndex]?.[targetColumnIndex];

          if (!isTranslatableValue(original) || isFormula(sourceFormula)) {
            skipped++;
            continue;
          }
          if (isFormula(targetFormula)) {
            skipped++;
            continue;
          }
          if (!options.overwriteExisting && typeof targetValue === "string" && targetValue.trim()) {
            skipped++;
            continue;
          }

          jobs.push({
            id: `${sheetName}!${cellAddress(rowIndex, targetColumnIndex)}`,
            sheetName,
            sourceRowIndex: rowIndex,
            sourceColumnIndex,
            targetRowIndex: rowIndex,
            targetColumnIndex,
            original,
            translated: "",
            warnings: [],
            sourceHeader,
            targetHeader
          });
        }
      }
    }

    return { mode: "xlsform", columns, jobs, skipped };
  });
}

export async function applyTranslationPlan(
  plan: TranslationPlan,
  metadata: ApplyMetadata
): Promise<void> {
  await Excel.run(async (context) => {
    for (const column of plan.columns) {
      const worksheet = context.workbook.worksheets.getItem(column.sheetName);
      if (column.createTargetColumn) {
        const sourceRange = worksheet.getRangeByIndexes(0, column.sourceColumnIndex, column.rowCount, 1);
        const targetRange = worksheet.getRangeByIndexes(0, column.targetColumnIndex, column.rowCount, 1);
        targetRange.copyFrom(sourceRange, Excel.RangeCopyType.formats);
        if (plan.mode === "xlsform") {
          targetRange.getCell(0, 0).values = [[column.targetHeader]];
        }
      }
    }

    for (const job of plan.jobs) {
      const worksheet = context.workbook.worksheets.getItem(job.sheetName);
      worksheet.getCell(job.targetRowIndex, job.targetColumnIndex).values = [[job.translated]];
    }

    await appendTranslationLog(context, plan.jobs, metadata);
    await context.sync();
  });
}

async function appendTranslationLog(
  context: Excel.RequestContext,
  jobs: PendingTranslation[],
  metadata: ApplyMetadata
): Promise<void> {
  if (jobs.length === 0) return;
  const sheets = context.workbook.worksheets;
  const logSheet = sheets.getItemOrNullObject("_translation_log");
  logSheet.load("isNullObject");
  await context.sync();

  const sheet = logSheet.isNullObject ? sheets.add("_translation_log") : logSheet;
  const used = sheet.getUsedRange();
  used.load(["values", "rowCount"]);
  await context.sync();

  const hasHeader = Array.isArray(used.values[0]) && used.values[0]?.[0] === "timestamp";
  const startRow = hasHeader ? used.rowCount : 0;
  const headers: string[][] = [[
    "timestamp",
    "sheet",
    "cell",
    "source_language",
    "target_language",
    "provider",
    "original",
    "translation",
    "warnings"
  ]];
  const now = new Date().toISOString();
  const rows = jobs.map((job) => [
    now,
    job.sheetName,
    cellAddress(job.targetRowIndex, job.targetColumnIndex),
    metadata.sourceLanguage,
    metadata.targetLanguage,
    metadata.provider,
    job.original,
    job.translated,
    job.warnings.join(" | ")
  ]);

  const logColumnCount = 9;
  if (!hasHeader) {
    sheet.getRangeByIndexes(0, 0, 1, logColumnCount).values = headers;
    sheet.getRangeByIndexes(0, 0, 1, logColumnCount).format.font.bold = true;
  }
  const dataStart = hasHeader ? startRow : 1;
  sheet.getRangeByIndexes(dataStart, 0, rows.length, logColumnCount).values = rows;
  sheet.getUsedRange().format.autofitColumns();
  sheet.visibility = Excel.SheetVisibility.hidden;
}
