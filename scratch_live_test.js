
const { google } = require('googleapis');

const SPREADSHEET_ID = '1ukcNSduM2345SG6kY3538M3WtHk1TDFMrwIXZR0QYGA';
const CLIENT_EMAIL = 'plataforma-liderazgo@cumbre-liderazgo-506117.iam.gserviceaccount.com';
const PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDCM+tpN1vO01Wf\neXfcCFiMgxoTWG8w0rH0RHW/J0KL1nwTZ1h2CVBu35GVFp+OnBUj7uY9Qh2TyWPr\nOaAJADMG72lE4GWui/Rlorb4UQB4304p765tYzDKIAbbEeEBfxgvJEg+7G92DDFq\nXwd+3zoLCF/BI/bsvjfb3EmwpLti4Coe67kG7B0YXJjPJo22d70+eWKRFpjGg2fK\nHM2baq8ODOYpvtEDNbLdTeduR6gde1O7YyZNu1SdqKzxIgKoNmm9f56RPtLhiBl6\nyb5H+7EgH9hMVRVguwcxhyFSv7GS//F1pn9Zujl89x6iU6RwWuJX3inYzCHfbOrg\nn4MxJVSzAgMBAAECggEAO9ZFhbDR7+M78Zw6qyhDKGBIy4cnE3MH88yYPyK4pV+b\n8VqZbh0mlFL8h2RmG0nKVb0JYfyaImweBl9GCR/vmQZxeBBwJBzpW9uL5u0GaTfc\n3J0GMJwsb0r48c0LeCuR5wyV2hV9rnDJVQ4cwCHFv5p/7oHHVmCx02OHrQ7E0gzX\nj10vwOoHuPXdmmPy3oiI9S2+2hbJE/xc2IH2vo2+Iqw1W5vQEttdudygcyv9jJ4i\nZ9z9RpBOvOQqBCTQPhgCslVqiNL/b1RZOhWfCT3RRz9VfPpcsyr29nw5ju/iqZgs\nL1v+PdmVO198hbIvikgFdw3B45OhEBu54llFUUeDkQKBgQD5A/UmA32Wg56OIHF6\nauaaaTVVzumYHwKuGWVGF7+wb4yZOTBu8AwVy05TXaob/GGJtel0XzlQiFgU7Coj\nCmRXtcTlB7wKMd1RBzXYWs4V64tpilRiU8FDwnKj8mIaGZ58UV544V8q/7P9Daj9\ni03zI/vJ/91a14RitqSAFvCxuwKBgQDHpmHz21XFVeeHUDN35iP5paB+tRjXzA9D\nLmFbKUuf36wz8Q+mCANoizr4Idn4/1GbzHV7+zDZiNW8XMNiEh9K75O3nqnDsyGA\nk4o/uV3M1m2AvlP+6Db08ngL/4CtBSQtM7HzwojvnqikfOmRc20cPtW/iL1tiujF\n2j+tthrdaQKBgQC6cIgfigWBp9ISv5+29Err2VGhiWXEC5PKHiGBNU7EHwC5x+PH\na9rghnOCX2J5yaCNprG/+3vCHBM2twtlaOZv9RwSDpRvXZ5CiI98CaC7MLwUrQk5\nBVRyEygaL+Pbfsr2cUW2Y6cJXqG4GX4pNx+Jp6thNjzZQvtPnUfUz1gu+QKBgBJk\n2+VxscdKkNhApV1IkMvxXIYP/Uf0fvt7jHCvr039d4oZjY2Ic3fwS/CMfd6Y91XZ\nUoGntOp11utRyJaCgOuQgxWJwq5LFK0Z6sTQOTokD1arMmXr0xRiOnkwgxRtwtV/\nS8ffhmo9PeBZudMyxTyy9VJ+MKWlBKkl4HQKsRLxAoGBAOW73BwL4D+mKpjb+cod\ngr7/6KkEfnNGW5iPaFvIhmnF/YhHQjbnu2MNNEnWLLSEyHA05D/+Fr5pjY0plTXs\nMDPY5v0pgH2AymMnwQhgy0fJBsMIMziLWHthQb7VrjVAbLaGYCDL7Rw260ASEUEr\nEfNPdVjHNK86Fmu2JwdBcBM0\n-----END PRIVATE KEY-----';

console.log('=== TEST LIVE GOOGLE SHEET ===');
console.log('Spreadsheet ID:', SPREADSHEET_ID);
console.log('Client Email:', CLIENT_EMAIL);

const auth = new google.auth.JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
});

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    console.log('\n1. Consultando metadata de Google Sheets...');
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    console.log('✅ EXITO: Conexión establecida con la nueva hoja de cálculo!');
    console.log('Título:', meta.data.properties.title);
    console.log('Hojas encontradas:');
    meta.data.sheets.forEach(s => {
      console.log(` - "${s.properties.title}" (ID: ${s.properties.sheetId})`);
    });

    const has2026 = meta.data.sheets.some(s => s.properties.title === '2026');
    if (!has2026) {
      console.log('\n2. Creando pestaña "2026" en Google Sheets...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: '2026',
                }
              }
            }
          ]
        }
      });
      console.log('✅ Pestaña "2026" creada con éxito!');

      const headers = [
        'Marca temporal', 
        'NOMBRE', 
        'APELLIDO 1', 
        'APELLIDO 2', 
        'RUT', 
        'FECHA DE NACIMIENTO', 
        'TELEFONO (+569 XXXXXXXX)', 
        'TIPO DE ASISTENTE', 
        'ORGANIZACION', 
        'EMAIL', 
        'Pastor de Red', 
        'Pago', 
        'Plataforma', 
        'Asistencia'
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "'2026'!A1:N1",
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [headers] },
      });
      console.log('✅ Cabeceras oficiales agregadas a la pestaña "2026"!');
    } else {
      console.log('\n2. La pestaña "2026" ya existe en el Google Sheet.');
    }

    console.log('\n3. Leyendo datos de la hoja principal...');
    const formResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "'Respuestas de formulario 1'!A1:E5",
    });
    console.log('Filas encontradas en Respuestas de formulario 1:', formResp.data.values ? formResp.data.values.length : 0);
    if (formResp.data.values) {
      formResp.data.values.forEach((row, i) => console.log(` Fila ${i+1}:`, row.join(' | ')));
    }

    console.log('\n🎉 ¡TODO CONFIGURADO Y CONECTADO EN VIVO CON GOOGLE SHEETS!');
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    if (err.errors) {
      console.error('Detalles:', JSON.stringify(err.errors, null, 2));
    }
  }
}

main();
