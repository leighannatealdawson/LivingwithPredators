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
  /** Hide the 0-100 percentage readout (good for categorical/bipolar scales
   *  where the raw number is meaningless). */
  showPercent?: boolean;
  /** Initial visual position when the value is null (e.g. 50 for a bipolar
   *  scale that should start centered on "Neutral"). */
  defaultValue?: number;
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
  /** When true, each row stores a string[] of selected values and renders as
   *  checkboxes rather than radios. */
  multi?: boolean;
  /** Only meaningful with multi=true. The value listed here is mutually
   *  exclusive: selecting it clears the rest of the row, and selecting any
   *  other option removes this one. Typical use: "neither". */
  exclusive?: string;
  /** Per-row follow-up questions. Keyed by row item id and then by choice
   *  value: when the row's selection includes that choice, the referenced
   *  question is rendered directly underneath the row. */
  followUps?: Record<string, Record<string, string>>;
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
