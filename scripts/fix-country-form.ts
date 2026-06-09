import ExcelJS from "exceljs";

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile("docs/form.xlsx");
  const sheet = wb.getWorksheet("survey");
  if (!sheet) throw new Error("survey sheet missing");

  const countryRow = sheet.getRow(103);
  countryRow.getCell(1).value = "select_one country";
  countryRow.getCell(2).value = "country";
  countryRow.getCell(3).value = "Which country do you live in?";
  countryRow.getCell(4).value = null;
  countryRow.getCell(5).value = null;
  countryRow.getCell(6).value = null;
  countryRow.getCell(7).value = null;
  countryRow.getCell(8).value = "false";
  countryRow.commit();

  const postcodeRow = sheet.getRow(104);
  postcodeRow.getCell(1).value = "text";
  postcodeRow.getCell(2).value = "postcode";
  postcodeRow.getCell(3).value = "Please enter your full Northern Ireland postcode (e.g. BT12 5AB).";
  postcodeRow.getCell(4).value =
    "This helps us understand how views and experiences may vary across different parts of the island of Ireland. As stated at the beginning, your response will remain anonymous.";
  postcodeRow.getCell(8).value = "false";
  postcodeRow.getCell(14).value = "${country} = 'ni'";
  postcodeRow.commit();

  const eircodeRow = sheet.getRow(105);
  eircodeRow.getCell(1).value = "text";
  eircodeRow.getCell(2).value = "eircode";
  eircodeRow.getCell(3).value = "Please enter the first 4 characters of your Eircode.";
  eircodeRow.getCell(4).value = "Please enter the first 4 characters of your Eircode (e.g. D02).";
  eircodeRow.getCell(5).value = null;
  eircodeRow.getCell(6).value = null;
  eircodeRow.getCell(8).value = "false";
  eircodeRow.getCell(14).value = "${country} = 'roi'";
  eircodeRow.commit();

  sheet.spliceRows(106, 1);

  const choices = wb.getWorksheet("choices");
  if (choices) {
    choices.spliceRows(95, 2);
  }

  await wb.xlsx.writeFile("docs/form.xlsx");
  console.log("Repaired docs/form.xlsx rows 103-105 and removed duplicate row 106");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
