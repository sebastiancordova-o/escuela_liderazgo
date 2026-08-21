import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import * as xlsx from 'xlsx';
import { Attendee, StatsData } from '@/types/attendee';
import { cleanRut, formatRut, extractPriceFromText, formatPhoneStrict, isAttendeePrepaid } from '@/lib/rut';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1ukcNSduM2345SG6kY3538M3WtHk1TDFMrwIXZR0QYGA';
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || '';

function getParsedPrivateKey(): string {
  let key = process.env.GOOGLE_PRIVATE_KEY || '';
  key = key.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, '\n');
}

const PRIVATE_KEY = getParsedPrivateKey();
const FORM_SHEET_NAME = 'Respuestas de formulario 1';
const TABLE_2026_SHEET_NAME = '2026';

let localFormCache: string[][] | null = null;
let local2026Cache: string[][] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 1500;

export function isGoogleConfigured(): boolean {
  return Boolean(
    CLIENT_EMAIL && 
    CLIENT_EMAIL.includes('@') && 
    PRIVATE_KEY && 
    PRIVATE_KEY.includes('PRIVATE KEY') &&
    SPREADSHEET_ID
  );
}

function getGoogleAuth() {
  return new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
  });
}

function getLocalExcelWorkbook(): xlsx.WorkBook | null {
  try {
    const excelPath = path.join(process.cwd(), 'Cumbre Liderazgo Lab.xlsx');
    if (!fs.existsSync(excelPath)) return null;
    const fileBuffer = fs.readFileSync(excelPath);
    return xlsx.read(fileBuffer, { type: 'buffer' });
  } catch (e) {
    console.error('Error reading local excel:', e);
    return null;
  }
}

function getLocalFormRows(): string[][] {
  const now = Date.now();
  if (localFormCache && (now - lastCacheTime < CACHE_TTL)) {
    return localFormCache;
  }

  const wb = getLocalExcelWorkbook();
  if (!wb) return localFormCache || [];

  let sheetName = FORM_SHEET_NAME;
  if (!wb.Sheets[sheetName]) {
    sheetName = wb.SheetNames.find(n => n.includes('Respuestas') || n.includes('Formulario')) || wb.SheetNames[0];
  }
  const worksheet = wb.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json<string[]>(worksheet, { header: 1, defval: '' });
  
  localFormCache = data.map(row => (Array.isArray(row) ? row.map(c => String(c ?? '').trim()) : []));
  lastCacheTime = now;
  return localFormCache;
}

function getLocal2026Rows(): string[][] {
  if (local2026Cache) return local2026Cache;

  const wb = getLocalExcelWorkbook();
  if (wb && wb.Sheets[TABLE_2026_SHEET_NAME]) {
    const data = xlsx.utils.sheet_to_json<string[]>(wb.Sheets[TABLE_2026_SHEET_NAME], { header: 1, defval: '' });
    local2026Cache = data.map(row => (Array.isArray(row) ? row.map(c => String(c ?? '').trim()) : []));
    return local2026Cache;
  }

  local2026Cache = [
    [
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
    ]
  ];
  return local2026Cache;
}

function rowToAttendee(row: string[], rowIndex: number): Attendee {
  const rutRaw = String(row[4] || '').trim();
  const asistenciaVal = String(row[13] || '').trim();
  const asistio = ['SÍ', 'SI', 'LLEGO', 'LLEGÓ', 'PRESENTE', 'OK', 'YES', 'TRUE'].includes(asistenciaVal.toUpperCase());
  const tipo = String(row[7] || 'Adhesión General ($12.000)').trim();
  const pagoRaw = String(row[11] || '').trim();
  const precioParsed = !isNaN(Number(pagoRaw)) && Number(pagoRaw) > 500 ? Number(pagoRaw) : extractPriceFromText(tipo);
  const telefonoClean = formatPhoneStrict(String(row[6] || '').trim());

  return {
    rowIndex,
    timestamp: String(row[0] || '').trim(),
    nombre: String(row[1] || '').trim(),
    apellido1: String(row[2] || '').trim(),
    apellido2: String(row[3] || '').trim(),
    rut: formatRut(rutRaw) || rutRaw,
    rutClean: cleanRut(rutRaw),
    fechaNacimiento: String(row[5] || '').trim(),
    telefono: telefonoClean,
    tipoAsistente: tipo,
    organizacion: String(row[8] || '').trim(),
    email: String(row[9] || '').trim(),
    pastorRed: String(row[10] || '').trim(),
    pago: pagoRaw,
    precioPagado: precioParsed,
    plataforma: String(row[12] || '').trim(),
    asistencia: asistenciaVal,
    asistio,
  };
}

export async function getAllAttendees(): Promise<{ attendees: Attendee[]; source: 'google_sheets' | 'local_excel' }> {
  if (isGoogleConfigured()) {
    try {
      const auth = getGoogleAuth();
      const sheets = google.sheets({ version: 'v4', auth });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${FORM_SHEET_NAME}'!A:N`,
      });

      const rows = response.data.values || [];
      const attendees: Attendee[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] || [];
        if (row.length > 0 && (row[1] || row[4])) {
          attendees.push(rowToAttendee(row.map(c => String(c ?? '').trim()), i + 1));
        }
      }
      return { attendees, source: 'google_sheets' };
    } catch (error: any) {
      console.warn('Google Sheets API fallback triggered:', error.message || error);
    }
  }

  const rows = getLocalFormRows();
  const attendees: Attendee[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    if (row.length > 0 && (row[1] || row[4])) {
      attendees.push(rowToAttendee(row, i + 1));
    }
  }
  return { attendees, source: 'local_excel' };
}

export async function findAttendeeByRut(searchRut: string): Promise<{ attendee: Attendee | null; source: 'google_sheets' | 'local_excel' }> {
  const targetClean = cleanRut(searchRut);
  if (!targetClean) return { attendee: null, source: 'local_excel' };

  // First check in sheet 2026
  const { attendees: attendees2026, source: src2026 } = await getTable2026Attendees();
  const found2026 = attendees2026.find(a => a.rutClean === targetClean);
  if (found2026) {
    return { attendee: found2026, source: src2026 };
  }

  // Then check in main form registration list
  const { attendees, source } = await getAllAttendees();
  const found = attendees.find(a => a.rutClean === targetClean);
  return { attendee: found || null, source };
}

/**
 * Sync and save attendee in sheet "2026"
 */
export async function syncToTable2026(
  attendee: Attendee,
  precioPagado: number | string,
  plataforma: string,
  attended: boolean,
  pastorRed?: string
): Promise<{ success: boolean; source: 'google_sheets' | 'local_excel' }> {
  const timestamp = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
  const statusValue = attended ? 'Sí' : 'No';
  const priceVal = String(precioPagado || attendee.precioPagado || extractPriceFromText(attendee.tipoAsistente));
  const platVal = plataforma || attendee.plataforma || 'Efectivo';
  const telVal = formatPhoneStrict(attendee.telefono || '');
  const pastorVal = pastorRed !== undefined ? pastorRed : (attendee.pastorRed || '');
  const pagoStatus = `Pagado ($${priceVal})`;

  const rowData = [
    attendee.timestamp || timestamp,
    attendee.nombre,
    attendee.apellido1,
    attendee.apellido2 || '',
    attendee.rut,
    attendee.fechaNacimiento || '',
    telVal,
    attendee.tipoAsistente,
    attendee.organizacion || '',
    attendee.email || '',
    pastorVal,
    pagoStatus,
    platVal,
    statusValue
  ];

  if (isGoogleConfigured()) {
    try {
      const auth = getGoogleAuth();
      const sheets = google.sheets({ version: 'v4', auth });

      let existingRowIndex = -1;
      try {
        const resp2026 = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${TABLE_2026_SHEET_NAME}'!A:N`,
        });
        const rows2026 = resp2026.data.values || [];
        for (let r = 1; r < rows2026.length; r++) {
          const rowRut = cleanRut(String(rows2026[r]?.[4] || ''));
          if (rowRut === attendee.rutClean) {
            existingRowIndex = r + 1;
            break;
          }
        }
      } catch (sheetErr) {}

      if (existingRowIndex > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${TABLE_2026_SHEET_NAME}'!A${existingRowIndex}:N${existingRowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [rowData] },
        });
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${TABLE_2026_SHEET_NAME}'!A:N`,
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: { values: [rowData] },
        });
      }

      return { success: true, source: 'google_sheets' };
    } catch (error: any) {
      console.warn('Google Sheets 2026 sync error:', error.message || error);
    }
  }

  const rows2026 = getLocal2026Rows();
  let foundIdx = -1;
  for (let i = 1; i < rows2026.length; i++) {
    if (cleanRut(rows2026[i][4]) === attendee.rutClean) {
      foundIdx = i;
      break;
    }
  }

  if (foundIdx > 0) {
    rows2026[foundIdx] = rowData;
  } else {
    rows2026.push(rowData);
  }
  local2026Cache = rows2026;

  return { success: true, source: 'local_excel' };
}

/**
 * Update full row in sheet "2026" (for direct edits from Table 2026 view)
 */
export async function updateTable2026Row(updated: Attendee): Promise<{ success: boolean; source: 'google_sheets' | 'local_excel'; attendee: Attendee }> {
  const telVal = formatPhoneStrict(updated.telefono || '');
  const rutVal = formatRut(updated.rut) || updated.rut;
  const statusValue = updated.asistio ? 'Sí' : 'No';
  const priceVal = String(updated.precioPagado || extractPriceFromText(updated.tipoAsistente));
  const platVal = updated.plataforma || 'Efectivo';
  const pastorVal = (updated.pastorRed || '').trim();
  const pagoStatus = `Pagado ($${priceVal})`;

  const rowData = [
    updated.timestamp || new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' }),
    updated.nombre.trim(),
    updated.apellido1.trim(),
    (updated.apellido2 || '').trim(),
    rutVal,
    updated.fechaNacimiento || '',
    telVal,
    updated.tipoAsistente.trim(),
    (updated.organizacion || '').trim(),
    (updated.email || '').trim(),
    pastorVal,
    pagoStatus,
    platVal,
    statusValue
  ];

  const rutClean = cleanRut(rutVal);
  const attendeeParsed = rowToAttendee(rowData, updated.rowIndex);
  attendeeParsed.precioPagado = Number(priceVal) || priceVal;
  attendeeParsed.plataforma = platVal;
  attendeeParsed.pastorRed = pastorVal;

  if (isGoogleConfigured()) {
    try {
      const auth = getGoogleAuth();
      const sheets = google.sheets({ version: 'v4', auth });

      const resp2026 = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${TABLE_2026_SHEET_NAME}'!A:N`,
      });
      const rows2026 = resp2026.data.values || [];
      let rowIdx2026 = -1;
      for (let r = 1; r < rows2026.length; r++) {
        if (cleanRut(String(rows2026[r]?.[4] || '')) === rutClean) {
          rowIdx2026 = r + 1;
          break;
        }
      }

      if (rowIdx2026 > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${TABLE_2026_SHEET_NAME}'!A${rowIdx2026}:N${rowIdx2026}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [rowData] },
        });
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${TABLE_2026_SHEET_NAME}'!A:N`,
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: { values: [rowData] },
        });
      }

      // Also update in Form sheet if matching: Col K (Pastor), Col L (Pago), Col M (Plat), Col N (Asistencia)
      try {
        const respForm = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${FORM_SHEET_NAME}'!A:N`,
        });
        const formRows = respForm.data.values || [];
        for (let f = 1; f < formRows.length; f++) {
          if (cleanRut(String(formRows[f]?.[4] || '')) === rutClean) {
            await sheets.spreadsheets.values.update({
              spreadsheetId: SPREADSHEET_ID,
              range: `'${FORM_SHEET_NAME}'!K${f + 1}:N${f + 1}`,
              valueInputOption: 'USER_ENTERED',
              requestBody: { values: [[pastorVal, pagoStatus, platVal, statusValue]] },
            });
            break;
          }
        }
      } catch (errForm) {}

      return { success: true, source: 'google_sheets', attendee: attendeeParsed };
    } catch (error: any) {
      console.warn('Google Sheets edit error:', error.message || error);
    }
  }

  const rows2026 = getLocal2026Rows();
  let foundIdx = -1;
  for (let i = 1; i < rows2026.length; i++) {
    if (cleanRut(rows2026[i][4]) === rutClean) {
      foundIdx = i;
      break;
    }
  }

  if (foundIdx > 0) {
    rows2026[foundIdx] = rowData;
  } else {
    rows2026.push(rowData);
  }
  local2026Cache = rows2026;

  return { success: true, source: 'local_excel', attendee: attendeeParsed };
}

export async function updateAttendeeAttendance(
  rowIndex: number,
  attended: boolean,
  rut?: string,
  precioPagado?: number | string,
  plataforma?: string,
  pastorRed?: string
): Promise<{ success: boolean; source: 'google_sheets' | 'local_excel'; attendee?: Attendee }> {
  const statusValue = attended ? 'Sí' : 'No';

  const { attendee } = await findAttendeeByRut(rut || '');
  if (!attendee) return { success: false, source: 'local_excel' };

  const finalPlataforma = plataforma || (isAttendeePrepaid(attendee.pago) ? (attendee.plataforma || 'Plataforma GLS') : 'Efectivo');
  const finalPrecio = precioPagado || attendee.precioPagado || extractPriceFromText(attendee.tipoAsistente);
  const finalPastor = pastorRed !== undefined ? pastorRed : (attendee.pastorRed || '');
  const pagoStatus = `Pagado ($${finalPrecio})`;

  const updatedAttendee: Attendee = {
    ...attendee,
    asistio: attended,
    asistencia: statusValue,
    precioPagado: finalPrecio,
    plataforma: finalPlataforma,
    pastorRed: finalPastor,
    pago: pagoStatus,
  };

  // Sync to sheet 2026
  await syncToTable2026(updatedAttendee, finalPrecio, finalPlataforma, attended, finalPastor);

  if (isGoogleConfigured()) {
    try {
      const auth = getGoogleAuth();
      const sheets = google.sheets({ version: 'v4', auth });

      // Update Form Sheet: Col K (Pastor), Col L (Pago), Col M (Plataforma), Col N (Asistencia)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${FORM_SHEET_NAME}'!K${rowIndex}:N${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[finalPastor, pagoStatus, finalPlataforma, statusValue]] },
      });

      return { success: true, source: 'google_sheets', attendee: updatedAttendee };
    } catch (error: any) {
      console.warn('Google Sheets update error:', error.message || error);
    }
  }

  const rows = getLocalFormRows();
  if (rowIndex > 0 && rowIndex <= rows.length) {
    while (rows[rowIndex - 1].length < 14) {
      rows[rowIndex - 1].push('');
    }
    rows[rowIndex - 1][10] = finalPastor;
    rows[rowIndex - 1][11] = pagoStatus;
    rows[rowIndex - 1][12] = finalPlataforma;
    rows[rowIndex - 1][13] = statusValue;
    localFormCache = rows;
  }

  return { success: true, source: 'local_excel', attendee: updatedAttendee };
}

export async function createAndAttendAttendee(data: {
  nombre: string;
  apellido1: string;
  apellido2?: string;
  rut: string;
  email?: string;
  telefono?: string;
  tipoAsistente?: string;
  organizacion?: string;
  pastorRed?: string;
  pago?: string;
  precioPagado?: number | string;
  plataforma?: string;
}): Promise<{ success: boolean; source: 'google_sheets' | 'local_excel'; attendee: Attendee }> {
  const timestamp = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
  const formattedRut = formatRut(data.rut) || data.rut;
  const tipo = data.tipoAsistente || 'Adhesión General ($12.000)';
  const priceVal = data.precioPagado || extractPriceFromText(tipo);
  const platVal = data.plataforma || 'Efectivo';
  const org = data.organizacion || 'Catedral de la Alabanza';
  const telVal = formatPhoneStrict(data.telefono || '');
  const pastorVal = (data.pastorRed || '').trim();
  const pagoStatus = `Pagado ($${priceVal})`;
  const asistencia = 'Sí';

  const newRow = [
    timestamp,
    data.nombre.trim(),
    data.apellido1.trim(),
    (data.apellido2 || '').trim(),
    formattedRut,
    '',
    telVal,
    tipo,
    org,
    (data.email || '').trim(),
    pastorVal,
    pagoStatus,
    platVal,
    asistencia
  ];

  const createdAttendee = rowToAttendee(newRow, 9999);
  createdAttendee.precioPagado = priceVal;
  createdAttendee.plataforma = platVal;
  createdAttendee.pastorRed = pastorVal;
  createdAttendee.asistio = true;

  await syncToTable2026(createdAttendee, priceVal, platVal, true, pastorVal);

  if (isGoogleConfigured()) {
    try {
      const auth = getGoogleAuth();
      const sheets = google.sheets({ version: 'v4', auth });

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${FORM_SHEET_NAME}'!A:N`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [newRow] },
      });

      return { success: true, source: 'google_sheets', attendee: createdAttendee };
    } catch (error: any) {
      console.warn('Google Sheets append error, saved locally:', error.message || error);
    }
  }

  const rows = getLocalFormRows();
  rows.push(newRow);
  localFormCache = rows;

  return { success: true, source: 'local_excel', attendee: createdAttendee };
}

export async function getTable2026Attendees(): Promise<{ attendees: Attendee[]; source: 'google_sheets' | 'local_excel' }> {
  if (isGoogleConfigured()) {
    try {
      const auth = getGoogleAuth();
      const sheets = google.sheets({ version: 'v4', auth });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${TABLE_2026_SHEET_NAME}'!A:N`,
      });

      const rows = response.data.values || [];
      const attendees: Attendee[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] || [];
        if (row.length > 0 && (row[1] || row[4])) {
          attendees.push(rowToAttendee(row.map(c => String(c ?? '').trim()), i + 1));
        }
      }
      return { attendees, source: 'google_sheets' };
    } catch (e) {}
  }

  const rows2026 = getLocal2026Rows();
  const attendees: Attendee[] = [];
  for (let i = 1; i < rows2026.length; i++) {
    const row = rows2026[i] || [];
    if (row.length > 0 && (row[1] || row[4])) {
      attendees.push(rowToAttendee(row, i + 1));
    }
  }

  return { attendees, source: 'local_excel' };
}

export async function getStats(): Promise<{ stats: StatsData; source: 'google_sheets' | 'local_excel' }> {
  const { attendees, source } = await getAllAttendees();
  const { attendees: attendees2026 } = await getTable2026Attendees();

  const total = attendees.length;
  
  // COUNT EXACTLY THOSE WHO HAVE ATTENDED IN TABLE 2026
  const attended2026List = attendees2026.filter(a => a.asistio);
  const acreditados = attended2026List.length;
  const pendientes = Math.max(0, total - acreditados);
  const porcentaje = total > 0 ? Math.round((acreditados / total) * 100) : 0;

  let totalRecaudado = 0;
  for (const a of attended2026List) {
    const priceNum = typeof a.precioPagado === 'number' ? a.precioPagado : extractPriceFromText(String(a.pago || a.tipoAsistente));
    totalRecaudado += priceNum;
  }

  const porTipo: Record<string, { total: number; acreditados: number }> = {};
  for (const a of attendees) {
    const tipo = a.tipoAsistente || 'Otros';
    if (!porTipo[tipo]) {
      porTipo[tipo] = { total: 0, acreditados: 0 };
    }
    porTipo[tipo].total++;
  }
  for (const a of attended2026List) {
    const tipo = a.tipoAsistente || 'Otros';
    if (porTipo[tipo]) {
      porTipo[tipo].acreditados++;
    }
  }

  return {
    stats: {
      total,
      acreditados,
      pendientes,
      porcentaje,
      totalRecaudado,
      porTipo,
    },
    source,
  };
}
