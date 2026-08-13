const { google } = require("googleapis");
const path = require("path");

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

const scopes = [
  "https://www.googleapis.com/auth/spreadsheets",
];

let auth;

if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64) {
  try {
    const credentials = JSON.parse(
      Buffer.from(
        process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64,
        "base64"
      ).toString("utf8")
    );

    auth = new google.auth.GoogleAuth({
      credentials,
      scopes,
    });
  } catch (error) {
    console.error(
      "Failed to load Google service account credentials:",
      error
    );
    throw error;
  }
} else {
  auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE
    ),
    scopes,
  });
}

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