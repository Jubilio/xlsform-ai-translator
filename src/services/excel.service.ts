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
    n = Math.floor((