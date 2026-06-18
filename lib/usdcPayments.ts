import { SITE_DEMO_MODE } from './demoMode';

export type UsdcChainId = 'base' | 'ethereum' | 'solana';

/** Real USDC checkout is disabled until SITE_DEMO_MODE is false. */
export const PAYMENTS_ENABLED = !SITE_DEMO_MODE;

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

const PLACEHOLDER_ADDRESSES: Record<UsdcChainId, string> = {
  base: '0xDEMO0000000000000000000000000000000000',
  ethereum: '0xDEMO0000000000000000000000000000000000',
  solana: 'DEMOxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
};

function resolveReceiveAddress(chain: UsdcChainId): string {
  if (SITE_DEMO_MODE) return PLACEHOLDER_ADDRESSES[chain];
  const envMap: Record<UsdcChainId, string | undefined> = {
    base: process.env.NEXT_PUBLIC_USDC_BASE_ADDRESS,
    ethereum: process.env.NEXT_PUBLIC_USDC_ETH_ADDRESS,
    solana: process.env.NEXT_PUBLIC_USDC_SOL_ADDRESS,
  };
  return envMap[chain] ?? PLACEHOLDER_ADDRESSES[chain];
}

export const USDC_CHAINS: UsdcChainConfig[] = [
  {
    id: 'base',
    label: 'Base',
    symbol: 'USDC',
    explorerUrl: 'https://basescan.org',
    receiveAddress: resolveReceiveAddress('base'),
    estimatedFee: '~$0.01',
    color: 'text-blue-400',
  },
  {
    id: 'ethereum',
    label: 'Ethereum',
    symbol: 'USDC',
    explorerUrl: 'https://etherscan.io',
    receiveAddress: resolveReceiveAddress('ethereum'),
    estimatedFee: '~$2–8',
    color: 'text-indigo-400',
  },
  {
    id: 'solana',
    label: 'Solana',
    symbol: 'USDC',
    explorerUrl: 'https://solscan.io',
    receiveAddress: resolveReceiveAddress('solana'),
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