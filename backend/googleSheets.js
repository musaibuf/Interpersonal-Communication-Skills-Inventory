const { google } = require('googleapis');

// --- CONFIGURATION ---
const CREDENTIALS_PATH = './google-credentials.json'; // Path to your credentials file
const SPREADSHEET_ID = '1z7rqUeBgLIe_gbb78ZPU8g8DJNMIpNf8XvDD1cc2HYw'; // Replace with your actual Sheet ID

// Scopes define the level of access you are requesting.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Authenticate with Google Sheets
async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
  });
  const client = await auth.getClient();
  return client;
}

// Function to append data to the sheet
async function appendToSheet(data) {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Define the range where data should be appended. 'A1' means it will find the first empty row.
    const range = 'Sheet1!A1'; 

    // The data to be inserted
    const values = [
      [
        new Date().toISOString(), // Timestamp
        data.name,
        data.company,
        data.scores.section1,
        data.scores.section2,
        data.scores.section3,
        data.scores.section4,
        data.scores.total,
        JSON.stringify(data.responses) // Store all responses as a JSON string
      ]
    ];

    const resource = {
      values,
    };

    // Perform the append operation
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      resource,
    });

    console.log(`${result.data.updates.updatedCells} cells appended.`);
    return result;

  } catch (error) {
    console.error('Error appending data to Google Sheet:', error);
    throw new Error('Failed to update spreadsheet.');
  }
}

module.exports = { appendToSheet };