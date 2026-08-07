import type {
  XLSFormData,
  XLSFormSheetData,
  XLSFormValidationIssue,
  XLSFormValidationOptions
} from "../types";

interface ParsedRow {
  values: Record<string, string>;
  rowNumber: number;
  columns: Record<string, number>;
}

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalise(value: unknown): string {
  return text(value).toLowerCase().replace(/\s+/g, " ");
}

function parseRows(sheet?: XLSFormSheetData): ParsedRow[] {
  if (!sheet || sheet.rows.length === 0) return [];
  const headers = (sheet.rows[0] || []).map(normalise);
  return sheet.rows.slice(1).map((row, index) => {
    const values: Record<string, string> = {};
    const columns: Record<string, number> = {};
    headers.forEach((header, columnIndex) => {
      if (!header || values[header] !== undefined) return;
      values[header] = text(row?.[columnIndex]);
      columns[header] = columnIndex + 1;
    });
    return { values, columns, rowNumber: index + 2 };
  });
}

function valueMap(rows: ParsedRow[], key: string): Map<string, ParsedRow> {
  const result = new Map<string, ParsedRow>();
  for (const row of rows) {
    const value = normalise(row.values[key]);
    if (value && !result.has(value)) result.set(value, row);
  }
  return result;
}

function definedLists(rows: ParsedRow[]): Set<string> {
  return new Set(rows.map((row) => normalise(row.values.list_name)).filter(Boolean));
}

export function referencedListName(type: unknown): string {
  const match = text(type).match(/^select_(?:one|multiple)\s+([^\s]+)/i);
  return match?.[1]?.trim() || "";
}

function referencedLists(rows: ParsedRow[]): Set<string> {
  return new Set(rows.map((row) => normalise(referencedListName(row.values.type))).filter(Boolean));
}

function message(
  language: "pt" | "en",
  pt: string,
  en: string
): string {
  return language === "en" ? en : pt;
}

export function validateXLSFormAgainstReference(
  target: XLSFormData,
  dev: XLSFormData,
  options: XLSFormValidationOptions
): XLSFormValidationIssue[] {
  const issues: XLSFormValidationIssue[] = [];
  const checks = new Set(options.checks);
  const passingLists = new Set(options.passingLists.map(normalise).filter(Boolean));
  const targetSurvey = parseRows(target.survey);
  const devSurvey = parseRows(dev.survey);
  const targetChoices = parseRows(target.choices);
  const devChoices = parseRows(dev.choices);

  if (checks.has("structure")) {
    for (const sheetName of ["survey", "choices"] as const) {
      if (!target[sheetName]) {
        issues.push({
          check: "structure", severity: "error", sheetName, name: sheetName,
          detail: message(options.language,
            `A folha ${sheetName} não existe no formulário de referência.`,
            `The ${sheetName} sheet is missing from the reference form.`)
        });
      }
      if (!dev[sheetName]) {
        issues.push({
          check: "structure", severity: "error", sheetName, name: sheetName,
          detail: message(options.language,
            `A folha ${sheetName} não existe no formulário actual.`,
            `The ${sheetName} sheet is missing from the current form.`)
        });
      }
    }
  }

  const targetQuestions = valueMap(targetSurvey, "name");
  const devQuestions = valueMap(devSurvey, "name");

  if (checks.has("question_names")) {
    for (const [name] of targetQuestions) {
      if (devQuestions.has(name)) continue;
      issues.push({
        check: "question_names", severity: "error", sheetName: "survey", name,
        detail: message(options.language,
          `A pergunta “${name}” é obrigatória na referência, mas não existe no formulário actual.`,
          `Question “${name}” is required by the reference but is missing from the current form.`)
      });
    }
  }

  if (checks.has("question_types")) {
    for (const [name, targetRow] of targetQuestions) {
      const devRow = devQuestions.get(name);
      if (!devRow) continue;
      const targetType = normalise(targetRow.values.type);
      const devType = normalise(devRow.values.type);
      if (targetType === devType) continue;
      issues.push({
        check: "question_types", severity: "error", sheetName: "survey", name,
        listName: referencedListName(targetRow.values.type) || undefined,
        rowNumber: devRow.rowNumber,
        columnNumber: devRow.columns.type,
        detail: message(options.language,
          `A pergunta “${name}” usa “${devRow.values.type}”, mas a referência exige “${targetRow.values.type}”.`,
          `Question “${name}” uses “${devRow.values.type}”, but the reference requires “${targetRow.values.type}”.`)
      });
    }
  }

  const targetDefinedLists = definedLists(targetChoices);
  const devDefinedLists = definedLists(devChoices);
  if (checks.has("list_names")) {
    for (const listName of targetDefinedLists) {
      if (devDefinedLists.has(listName)) continue;
      issues.push({
        check: "list_names", severity: "error", sheetName: "choices",
        name: listName, listName,
        detail: message(options.language,
          `A lista “${listName}” é definida na referência, mas não existe em choices.`,
          `List “${listName}” is defined in the reference but is missing from choices.`)
      });
    }
  }

  if (checks.has("survey_list_names")) {
    const targetReferencedLists = referencedLists(targetSurvey);
    const devReferencedLists = referencedLists(devSurvey);
    for (const listName of targetReferencedLists) {
      if (devReferencedLists.has(listName)) continue;
      issues.push({
        check: "survey_list_names", severity: "error", sheetName: "survey",
        name: listName, listName,
        detail: message(options.language,
          `A lista “${listName}” é utilizada na referência, mas não é utilizada no survey actual.`,
          `List “${listName}” is referenced by the reference but not by the current survey.`)
      });
    }
  }

  if (checks.has("choices")) {
    const devOptions = new Set(devChoices.map((row) =>
      `${normalise(row.values.list_name)}\u0000${normalise(row.values.name)}`
    ));
    for (const targetRow of targetChoices) {
      const listName = normalise(targetRow.values.list_name);
      const name = normalise(targetRow.values.name);
      if (!listName || !name || passingLists.has(listName) || !devDefinedLists.has(listName)) continue;
      if (devOptions.has(`${listName}\u0000${name}`)) continue;
      const firstDevListRow = devChoices.find((row) => normalise(row.values.list_name) === listName);
      issues.push({
        check: "choices", severity: "error", sheetName: "choices", name, listName,
        rowNumber: firstDevListRow?.rowNumber,
        columnNumber: firstDevListRow?.columns.name,
        detail: message(options.language,
          `A opção “${name}” da lista “${listName}” existe na referência, mas não no formulário actual.`,
          `Option “${name}” in list “${listName}” exists in the reference but not in the current form.`)
      });
    }
  }

  return issues;
}
