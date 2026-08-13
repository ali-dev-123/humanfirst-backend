const { google } = require("googleapis");
const path = require("path");

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE
  ),
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

const appendContactMessage = async ({
  name,
  email,
  institution,
  subject,
  message,
}) => {
  const date = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:G",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          name,
          email,
          institution || "",
          subject,
          message,
          date,
          "Website Contact Form",
        ],
      ],
    },
  });
};

module.exports = {
  appendContactMessage,
};