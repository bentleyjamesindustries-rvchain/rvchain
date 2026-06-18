import * as bitcoin from 'bitcoinjs-lib';

export type AddressValidationState = 'empty' | 'invalid' | 'valid';

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end + 3) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/** Extract address from QR content (plain address or bitcoin: URI). */
export function extractBitcoinAddressFromQr(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('bitcoin:')) {
    const withoutScheme = trimmed.slice(8);
    const addressPart = withoutScheme.split('?')[0].split('&')[0];
    return addressPart.trim();
  }

  return trimmed;
}

export function normalizeBitcoinAddress(input: string): string {
  return extractBitcoinAddressFromQr(input).trim();
}

export function isValidBitcoinAddress(address: string): boolean {
  const trimmed = normalizeBitcoinAddress(address);
  if (!trimmed || trimmed.length < 26 || trimmed.length > 90) return false;

  try {
    bitcoin.address.toOutputScript(trimmed, bitcoin.networks.bitcoin);
    return true;
  } catch {
    return false;
  }
}

export function getAddressValidationState(address: string): AddressValidationState {
  const trimmed = normalizeBitcoinAddress(address);
  if (!trimmed) return 'empty';
  return isValidBitcoinAddress(trimmed) ? 'valid' : 'invalid';
}