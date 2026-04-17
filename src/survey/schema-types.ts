/**
 * Shared question types used by the generator output and the UI renderers.
 */

export type Answers = Record<string, unknown>;

export interface Choice {
  value: string;
  label: string;
}

interface QuestionBase {
  id: string;
  prompt: string;
  hint?: string;
  required: boolean;
  visibleIf?: (answers: Answers) => boolean;
}

export interface SingleChoiceQuestion extends QuestionBase {
  kind: "single";
  choices: Choice[];
  layout: "horizontal" | "vertical";
}

export interface MultiChoiceQuestion extends QuestionBase {
  kind: "multi";
  choices: Choice[];
}

export interface SliderQuestion extends QuestionBase {
  kind: "slider";
  leftLabel: string;
  rightLabel: string;
  anchors: string[];
}

export interface SliderGroupQuestion extends QuestionBase {
  kind: "slider-group";
  items: Array<{ id: string; label: string }>;
  leftLabel: string;
  rightLabel: string;
  anchors: string[];
}

export interface ChoiceMatrixQuestion extends QuestionBase {
  kind: "choice-matrix";
  items: Array<{ id: string; label: string }>;
  choices: Choice[];
}

export interface TextQuestion extends QuestionBase {
  kind: "text";
  multiline: boolean;
  validate?: "postcode-ie-ni";
}

export interface NoteQuestion extends QuestionBase {
  kind: "note";
}

export type Question =
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | SliderQuestion
  | SliderGroupQuestion
  | ChoiceMatrixQuestion
  | TextQuestion
  | NoteQuestion;

/**
 * Stored answer shapes. The wizard state preserves these raw shapes; the
 * submission payload flattens them (slider-groups become one key per item).
 */
export type AnswerValue =
  | string
  | string[]
  | number
  | boolean
  | null
  | Record<string, number | null>;
