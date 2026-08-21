
const { google } = require('googleapis');

const auth = new google.auth.JWT({
  email: 'plataforma-liderazgo@cumbre-liderazgo-506117.iam.gserviceaccount.com',
  key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDCM+tpN1vO01Wf\neXfcCFiMgxoTWG8w0rH0RHW/J0KL1nwTZ1h2CVBu35GVFp+OnBUj7uY9Qh2TyWPr\nOaAJADMG72lE4GWui/Rlorb4UQB4304p765tYzDKIAbbEeEBfxgvJEg+7G92DDFq\nXwd+3zoLCF/BI/bsvjfb3EmwpLti4Coe67kG7B0YXJjPJo22d70+eWKRFpjGg2fK\nHM2baq8ODOYpvtEDNbLdTeduR6gde1O7YyZNu1SdqKzxIgKoNmm9f56RPtLhiBl6\nyb5H+7EgH9hMVRVguwcxhyFSv7GS//F1pn9Zujl89x6iU6RwWuJX3inYzCHfbOrg\nn4MxJVSzAgMBAAECggEAO9ZFhbDR7+M78Zw6qyhDKGBIy4cnE3MH88yYPyK4pV+b\n8VqZbh0mlFL8h2RmG0nKVb0JYfyaImweBl9GCR/vmQZxeBBwJBzpW9uL5u0GaTfc\n3J0GMJwsb0r48c0LeCuR5wyV2hV9rnDJVQ4cwCHFv5p/7oHHVmCx02OHrQ7E0gzX\nj10vwOoHuPXdmmPy3oiI9S2+2hbJE/xc2IH2vo2+Iqw1W5vQEttdudygcyv9jJ4i\nZ9z9RpBOvOQqBCTQPhgCslVqiNL/b1RZOhWfCT3RRz9VfPpcsyr29nw5ju/iqZgs\nL1v+PdmVO198hbIvikgFdw3B45OhEBu54llFUUeDkQKBgQD5A/UmA32Wg56OIHF6\nauaaaTVVzumYHwKuGWVGF7+wb4yZOTBu8AwVy05TXaob/GGJtel0XzlQiFgU7Coj\nCmRXtcTlB7wKMd1RBzXYWs4V64tpilRiU8FDwnKj8mIaGZ58UV544V8q/7P9Daj9\ni03zI/vJ/91a14RitqSAFvCxuwKBgQDHpmHz21XFVeeHUDN35iP5paB+tRjXzA9D\nLmFbKUuf36wz8Q+mCANoizr4Idn4/1GbzHV7+zDZiNW8XMNiEh9K75O3nqnDsyGA\nk4o/uV3M1m2AvlP+6Db08ngL/4CtBSQtM7HzwojvnqikfOmRc20cPtW/iL1tiujF\n2j+tthrdaQKBgQC6cIgfigWBp9ISv5+29Err2VGhiWXEC5PKHiGBNU7EHwC5x+PH\na9rghnOCX2J5yaCNprG/+3vCHBM2twtlaOZv9RwSDpRvXZ5CiI98CaC7MLwUrQk5\nBVRyEygaL+Pbfsr2cUW2Y6cJXqG4GX4pNx+Jp6thNjzZQvtPnUfUz1gu+QKBgBJk\n2+VxscdKkNhApV1IkMvxXIYP/Uf0fvt7jHCvr039d4oZjY2Ic3fwS/CMfd6Y91XZ\nUoGntOp11utRyJaCgOuQgxWJwq5LFK0Z6sTQOTokD1arMmXr0xRiOnkwgxRtwtV/\nS8ffhmo9PeBZudMyxTyy9VJ+MKWlBKkl4HQKsRLxAoGBAOW73BwL4D+mKpjb+cod\ngr7/6KkEfnNGW5iPaFvIhmnF/YhHQjbnu2MNNEnWLLSEyHA05D/+Fr5pjY0plTXs\nMDPY5v0pgH2AymMnwQhgy0fJBsMIMziLWHthQb7VrjVAbLaGYCDL7Rw260ASEUEr\nEfNPdVjHNK86Fmu2JwdBcBM0\n-----END PRIVATE KEY-----',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: '1ukcNSduM2345SG6kY3538M3WtHk1TDFMrwIXZR0QYGA',
    range: "'Respuestas de formulario 1'!A1:N6",
  });

  console.log('Filas de Respuestas de formulario 1:');
  (resp.data.values || []).forEach((row, i) => {
    console.log(`Fila ${i+1} (largo ${row.length}):`, JSON.stringify(row));
  });
}

main();
