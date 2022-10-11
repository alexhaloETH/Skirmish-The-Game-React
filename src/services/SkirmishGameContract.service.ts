import { getStarknet } from "@argent/get-starknet"
// import { utils } from "ethers"
import { Abi,  Account,
  Contract } from "starknet"
// import {Buffer} from 'buffer';
import SkirmishGCAbi from "../abi/SkirmishGameContract.json"
import {stringToFelt, feltToString, stringToFeltNo_0x, getUint256CalldataFromBN, parseInputAmountToUint256} from "./GeneralUtil.service"

import { toFelt } from "starknet/dist/utils/number";



export const SkirmishGameContractAddressByNetwork = {
  "goerli-alpha":
    "0x060411da281bfb491fc287ad1e0e5ce9dd7aeb04a799d556502aa231804f42fe",
  "mainnet-alpha":
    "",
}        // mainnet wont work

export type PublicNetwork = keyof typeof SkirmishGameContractAddressByNetwork
export type Network = PublicNetwork | "localhost"


export const SkirmishGCAddress = (network: PublicNetwork) =>
  SkirmishGameContractAddressByNetwork[network]

  export const setSNS = async (
    SNS: string,
    network: PublicNetwork,
  ): Promise<any> => {
    const starknet = getStarknet()

    
   var Felt = stringToFelt(SNS)

    if (!starknet?.isConnected) {
      console.log("starknet wallet not connected");
      return ("0")
    }
    
    const SkirmishGC = new Contract(
      SkirmishGCAbi as any,
      SkirmishGCAddress(network),
      starknet.account as any,
    )
  
    return SkirmishGC.set_SNS(Felt)
  }


  export const checkSNSAvailability = async (SNS: string,
    network: PublicNetwork,
  ): Promise<any> => {
    const starknet = getStarknet()
    
   var Felt = stringToFelt(SNS)

    if (!starknet?.isConnected) {
      console.log("starknet wallet not connected");
      return ("0")
    }
    const SkirmishGC = new Contract(
      SkirmishGCAbi as Abi,
      SkirmishGCAddress(network),
      starknet.account as any,
    )
  
    return SkirmishGC.get_address_from_SNS(Felt)
  }


















