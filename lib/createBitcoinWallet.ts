import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { HDKey } from '@scure/bip32';
import * as bitcoin from 'bitcoinjs-lib';

export interface GeneratedWallet {
  mnemonic: string;
  address: string;
}

/** Client-side non-custodial wallet — mnemonic never leaves the browser unless the user copies it. */
export function createNewBitcoinWallet(): GeneratedWallet {
  const mnemonic = bip39.generateMnemonic(wordlist, 128);
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = HDKey.fromMasterSeed(seed);
  const child = root.derive("m/84'/0'/0'/0/0");

  if (!child.publicKey) {
    throw new Error('Failed to derive wallet public key');
  }

  const { address } = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(child.publicKey),
    network: bitcoin.networks.bitcoin,
  });

  if (!address) {
    throw new Error('Failed to generate Bitcoin address');
  }

  return { mnemonic, address };
}