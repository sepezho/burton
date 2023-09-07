import { Address, beginCell, WalletContract } from "ton";
import { initMaster } from "../test/utils";

export function initData() {
  return initMaster()
}

export const initMessage = async () => {
  return beginCell()
    .endCell();
}

export async function postDeployTest(walletContract: WalletContract, secretKey: Buffer, contractAddress: Address) {
  console.log('done')
}

