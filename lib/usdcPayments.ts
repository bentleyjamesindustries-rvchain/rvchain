export type UsdcChainId = 'base' | 'ethereum' | 'solana';

export interface UsdcChainConfig {
  id: UsdcChainId;
  label: string;
  symbol: string;
  explorerUrl: string;
  /** Demo receive address — set via env in production */
  receiveAddress: string;
  estimatedFee: string;
  color: string;
}

const DEMO_ADDRESSES: Record<UsdcChainId, string> = {
  base: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  ethereum: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  solana: 'DYw8jCTfwLWNRLOaq8erFqqZATF7xK6mKqKqKqKqKqKqK',
};

export const USDC_CHAINS: UsdcChainConfig[] = [
  {
    id: 'base',
    label: 'Base',
    symbol: 'USDC',
    explorerUrl: 'https://basescan.org',
    receiveAddress: process.env.NEXT_PUBLIC_USDC_BASE_ADDRESS ?? DEMO_ADDRESSES.base,
    estimatedFee: '~$0.01',
    color: 'text-blue-400',
  },
  {
    id: 'ethereum',
    label: 'Ethereum',
    symbol: 'USDC',
    explorerUrl: 'https://etherscan.io',
    receiveAddress: process.env.NEXT_PUBLIC_USDC_ETH_ADDRESS ?? DEMO_ADDRESSES.ethereum,
    estimatedFee: '~$2–8',
    color: 'text-indigo-400',
  },
  {
    id: 'solana',
    label: 'Solana',
    symbol: 'USDC',
    explorerUrl: 'https://solscan.io',
    receiveAddress: process.env.NEXT_PUBLIC_USDC_SOL_ADDRESS ?? DEMO_ADDRESSES.solana,
    estimatedFee: '~$0.001',
    color: 'text-purple-400',
  },
];

export type PaymentMethod = 'demo' | 'card' | 'usdc';

export interface BookingPayment {
  method: PaymentMethod;
  usdcChain?: UsdcChainId;
  usdcAmount: number;
  usdAmount: number;
  txHash?: string;
  paidAt?: string;
}

export function usdToUsdc(usd: number): number {
  // MVP: 1 USD = 1 USDC (stablecoin peg)
  return Math.round(usd * 100) / 100;
}

export function getUsdcChain(id: UsdcChainId): UsdcChainConfig {
  return USDC_CHAINS.find((c) => c.id === id) ?? USDC_CHAINS[0];
}