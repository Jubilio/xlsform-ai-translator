import { describe, expect, it } from "vitest";
import {
  referencedListName,
  validateXLSFormAgainstReference
} from "../src/services/xlsform-validation.service";
import type { XLSFormData, XLSFormValidationOptions } from "../src/types";

const options: XLSFormValidationOptions = {
  checks: [
    "structure",
    "question_names",
    "list_names",
    "survey_list_names",
    "choices",
    "question_types"
  ],
  passingLists: [],
  language: "pt"
};

function form(
  survey: unknown[][] = [
    ["type", "name"],
    ["select_one yes_no", "consent"],
    ["text", "comment"]
  ],
  choices: unknown[][] = [
    ["list_name", "name"],
    ["yes_no", "yes"],
    ["yes_no", "no"]
  ]
): XLSFormData {
  return {
    survey: { name: "survey", rows: survey },
    choices: { name: "choices", rows: choices }
  };
}

describe("reference XLSForm validation", () => {
  it("returns no issues for identical forms", () => {
    const target = form();
    expect(validateXLSFormAgainstReference(target, target, options)).toEqual([]);
  });

  it("allows questions, lists and options that only exist in dev", () => {
    const target = form();
    const dev = form(
      [
        ["type", "name"],
        ["select_one yes_no", "consent"],
        ["text", "comment"],
        ["select_one local_list", "local_question"]
      ],
      [
        ["list_name", "name"],
        ["yes_no", "yes"],
        ["yes_no", "no"],
        ["yes_no", "unknown"],
        ["local_list", "local_option"]
      ]
    );
    expect(validateXLSFormAgainstReference(target, dev, options)).toEqual([]);
  });

  it("reports missing questions, lists and shared-list options", () => {
    const target = form(
      [
        ["type", "name"],
        ["select_one yes_no", "consent"],
        ["select_one required_list", "required_question"],
        ["text", "comment"]
      ],
      [
        ["list_name", "name"],
        ["yes_no", "yes"],
        ["yes_no", "no"],
        ["required_list", "required_option"]
      ]
    );
    const dev = form(
      [["type", "name"], ["select_one yes_no", "consent"]],
      [["list_name", "name"], ["yes_no", "yes"]]
    );
    const issues = validateXLSFormAgainstReference(target, dev, options);
    expect(issues.some((issue) => issue.check === "question_names" && issue.name === "comment")).toBe(true);
    expect(issues.some((issue) => issue.check === "list_names" && issue.name === "required_list")).toBe(true);
    expect(issues.some((issue) => issue.check === "survey_list_names" && issue.name === "required_list")).toBe(true);
    expect(issues.some((issue) => issue.check === "choices" && issue.name === "no")).toBe(true);
    expect(issues.some((issue) => issue.check === "choices" && issue.name === "required_option")).toBe(false);
  });

  it("compares the type and choice list for each shared question", () => {
    const target = form();
    const dev = form([
      ["type", "name"],
      ["select_one another_list", "consent"],
      ["integer", "comment"]
    ]);
    const issues = validateXLSFormAgainstReference(target, dev, options)
      .filter((issue) => issue.check === "question_types");
    expect(issues.map((issue) => issue.name)).toEqual(["consent", "comment"]);
    expect(issues[0]?.rowNumber).toBe(2);
    expect(issues[0]?.columnNumber).toBe(1);
  });

  it("skips option comparison for configured passing lists", () => {
    const target = form();
    const dev = form(undefined, [
      ["list_name", "name"],
      ["yes_no", "yes"]
    ]);
    const issues = validateXLSFormAgainstReference(target, dev, {
      ...options,
      passingLists: ["YES_NO"]
    });
    expect(issues.some((issue) => issue.check === "choices")).toBe(false);
  });

  it("reports required sheets missing from the current form", () => {
    const issues = validateXLSFormAgainstReference(form(), {}, options);
    expect(issues.some((issue) => issue.check === "structure" && issue.name === "survey")).toBe(true);
    expect(issues.some((issue) => issue.check === "structure" && issue.name === "choices")).toBe(true);
  });
});

describe("referencedListName", () => {
  it("extracts select_one and select_multiple list names", () => {
    expect(referencedListName("select_one yes_no")).toBe("yes_no");
    expect(referencedListName("select_multiple risks or_other")).toBe("risks");
    expect(referencedListName("text")).toBe("");
  });
});
