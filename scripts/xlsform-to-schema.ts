/**
 * Reads docs/form.xlsx and emits src/survey/schema.generated.ts.
 *
 * Run: npm run generate:schema
 *      npm run generate:check   (fails if output is out of date)
 *
 * The output is a typed, hand-readable representation of every question,
 * choice list, and `relevant` predicate in the XLSForm. The researcher
 * edits docs/form.xlsx; we regenerate and commit the output.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";
import {
  questionPatches,
  questionReplacements,
  helpersBlock,
} from "./schema-overrides";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const FORM_PATH = join(repoRoot, "docs", "form.xlsx");
const OUT_PATH = join(repoRoot, "src", "survey", "schema.generated.ts");

interface SurveyRow {
  type: string;
  name: string;
  label: string;
  hint: string;
  appearance: string;
  required: string;
  relevant: string;
  calculation: string;
}
interface ChoiceRow {
  list: string;
  name: string;
  label: string;
}

async function parseWorkbook() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(FORM_PATH);

  const surveySheet = wb.getWorksheet("survey");
  const choicesSheet = wb.getWorksheet("choices");
  if (!surveySheet || !choicesSheet) {
    throw new Error("form.xlsx is missing 'survey' or 'choices' sheet.");
  }

  const headerIdx = (sheet: ExcelJS.Worksheet, names: string[]) => {
    const header = sheet.getRow(1);
    const result: Record<string, number> = {};
    for (const n of names) {
      let col = -1;
      header.eachCell((cell, c) => {
        if (String(cell.value ?? "").trim() === n) col = c;
      });
      if (col < 0) throw new Error(`Column "${n}" not found in sheet "${sheet.name}"`);
      result[n] = col;
    }
    return result;
  };

  const sIdx = headerIdx(surveySheet, [
    "type",
    "name",
    "label",
    "hint",
    "appearance",
    "required",
    "relevant",
    "calculation",
  ]);
  const cIdx = headerIdx(choicesSheet, ["list_name", "name", "label"]);

  const cell = (row: ExcelJS.Row, col: number): string => {
    const v = row.getCell(col).value;
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    if (typeof v === "object" && "text" in v && typeof (v as { text: unknown }).text === "string") {
      return (v as { text: string }).text;
    }
    if (typeof v === "object" && "result" in v) {
      return String((v as { result: unknown }).result ?? "");
    }
    return String(v);
  };

  const surveyRows: SurveyRow[] = [];
  surveySheet.eachRow((row, idx) => {
    if (idx === 1) return;
    const r: SurveyRow = {
      type: cell(row, sIdx.type).trim(),
      name: cell(row, sIdx.name).trim(),
      label: cell(row, sIdx.label),
      hint: cell(row, sIdx.hint),
      appearance: cell(row, sIdx.appearance).trim(),
      required: cell(row, sIdx.required).trim(),
      relevant: cell(row, sIdx.relevant).trim(),
      calculation: cell(row, sIdx.calculation).trim(),
    };
    if (!r.type && !r.name && !r.label) return;
    surveyRows.push(r);
  });

  const choiceRows: ChoiceRow[] = [];
  choicesSheet.eachRow((row, idx) => {
    if (idx === 1) return;
    const r: ChoiceRow = {
      list: cell(row, cIdx.list_name).trim(),
      name: cell(row, cIdx.name).trim(),
      label: cell(row, cIdx.label).trim(),
    };
    if (!r.list && !r.name) return;
    choiceRows.push(r);
  });

  return { surveyRows, choiceRows };
}

function groupChoices(rows: ChoiceRow[]): Map<string, Array<{ value: string; label: string }>> {
  const m = new Map<string, Array<{ value: string; label: string }>>();
  for (const r of rows) {
    if (!r.list || !r.name) continue;
    if (!m.has(r.list)) m.set(r.list, []);
    m.get(r.list)!.push({ value: r.name, label: r.label || r.name });
  }
  return m;
}

/**
 * Translate an XLSForm `relevant` expression into a JS predicate body.
 *
 * Supported expression shape (per this form):
 *   ${field} = 'value'
 *   combined with `or` / `and`, optionally with newlines and parens.
 *
 * Anything else throws — better to fail the build than ship a silently
 * broken conditional. Extend here as the researcher's form grows.
 */
function translateRelevant(expr: string): string {
  const cleaned = expr.replace(/\s+/g, " ").trim();
  if (!cleaned) return "true";

  // Tokens we accept: `${field}`, ` = `, quoted strings, `or`, `and`, parens.
  const allowedPattern = /^(?:\$\{[a-z_][a-z0-9_]*\s*\}|\s*=\s*|'[^']*'|\s+or\s+|\s+and\s+|\(|\)|\s)+$/i;
  if (!allowedPattern.test(cleaned)) {
    throw new Error(`Unsupported 'relevant' expression: ${expr}`);
  }

  const js = cleaned
    .replace(/\$\{\s*([a-z_][a-z0-9_]*)\s*\}/gi, (_m, name) => `answers[${JSON.stringify(name)}]`)
    .replace(/\s*=\s*/g, " === ")
    .replace(/\s+or\s+/gi, " || ")
    .replace(/\s+and\s+/gi, " && ");

  return js;
}

interface BaseQ {
  id: string;
  prompt: string;
  hint?: string;
  required: boolean;
  visibleIfExpr?: string; // original expression, for debugging
  visibleIfBody?: string; // translated JS body
}
type Question =
  | (BaseQ & { kind: "single"; choices: Array<{ value: string; label: string }>; layout: "horizontal" | "vertical" })
  | (BaseQ & { kind: "multi"; choices: Array<{ value: string; label: string }> })
  | (BaseQ & {
      kind: "slider";
      leftLabel: string;
      rightLabel: string;
      anchors: string[];
      showPercent?: boolean;
      defaultValue?: number;
    })
  | (BaseQ & {
      kind: "slider-group";
      items: Array<{ id: string; label: string }>;
      leftLabel: string;
      rightLabel: string;
      anchors: string[];
    })
  | (BaseQ & {
      kind: "choice-matrix";
      items: Array<{ id: string; label: string }>;
      choices: Array<{ value: string; label: string }>;
      multi?: boolean;
      exclusive?: string;
    })
  | (BaseQ & { kind: "text"; multiline: boolean; validate?: "postcode-ie-ni" })
  | (BaseQ & { kind: "note" });

interface ParsedForm {
  questions: Question[];
  orderedIds: string[]; // one entry per question (for slider-groups, use group id); used for header row emission
  sheetOrderedIds: string[]; // real XLSForm name column in original order (for CSV header row)
}

interface GroupFrame {
  name: string;
  label: string;
  hint: string;
  appearance: string;
  relevant: string;
}

function isLikertList(list: string): boolean {
  return list.startsWith("likert_");
}

function parseSurvey(rows: SurveyRow[], choices: Map<string, Array<{ value: string; label: string }>>): ParsedForm {
  const questions: Question[] = [];
  const sheetOrderedIds: string[] = [];
  const groupStack: GroupFrame[] = [];

  // Buffered Likert collapse: when a `table-list` group contains only Likert
  // select_one rows, we collect them and emit a single slider-group.
  let likertBuffer: { frame: GroupFrame; rows: SurveyRow[]; list: string } | null = null;

  // Buffered non-Likert choice-matrix collapse: consecutive homogeneous
  // select_one rows inside a `table-list` group become a single matrix
  // question using the group's label as the prompt.
  let matrixBuffer:
    | { frame: GroupFrame; rows: SurveyRow[]; list: string; labelConsumed: boolean }
    | null = null;
  // Has the current group's label already been attached to an emitted question?
  // Prevents re-using the label for a second matrix / row in the same group.
  let groupLabelConsumed = false;

  const currentRelevant = (ownRelevant: string): string => {
    const parts: string[] = [];
    for (const f of groupStack) if (f.relevant) parts.push(f.relevant);
    if (ownRelevant) parts.push(ownRelevant);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0];
    return parts.map((p) => `(${p})`).join(" and ");
  };

  const flushMatrix = () => {
    if (!matrixBuffer) return;
    const { frame, rows: mrows, list } = matrixBuffer;
    const listChoices = choices.get(list) || [];
    if (listChoices.length === 0) {
      throw new Error(`Choice list "${list}" has no choices.`);
    }

    // Only collapse into a matrix when every row shares the same own-relevant
    // expression. If rows have row-specific conditions (e.g. the experience
    // group, where each row depends on a different sp_<context> gate), keep
    // them as individual single-choice questions so per-row visibility is
    // preserved.
    const allSameRelevant = mrows.every((r) => r.relevant === mrows[0].relevant);

    const topOfStack = groupStack[groupStack.length - 1];
    const parentRelevants: string[] = [];
    for (const f of groupStack) {
      if (f === frame && topOfStack === frame) continue;
      if (f.relevant) parentRelevants.push(f.relevant);
    }
    if (frame.relevant) parentRelevants.push(frame.relevant);

    if (!allSameRelevant) {
      // Fall back to individual questions with each row's own relevant combined
      // with parent relevants.
      for (const r of mrows) {
        const rowParts = [...parentRelevants];
        if (r.relevant) rowParts.push(r.relevant);
        const rowCombined =
          rowParts.length === 0
            ? ""
            : rowParts.length === 1
              ? rowParts[0]
              : rowParts.map((p) => `(${p})`).join(" and ");
        const layout: "horizontal" | "vertical" =
          r.appearance.includes("horizontal") || listChoices.length <= 3 ? "horizontal" : "vertical";
        questions.push({
          kind: "single",
          id: r.name,
          prompt: r.label || "",
          hint: r.hint || undefined,
          required: false,
          choices: listChoices,
          layout,
          ...(rowCombined
            ? { visibleIfExpr: rowCombined, visibleIfBody: translateRelevant(rowCombined) }
            : {}),
        });
        sheetOrderedIds.push(r.name);
      }
      matrixBuffer = null;
      return;
    }

    // All rows share the same (possibly empty) relevant — emit a single matrix
    const ownRelevant = mrows[0].relevant;
    const combinedParts = [...parentRelevants];
    if (ownRelevant) combinedParts.push(ownRelevant);
    const combined =
      combinedParts.length === 0
        ? ""
        : combinedParts.length === 1
          ? combinedParts[0]
          : combinedParts.map((p) => `(${p})`).join(" and ");

    const useGroupLabel = !groupLabelConsumed && frame.label;
    const prompt = useGroupLabel ? frame.label : mrows[0].label;
    if (useGroupLabel) groupLabelConsumed = true;

    const q: Question = {
      kind: "choice-matrix",
      id: mrows[0].name + "_matrix",
      prompt,
      hint: frame.hint || mrows[0].hint || undefined,
      required: false,
      items: mrows.map((r) => ({ id: r.name, label: r.label })),
      choices: listChoices,
      ...(combined ? { visibleIfExpr: combined, visibleIfBody: translateRelevant(combined) } : {}),
    };
    questions.push(q);
    for (const r of mrows) sheetOrderedIds.push(r.name);
    matrixBuffer = null;
  };

  const flushLikert = () => {
    if (!likertBuffer) return;
    const { frame, rows: lrows, list } = likertBuffer;
    const listChoices = choices.get(list) || [];
    if (listChoices.length === 0) {
      throw new Error(`Likert list "${list}" has no choices.`);
    }
    const leftLabel = listChoices[0].label;
    const rightLabel = listChoices[listChoices.length - 1].label;
    const anchors = listChoices.map((c) => c.label);

    // Slider-group visibility = group frame's own relevant (rows inside a
    // table-list group share it), ignoring any parent-group relevant because
    // we accumulate those via currentRelevant when we emit.
    const ownRelevant = frame.relevant;
    // Compose with parent relevants from groupStack (excluding the current frame
    // which was already popped when we flush).
    const parentRelevant: string[] = [];
    for (const f of groupStack) if (f.relevant) parentRelevant.push(f.relevant);
    const parts: string[] = [];
    for (const p of parentRelevant) parts.push(p);
    if (ownRelevant) parts.push(ownRelevant);
    const combined = parts.length === 0 ? "" : parts.length === 1 ? parts[0] : parts.map((p) => `(${p})`).join(" and ");

    const q: Question = {
      kind: "slider-group",
      id: frame.name || lrows[0].name,
      prompt: frame.label,
      required: false,
      leftLabel,
      rightLabel,
      anchors,
      items: lrows.map((r) => ({ id: r.name, label: r.label })),
      ...(combined ? { visibleIfExpr: combined, visibleIfBody: translateRelevant(combined) } : {}),
    };
    questions.push(q);
    for (const r of lrows) sheetOrderedIds.push(r.name);
    likertBuffer = null;
  };

  for (const row of rows) {
    const t = row.type;

    if (t === "begin_group") {
      if (likertBuffer) flushLikert();
      if (matrixBuffer) flushMatrix();
      groupStack.push({
        name: row.name,
        label: row.label,
        hint: row.hint,
        appearance: row.appearance,
        relevant: row.relevant,
      });
      groupLabelConsumed = false;
      continue;
    }
    if (t === "end_group") {
      // Pop AFTER flush so the flushing routine can still see parent-relevants
      // for the closing group.
      if (likertBuffer) {
        groupStack.pop();
        flushLikert();
      } else if (matrixBuffer) {
        groupStack.pop();
        flushMatrix();
      } else {
        groupStack.pop();
      }
      groupLabelConsumed = false;
      continue;
    }

    if (t === "note") {
      // Consent/intro notes are handled by the welcome page itself; the
      // generator still records them as `note` questions so other pages can
      // opt-in to rendering them if they want.
      questions.push({
        kind: "note",
        id: row.name,
        prompt: row.label,
        required: false,
      });
      sheetOrderedIds.push(row.name);
      continue;
    }

    // select_one / select_multiple — look up the list and decide the shape.
    const selectOneMatch = /^select_one\s+(\S+)/.exec(t);
    const selectMultiMatch = /^select_multiple\s+(\S+)/.exec(t);

    if (selectOneMatch) {
      const list = selectOneMatch[1];
      const currentFrame = groupStack[groupStack.length - 1];

      // Likert collapse: inside a table-list group, accumulate rows that share a Likert list.
      if (currentFrame && currentFrame.appearance === "table-list" && isLikertList(list)) {
        if (matrixBuffer) flushMatrix();
        if (!likertBuffer) {
          likertBuffer = { frame: currentFrame, rows: [], list };
        }
        if (likertBuffer.list !== list) {
          flushLikert();
          likertBuffer = { frame: currentFrame, rows: [], list };
        }
        likertBuffer.rows.push(row);
        continue;
      }

      // Non-Likert matrix collapse: inside a table-list group, collect consecutive
      // rows sharing the same choice list into a single choice-matrix question.
      // This handles the "Have you ever seen..." (yes_no_unsure) and the wildlife-
      // interactions (sp list) groups — presenting them as one question with a
      // shared header instead of N micro-questions with only an item label.
      if (currentFrame && currentFrame.appearance === "table-list") {
        if (likertBuffer) flushLikert();
        if (matrixBuffer && matrixBuffer.list !== list) flushMatrix();
        if (!matrixBuffer) {
          matrixBuffer = { frame: currentFrame, rows: [], list, labelConsumed: false };
        }
        matrixBuffer.rows.push(row);
        continue;
      }

      // Standalone single-choice outside any table-list group.
      if (likertBuffer) flushLikert();
      if (matrixBuffer) flushMatrix();

      const listChoices = choices.get(list) || [];
      if (listChoices.length === 0) {
        throw new Error(`Choice list "${list}" referenced by question "${row.name}" has no rows.`);
      }
      const layout: "horizontal" | "vertical" =
        row.appearance.includes("horizontal") || listChoices.length <= 3 ? "horizontal" : "vertical";

      const rel = currentRelevant(row.relevant);
      questions.push({
        kind: "single",
        id: row.name,
        prompt: row.label || "",
        hint: row.hint || undefined,
        required: false,
        choices: listChoices,
        layout,
        ...(rel ? { visibleIfExpr: rel, visibleIfBody: translateRelevant(rel) } : {}),
      });
      sheetOrderedIds.push(row.name);
      continue;
    }

    if (selectMultiMatch) {
      if (likertBuffer) flushLikert();
      if (matrixBuffer) flushMatrix();
      const list = selectMultiMatch[1];
      const listChoices = choices.get(list) || [];
      const rel = currentRelevant(row.relevant);
      questions.push({
        kind: "multi",
        id: row.name,
        prompt: row.label,
        hint: row.hint || undefined,
        required: false,
        choices: listChoices,
        ...(rel ? { visibleIfExpr: rel, visibleIfBody: translateRelevant(rel) } : {}),
      });
      sheetOrderedIds.push(row.name);
      continue;
    }

    if (t === "text" || t === "text ") {
      if (likertBuffer) flushLikert();
      if (matrixBuffer) flushMatrix();
      const rel = currentRelevant(row.relevant);
      const multiline = row.name !== "postcode";
      const validate: "postcode-ie-ni" | undefined = row.name === "postcode" ? "postcode-ie-ni" : undefined;
      questions.push({
        kind: "text",
        id: row.name,
        prompt: row.label,
        hint: row.hint || undefined,
        required: false,
        multiline,
        validate,
        ...(rel ? { visibleIfExpr: rel, visibleIfBody: translateRelevant(rel) } : {}),
      });
      sheetOrderedIds.push(row.name);
      continue;
    }

    if (t === "range") {
      if (likertBuffer) flushLikert();
      if (matrixBuffer) flushMatrix();
      // Confidence questions: 1–10 in the XLSForm, but we upgrade to 0–100.
      const rel = currentRelevant(row.relevant);
      questions.push({
        kind: "slider",
        id: row.name,
        prompt: row.label,
        hint: row.hint || undefined,
        required: false,
        leftLabel: "Not at all confident",
        rightLabel: "Very confident",
        anchors: [],
        ...(rel ? { visibleIfExpr: rel, visibleIfBody: translateRelevant(rel) } : {}),
      });
      sheetOrderedIds.push(row.name);
      continue;
    }

    if (t === "calculate" || t === "start" || t === "end" || t === "today") {
      // Metadata / computed fields — skip in the UI schema.
      continue;
    }

    // Standalone Likert select outside a table-list group
    const standaloneLikertMatch = /^select_one\s+(likert_\S+)/.exec(t);
    if (standaloneLikertMatch) {
      if (likertBuffer) flushLikert();
      if (matrixBuffer) flushMatrix();
      const list = standaloneLikertMatch[1];
      const listChoices = choices.get(list) || [];
      const rel = currentRelevant(row.relevant);
      questions.push({
        kind: "slider",
        id: row.name,
        prompt: row.label,
        hint: row.hint || undefined,
        required: false,
        leftLabel: listChoices[0]?.label || "",
        rightLabel: listChoices[listChoices.length - 1]?.label || "",
        anchors: listChoices.map((c) => c.label),
        ...(rel ? { visibleIfExpr: rel, visibleIfBody: translateRelevant(rel) } : {}),
      });
      sheetOrderedIds.push(row.name);
      continue;
    }

    throw new Error(`Unsupported row type "${t}" for name "${row.name}".`);
  }

  if (likertBuffer) flushLikert();
  if (matrixBuffer) flushMatrix();

  applyOverrides(questions);

  const orderedIds = questions.map((q) => q.id);
  return { questions, orderedIds, sheetOrderedIds };
}

/**
 * Apply hand-written overrides from schema-overrides.ts. First, any full
 * replacements (swap a question's kind and content). Then, scalar patches
 * and visibleIf body rewrites.
 */
function applyOverrides(questions: Question[]): void {
  for (let i = 0; i < questions.length; i++) {
    const existing = questions[i];
    const replacement = questionReplacements[existing.id];
    if (replacement) {
      // Preserve the original visibleIf unless the replacement provides its
      // own. This lets us change kind without re-writing visibility rules.
      const next: Question = {
        ...(replacement as Question),
      };
      if (next.visibleIfBody === undefined && existing.visibleIfBody !== undefined) {
        next.visibleIfBody = existing.visibleIfBody;
        next.visibleIfExpr = existing.visibleIfExpr;
      }
      questions[i] = next;
    }

    const q = questions[i];
    const patch = questionPatches[q.id];
    if (!patch) continue;
    if (patch.prompt !== undefined) q.prompt = patch.prompt;
    if (patch.hint !== undefined) q.hint = patch.hint;
    if (patch.required !== undefined) q.required = patch.required;
    if (patch.visibleIfBody !== undefined) {
      q.visibleIfBody = patch.visibleIfBody;
      q.visibleIfExpr = q.visibleIfExpr ?? "<override>";
    }
    if (q.kind === "slider" || q.kind === "slider-group") {
      if (patch.leftLabel !== undefined) q.leftLabel = patch.leftLabel;
      if (patch.rightLabel !== undefined) q.rightLabel = patch.rightLabel;
      if (patch.anchors !== undefined) q.anchors = patch.anchors;
    }
    if (q.kind === "slider") {
      if (patch.showPercent !== undefined) q.showPercent = patch.showPercent;
      if (patch.defaultValue !== undefined) q.defaultValue = patch.defaultValue;
    }
    if (q.kind === "choice-matrix" || q.kind === "single" || q.kind === "multi") {
      if (patch.choices !== undefined) q.choices = patch.choices;
    }
    if (q.kind === "choice-matrix") {
      if (patch.multi !== undefined) q.multi = patch.multi;
      if (patch.exclusive !== undefined) q.exclusive = patch.exclusive;
    }
  }
}

function emit(parsed: ParsedForm): string {
  const header = [
    "// ============================================================",
    "// GENERATED FROM docs/form.xlsx — DO NOT EDIT BY HAND.",
    "// Run `npm run generate:schema` to regenerate.",
    "// Overrides (prompt tweaks, multi-select matrix, helper-based",
    "// predicates, etc.) live in scripts/schema-overrides.ts — edit",
    "// that file, not this one.",
    "// ============================================================",
    "",
    'import type { Question } from "./schema-types";',
    "",
    "type Answers = Record<string, unknown>;",
    "",
    helpersBlock,
  ].join("\n");

  const questionLiterals = parsed.questions
    .map((q) => {
      const base: string[] = [
        `    id: ${JSON.stringify(q.id)}`,
        `    kind: ${JSON.stringify(q.kind)}`,
        `    prompt: ${JSON.stringify(q.prompt)}`,
      ];
      if ("hint" in q && q.hint) base.push(`    hint: ${JSON.stringify(q.hint)}`);
      base.push(`    required: ${q.required}`);

      switch (q.kind) {
        case "single":
          base.push(`    choices: ${JSON.stringify(q.choices)}`);
          base.push(`    layout: ${JSON.stringify(q.layout)}`);
          break;
        case "multi":
          base.push(`    choices: ${JSON.stringify(q.choices)}`);
          break;
        case "slider":
          base.push(`    leftLabel: ${JSON.stringify(q.leftLabel)}`);
          base.push(`    rightLabel: ${JSON.stringify(q.rightLabel)}`);
          base.push(`    anchors: ${JSON.stringify(q.anchors)}`);
          if (q.showPercent !== undefined)
            base.push(`    showPercent: ${JSON.stringify(q.showPercent)}`);
          if (q.defaultValue !== undefined)
            base.push(`    defaultValue: ${JSON.stringify(q.defaultValue)}`);
          break;
        case "slider-group":
          base.push(`    leftLabel: ${JSON.stringify(q.leftLabel)}`);
          base.push(`    rightLabel: ${JSON.stringify(q.rightLabel)}`);
          base.push(`    anchors: ${JSON.stringify(q.anchors)}`);
          base.push(`    items: ${JSON.stringify(q.items)}`);
          break;
        case "choice-matrix":
          if (q.multi) base.push(`    multi: ${JSON.stringify(q.multi)}`);
          if (q.exclusive !== undefined)
            base.push(`    exclusive: ${JSON.stringify(q.exclusive)}`);
          base.push(`    items: ${JSON.stringify(q.items)}`);
          base.push(`    choices: ${JSON.stringify(q.choices)}`);
          break;
        case "text":
          base.push(`    multiline: ${q.multiline}`);
          if (q.validate) base.push(`    validate: ${JSON.stringify(q.validate)}`);
          break;
        case "note":
          break;
      }

      if (q.visibleIfBody) {
        base.push(`    visibleIf: (answers: Answers) => ${q.visibleIfBody}`);
      }

      return `  {\n${base.join(",\n")},\n  }`;
    })
    .join(",\n");

  const body = [
    "export const questions: Question[] = [",
    questionLiterals,
    "];",
    "",
    "export const questionsById: Record<string, Question> = Object.fromEntries(",
    "  questions.map((q) => [q.id, q])",
    ");",
    "",
    "// XLSForm question names in original sheet order — used for the",
    "// canonical Google Sheet header row.",
    `export const sheetOrderedIds: string[] = ${JSON.stringify(parsed.sheetOrderedIds, null, 2)};`,
    "",
  ].join("\n");

  return `${header}\n${body}`;
}

async function main() {
  const checkMode = process.argv.includes("--check");
  const { surveyRows, choiceRows } = await parseWorkbook();
  const choices = groupChoices(choiceRows);
  const parsed = parseSurvey(surveyRows, choices);
  const output = emit(parsed);

  if (checkMode) {
    let existing = "";
    try {
      existing = readFileSync(OUT_PATH, "utf8");
    } catch {
      existing = "";
    }
    if (existing.trim() !== output.trim()) {
      console.error(
        "ERROR: src/survey/schema.generated.ts is out of date. Run `npm run generate:schema` and commit.",
      );
      process.exit(1);
    }
    console.log("schema.generated.ts is up to date.");
    return;
  }

  writeFileSync(OUT_PATH, output);
  console.log(
    `Wrote ${OUT_PATH} with ${parsed.questions.length} questions (${parsed.sheetOrderedIds.length} output columns).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
