/**
 * Chilean RUT, Phone and Payment helpers with official Modulo 11 validation
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

export const CATEGORIAS_OFICIALES = [
  { nombre: 'Liderazgo General ($12.000.-)', precio: 12000 },
  { nombre: 'Estudiante ($5.000.-)', precio: 5000 },
  { nombre: 'Visita ($5.000.-)', precio: 5000 },
  { nombre: 'Tercera Edad ($5.000.-)', precio: 5000 },
  { nombre: 'Invitado Especial / Staff', precio: 0 },
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

export function calculateExpectedDv(rutDigits: string): string {
  const clean = cleanRut(rutDigits);
  const body = clean.length > 1 ? clean.slice(0, -1) : clean;
  if (!body) return '';

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedMod = 11 - (sum % 11);
  if (expectedMod === 11) return '0';
  if (expectedMod === 10) return 'K';
  return expectedMod.toString();
}

/**
 * Validates Chilean RUT according to the official Modulo 11 algorithm.
 * Example: 12345678-5 -> Valid (True)
 * Example: 16519618-1 -> Invalid (False, expected DV is K)
 */
export function validateRut(rut: string): boolean {
  const clean = cleanRut(rut);
  if (clean.length < 7 || clean.length > 9) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  if (!/^[0-9]+$/.test(body)) return false;

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
  if (!text) return 12000;
  const clean = text.toString().replace(/\./g, '');
  const match = clean.match(/\$?(\d{4,6})/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num === 12000 || num === 5000 || num === 7000) return num;
    if (num === 10000) return 12000;
    return num;
  }
  const low = text.toLowerCase();
  if (low.includes('estudiante') || low.includes('visita') || low.includes('tercera') || low.includes('edad') || low.includes('5')) {
    return 5000;
  }
  if (low.includes('invitado') || low.includes('staff') || low.includes('gratis')) {
    return 0;
  }
  return 12000;
}

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
