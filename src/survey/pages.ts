/**
 * Hand-written grouping of generated questions into wizard pages.
 *
 * The researcher edits docs/form.xlsx for content; this file controls
 * page boundaries and per-page intro copy. Adding a question to the
 * XLSForm without updating this file will leave the new question
 * unassigned to any page — the dev-mode check in development.ts flags that.
 */


import { questions, questionsById } from "./schema.generated";
import type { Question } from "./schema-types";

export type StepId =
  | "welcome"
  | "intro"
  | "species" 
  | "acceptability"
  | "risk"
  | "tolerance"
  | "interactions"
  | "demographics"
  | "thanks";

export interface WizardPage {
  id: StepId;
  title: string;
  intro?: string;
  questions: Question[];
  imagesBefore?: { src: string; alt: string; caption?: string }[];
}

// Helpers
const q = (id: string): Question => {
  const found = questionsById[id];
  if (!found) throw new Error(`Question id "${id}" not found in schema.generated.ts`);
  return found;
};

// Intro page: species identification + confidence + have-you-seen (matrix)
const introQuestions: Question[] = [
  q("species_f"),
  q("confidence_f"),
  q("species_pm"),
  q("confidence_pm"),
  q("seen_pm_matrix"),
];

// Acceptability page
const acceptabilityQuestions: Question[] = [q("pm_scenarios"), q("fox_scenarios")];

// Risk page
const riskQuestions: Question[] = [q("pm_risk"), q("fox_risk")];

// Tolerance page
const toleranceQuestions: Question[] = [q("pm_tolerance"), q("fox_tolerance")];

// Interactions page
const interactionsQuestions: Question[] = [
  q("sp_local_matrix"),
  q("other_interactions"),
  q("season"),
  q("loss_details"),
  q("signs_losses"),
  q("other_sp_interactions"),
];

const demographicsQuestions: Question[] = [
  q("age"),
  q("gender"),
  q("postcode"),
  q("job"),
  q("hobbies"),
  q("comments"),
];

export const wizardPages: WizardPage[] = [
  {
    id: "welcome",
    title: "Welcome",
    intro:
      "A short survey about foxes and pine martens on the island of Ireland. Please read the information below before starting.",
    questions: [],
  },
  {
    id: "intro",
    title: "About the animals",
    intro:
      "We would like to start by asking a few questions about your familiarity with the animals we are studying.",
    questions: introQuestions,
  },

  {
    id: "species",
    title: "Species information",
    intro: "",
    questions: [],
  },

  {
    id: "acceptability",
    title: "Acceptability",
    intro: "",
    questions: acceptabilityQuestions,
  },
  {
    id: "risk",
    title: "Perceived risk",
    intro: "",
    questions: riskQuestions,
  },
  {
    id: "tolerance",
    title: "Tolerance and management",
    intro: "",
    questions: toleranceQuestions,
  },
  {
    id: "interactions",
    title: "Your experiences",
    intro: "",
    questions: interactionsQuestions,
  },
  {
    id: "demographics",
    title: "A little about you",
    intro:
      "These final questions help us understand how views vary. All answers remain anonymous.",
    questions: demographicsQuestions,
  },
  {
    id: "thanks",
    title: "Thank you",
    questions: [],
  },
];

/** The canonical id lookup for any question belonging to any page. */
export const allPageQuestionIds: Set<string> = new Set(
  wizardPages.flatMap((p) =>
    p.questions.flatMap((question) => {
      if (question.kind === "slider-group") {
        return [question.id, ...question.items.map((i) => i.id)];
      }
      if (question.kind === "choice-matrix") {
        const ids = [question.id, ...question.items.map((i) => i.id)];
        if (question.followUps) {
          for (const perRow of Object.values(question.followUps)) {
            for (const qid of Object.values(perRow)) ids.push(qid);
          }
        }
        return ids;
      }
      return [question.id];
    }),
  ),
);

/** Development check */
export function findUnassignedQuestionIds(): string[] {
  const out: string[] = [];
  for (const qu of questions) {
    if (qu.kind === "note") continue;
    if (qu.kind === "slider-group") {
      if (!allPageQuestionIds.has(qu.id)) out.push(qu.id);
      continue;
    }
    if (!allPageQuestionIds.has(qu.id)) out.push(qu.id);
  }
  return out;
}