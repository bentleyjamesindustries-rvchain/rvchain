/** Demo booking payment — no real charges. */
export interface BookingPayment {
  method: 'demo';
  usdAmount: number;
  paidAt?: string;
}