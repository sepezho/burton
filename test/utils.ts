import BN from "bn.js";
import { Address, Cell, CellMessage, InternalMessage, CommonMessageInfo, beginCell, DictBuilder } from "ton";
import { keyPairFromSeed, sha256_sync } from 'ton-crypto'
import Prando from "prando";
import { userCodeCell } from "./SmartContractsCells";

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



const OFF_CHAIN_CONTENT_PREFIX = 0x00;

export function flattenSnakeCell(cell: any) {
  let c = cell;

  let res = Buffer.alloc(0);

  while (c) {
    let cs = c.beginParse();
    let data = cs.readRemainingBytes();
    res = Buffer.concat([res, data]);
    c = c.refs[0];
  }

  return res;
}

function bufferToChunks(buff: any, chunkSize: any) {
  let chunks = [];
  while (buff.byteLength > 0) {
    chunks.push(buff.slice(0, chunkSize));
    buff = buff.slice(chunkSize);
  }
  return chunks;
}

export function makeSnakeCell(data: any) {
  let chunks = bufferToChunks(data, 127);
  let rootCell = new Cell();
  let curCell = rootCell;

  for (let i = 0; i < chunks.length; i++) {
    let chunk = chunks[i];

    curCell.bits.writeBuffer(chunk);

    if (chunks[i + 1]) {
      let nextCell = new Cell();
      curCell.refs.push(nextCell);
      curCell = nextCell;
    }
  }

  return rootCell;
}

export function encodeOffChainContent(content: any) {
  let data = Buffer.from(content);
  let offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX]);
  data = Buffer.concat([offChainPrefix, data]);
  return makeSnakeCell(data);
}

export const initMaster = () => {
  const metadataDict = new DictBuilder(256);


  metadataDict.storeCell(sha256_sync('name'), encodeOffChainContent('burton'))
  metadataDict.storeCell(sha256_sync('description'), encodeOffChainContent('i just burned some tons'))
  metadataDict.storeCell(sha256_sync('image'), encodeOffChainContent('https://shorturl.at/ELRZ1'))

  return beginCell()
    .storeAddress(null)
    .storeUint(0, 64)
    .storeRef(beginCell()
      .storeInt(0x00, 8)
      .storeDict(metadataDict.endDict())
      .endCell())
    .storeRef(userCodeCell)
    .storeRef(beginCell().endCell())
    .endCell()
}
console.log(initMaster().toBoc().toString('base64'))

