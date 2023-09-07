import BN from "bn.js";
import { Address, Cell, CellMessage, InternalMessage, CommonMessageInfo } from "ton";
import { keyPairFromSeed } from 'ton-crypto'
import Prando from "prando";

export const zeroAddress = new Address(0, Buffer.alloc(32, 0));

export function randomAddress(seed: string, workchain?: number) {
  const random = new Prando(seed);
  const hash = Buffer.alloc(32);
  for (let i = 0; i < hash.length; i++) {
    hash[i] = random.nextInt(0, 256);
  }
  return new Address(workchain ?? 0, hash);
}

export function randomTestKey(seed: string) {
  let random = new Prando(seed);
  let res = Buffer.alloc(32);
  for (let i = 0; i < res.length; i++) {
    res[i] = random.nextInt(0, 256);
  }
  return keyPairFromSeed(res);
}

export function internalMessage(params: { from?: Address; to?: Address; value?: BN; bounce?: boolean; body?: Cell }) {
  const message = params.body ? new CellMessage(params.body) : undefined;
  return new InternalMessage({
    from: params.from ?? randomAddress("sender"),
    to: params.to ?? zeroAddress,
    value: params.value ?? 0,
    bounce: params.bounce ?? true,
    body: new CommonMessageInfo({ body: message }),
  });
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const logs = (tx: any) => {
  console.log('--------------')
  console.log(tx.debugLogs);
  console.log(tx.result);
  console.log(tx.type);
  console.log(tx.exit_code);
  console.log(tx.gas_consumed);
  console.log('--------------')
}
