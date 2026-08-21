/**
 * Chilean RUT, Phone and Payment helpers
 */

export const PASTORES_LIST = [
  'Christian Jara',
  'Genoveva Navales',
  'Flor Arcos',
  'José Ferrada',
  'Juan Manuel Caro',
  'Catedral Coquimbo',
  'Catedral Peñaflor',
  'ICVR',
  'Iglesia Luminares',
  'Visita',
  'Otra Iglesia',
];

export function cleanRut(rut: string): string {
  if (!rut) return '';
  return rut.toString().replace(/[^0-9kK]/g, '').toUpperCase();
}

export function formatRut(rut: string): string {
  const clean = cleanRut(rut);
  if (!clean) return '';
  if (clean.length === 1) return clean;

  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);

  let formatted = '';
  let count = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    count++;
    formatted = body[i] + formatted;
    if (count === 3 && i > 0) {
      formatted = '.' + formatted;
      count = 0;
    }
  }

  return `${formatted}-${dv}`;
}

export function validateRut(rut: string): boolean {
  const clean = cleanRut(rut);
  if (clean.length < 7 || clean.length > 9) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedMod = 11 - (sum % 11);
  let expectedDv = '';
  if (expectedMod === 11) expectedDv = '0';
  else if (expectedMod === 10) expectedDv = 'K';
  else expectedDv = expectedMod.toString();

  return dv === expectedDv;
}

/**
 * Formats Chilean phone number strictly without spaces: +569XXXXXXXX
 */
export function formatPhoneStrict(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/[^0-9]/g, '');

  if (!digits) return '+569';

  if (digits.startsWith('569')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('56')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('9') && digits.length === 9) {
    digits = digits.slice(1);
  }

  const mobileDigits = digits.slice(0, 8);
  return `+569${mobileDigits}`;
}

export function extractPriceFromText(text: string): number {
  if (!text) return 10000;
  const clean = text.toString().replace(/\./g, '');
  const match = clean.match(/\$?(\d{4,6})/);
  if (match) {
    return parseInt(match[1], 10);
  }
  if (text.toLowerCase().includes('estudiante')) return 5000;
  if (text.toLowerCase().includes('visita')) return 5000;
  if (text.toLowerCase().includes('12')) return 12000;
  if (text.toLowerCase().includes('10')) return 10000;
  if (text.toLowerCase().includes('7')) return 7000;
  return 10000;
}

/**
 * Check if the attendee has pre-paid according to column 'Pago'
 */
export function isAttendeePrepaid(pago: string | undefined): boolean {
  if (!pago) return false;
  const clean = pago.trim().toLowerCase();
  if (
    !clean || 
    clean === 'no' || 
    clean === 'none' || 
    clean === 'nr' || 
    clean === 'null' || 
    clean === 'vacio' || 
    clean === '<vacio>' ||
    clean === 'pendiente' ||
    clean === 'sin pago'
  ) {
    return false;
  }
  return true;
}
