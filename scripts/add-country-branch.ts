import ExcelJS from "exceljs";

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile("docs/form.xlsx");
  const sheet = wb.getWorksheet("survey");
  if (!sheet) throw new Error("survey sheet missing");

  sheet.insertRow(103, [
    "select_one",
    "country",
    "country",
    "Which country do you live in?",
    null,
    null,
    null,
    "false",
  ]);

  const postcodeRow = sheet.getRow(104);
  postcodeRow.getCell(1).value = "text";
  postcodeRow.getCell(3).value = "postcode";
  postcodeRow.getCell(4).value = "Please enter your full Northern Ireland postcode (e.g. BT12 5AB).";
  postcodeRow.getCell(5).value =
    "This helps us understand how views and experiences may vary across different parts of the island of Ireland. As stated at the beginning, your response will remain anonymous.";
  postcodeRow.getCell(15).value = "${country} = 'ni'";
  postcodeRow.commit();

  sheet.insertRow(105, [
    "text",
    "eircode",
    "Please enter the first 4 characters of your Eircode.",
    "Please enter the first 4 characters of your Eircode (e.g. D02).",
    null,
    null,
    null,
    "false",
    null,
    null,
    null,
    null,
    null,
    null,
    "${country} = 'roi'",
  ]);

  const choices = wb.getWorksheet("choices");
  if (!choices) throw new Error("choices sheet missing");
  choices.insertRow(93, ["country", "ni", "Northern Ireland"]);
  choices.insertRow(94, ["country", "roi", "Republic of Ireland"]);

  await wb.xlsx.writeFile("docs/form.xlsx");
  console.log("Inserted country question and ROI eircode field into docs/form.xlsx");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});