import ExcelJS from "exceljs";
import { resolve } from "node:path";

async function main() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(resolve(process.cwd(), "docs/form.xlsx"));
  const survey = workbook.getWorksheet("survey");
  const choices = workbook.getWorksheet("choices");
  if (!survey || !choices) {
    console.error("Missing survey or choices sheet");
    process.exit(1);
  }
  const header = survey.getRow(1);
  const names = ["type", "name", "label", "hint", "appearance", "required", "relevant", "calculation"];
  const idx = {};
  header.eachCell((cell, col) => {
    const v = String(cell.value ?? "").trim();
    if (names.includes(v)) idx[v] = col;
  });
  console.log("survey rows 100-110:");
  for (let i = 98; i <= 110; i++) {
    const row = survey.getRow(i);
    const obj = {};
    for (const name of names) obj[name] = String(row.getCell(idx[name]).value ?? "");
    console.log(i, obj);
  }
  const choiceHeader = choices.getRow(1);
  const choiceNames = ["list_name", "name", "label"];
  const cidx = {};
  choiceHeader.eachCell((cell, col) => {
    const v = String(cell.value ?? "").trim();
    if (choiceNames.includes(v)) cidx[v] = col;
  });
  console.log("choices for country:");
  for (let i = 1; i <= choices.rowCount; i++) {
    const row = choices.getRow(i);
    if (String(row.getCell(cidx.list_name).value ?? "").trim() === "country") {
      console.log(i, {
        name: String(row.getCell(cidx.name).value ?? ""),
        label: String(row.getCell(cidx.label).value ?? ""),
      });
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});