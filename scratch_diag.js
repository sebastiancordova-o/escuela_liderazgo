
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
let rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
  rawKey = rawKey.slice(1, -1);
}
const PRIVATE_KEY = rawKey.replace(/\\n/g, '\n');

console.log('--- DIAGNÓSTICO GOOGLE SHEETS ---');
console.log('Spreadsheet ID:', SPREADSHEET_ID);
console.log('Client Email:', CLIENT_EMAIL);
console.log('Private Key length:', PRIVATE_KEY ? PRIVATE_KEY.length : 0);

const auth = new google.auth.JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
});

async function run() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    console.log('\n1. Intentando obtener metadatos de la hoja...');
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    console.log('¡Éxito conectando a Google Sheet!');
    console.log('Título del documento:', meta.data.properties.title);
    console.log('Hojas encontradas:');
    meta.data.sheets.forEach(s => {
      console.log(` - [ID: ${s.properties.sheetId}] "${s.properties.title}"`);
    });
  } catch (err) {
    console.error('\n❌ ERROR AL CONECTAR CON GOOGLE SHEETS:');
    console.error('Código:', err.code);
    console.error('Mensaje:', err.message);
    if (err.errors) {
      console.error('Detalles:', JSON.stringify(err.errors, null, 2));
    }
  }
}

run();
