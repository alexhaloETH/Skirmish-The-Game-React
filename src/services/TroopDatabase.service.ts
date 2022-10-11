import { getStarknet } from "@argent/get-starknet"
// import { utils } from "ethers"
import { Abi,  Account,
  Contract } from "starknet"
// import {Buffer} from 'buffer';
import TroopDBAbi from "../abi/TroopDatabase.json"
import {stringToFelt,feltToString,stringToFeltNo_0x,getUint256CalldataFromBN,parseInputAmountToUint256} from "./GeneralUtil.service"

import { toFelt } from "starknet/dist/utils/number";



export const TroopDatabaseAddressByNetwork = {
  "goerli-alpha":
    "0x0218f28664c5a5d896f97ab4acacfb7c1be8c8d7e272a54a6bc11ac9d859aa36",
  "mainnet-alpha":
    "",
}        // mainnet wont work

export type PublicNetwork = keyof typeof TroopDatabaseAddressByNetwork
export type Network = PublicNetwork | "localhost"


export const getTroopDatabaseAddress = (network: PublicNetwork) =>
  TroopDatabaseAddressByNetwork[network]





  export const GetRealmData = async (_realmId :string,
    network: PublicNetwork,
  ): Promise<any> => {
    const starknet = getStarknet()
    
    if (!starknet?.isConnected) {
      console.log("starknet wallet not connected");
      return ("0")
    }
    const TroopDBContract = new Contract(
      TroopDBAbi as Abi,
      getTroopDatabaseAddress(network),
      starknet.account as any,
    )
  
    return TroopDBContract.GetDeckData(_realmId, starknet.account.address)
  }






  export const multiCallSetData = async (
    JSONdata: any,
    network: PublicNetwork,
  ): Promise<any> => {
    const starknet = getStarknet()
    if (!starknet?.isConnected) {
      console.log("starknet wallet not connected");
      return ("0")
    }
  
  
    return  starknet.account.execute(JSONdata);
  }
















