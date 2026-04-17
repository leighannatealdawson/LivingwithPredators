/**
 * Emits server/apps-script/header-row.tsv — the canonical column order
 * the researcher pastes into row 1 of the Google Sheet so that incoming
 * submissions align with the expected columns.
 *
 * Prepends submission metadata columns, then every question id from the
 * XLSForm `name` column in original sheet order. For slider-group
 * questions, each item id is its own column.
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sheetOrderedIds } from "../src/survey/schema.generated.ts";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const OUT = join(repoRoot, "server", "apps-script", "header-row.tsv");

const METADATA = ["submissionId", "submittedAt", "startedAt", "surveyVersion", "userAgent"];
const header = [...METADATA, ...sheetOrderedIds];
writeFileSync(OUT, header.join("\t") + "\n");
console.log(`Wrote ${OUT} with ${header.length} columns.`);
