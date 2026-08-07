import readXlsxFile from "read-excel-file/browser";
import type { XLSFormData, XLSFormSheetData, XLSFormSheetName } from "../types";

const XLSFORM_SHEETS: XLSFormSheetName[] = ["survey", "choices", "settings"];

export async function readReferenceXLSForm(file: File): Promise<XLSFormData> {
  const workbook = await readXlsxFile(file);
  const result: XLSFormData = {};

  for (const sheetName of XLSFORM_SHEETS) {
    const sheet = workbook.find((candidate) =>
      candidate.sheet.trim().toLowerCase() === sheetName
    );
    if (!sheet) continue;
    result[sheetName] = {
      name: sheetName,
      rows: sheet.data as unknown[][]
    } as XLSFormSheetData;
  }

  return result;
}
