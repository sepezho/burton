import { contractAddress, Address, toNano, beginCell } from "ton";
import { SmartContract } from "ton-contract-executor";
import { expect } from "chai";
import {
  logs,
  initMaster,
  internalMessage,
  randomAddress,
} from "./utils";
import { masterCodeCell, userCodeCell } from "./SmartContractsCells";

let contract: SmartContract;

const admin = randomAddress('admin')
const user = randomAddress('user')
let masterContractAddress = randomAddress('')

describe("evaa master sc tests", () => {
  beforeEach(async () => {
    contract = await SmartContract.fromCell(
      masterCodeCell,
      initMaster(),
      {
        debug: true,
      }
    );

    masterContractAddress = contractAddress({
      workchain: 0,
      initialCode: masterCodeCell,
      initialData: initMaster(),
    });

    const tx = await contract.sendInternalMessage(
      internalMessage({
        value: toNano(0),
        from: admin,
        body: beginCell().endCell(),
      }) as any
    );

    logs(tx);
  });

  it("master run ton send", async () => {
    const tx = await contract.sendInternalMessage(
      internalMessage({
        value: toNano(50),
        from: user,
        body: beginCell().endCell(),
      }) as any
    );
    console.log(tx);
    logs(tx);
    expect(tx.type).equals('success');
  });

});
