import { getStarknet } from "@argent/get-starknet"
// import { utils } from "ethers"
import { Abi,  Account,
  Contract } from "starknet"
// import {Buffer} from 'buffer';
import Erc20Abi from "../abi/ERC20.json"
import {stringToFelt,feltToString,stringToFeltNo_0x,getUint256CalldataFromBN,parseInputAmountToUint256} from "./GeneralUtil.service"

import { toFelt } from "starknet/dist/utils/number";



export const erc20TokenAddressByNetwork = {
  "goerli-alpha":
    "0x03e41c33cfb4081c8a40f08bc61d7b62396485587415b967e1dc295a156d03e9",
  "mainnet-alpha":
    "0x06a09ccb1caaecf3d9683efe335a667b2169a409d19c589ba1eb771cd210af75",
}        // mainnet wont work

export type PublicNetwork = keyof typeof erc20TokenAddressByNetwork
export type Network = PublicNetwork | "localhost"


export const getErc20TokenAddress = (network: PublicNetwork) =>
  erc20TokenAddressByNetwork[network]











export const transfer = async (
  transferTo: string,
  transferAmount: string,
  network: PublicNetwork,
): Promise<any> => {
  const starknet = getStarknet()
  if (!starknet?.isConnected) {
    console.log("starknet wallet not connected");
    return ("0")
  }

  const erc20Contract = new Contract(
    Erc20Abi as any,
    getErc20TokenAddress(network),
    starknet.account as any,
  )

  return erc20Contract.transfer(
    transferTo,
    parseInputAmountToUint256(transferAmount),
  )
}





export const mintToken = async (
  mintAmount: string,
  network: PublicNetwork,
): Promise<any> => {
  const starknet = getStarknet()
  if (!starknet?.isConnected) {
    
    console.log("starknet wallet not connected");
    return ("0")
    
  }
  const erc20Contract = new Contract(
    Erc20Abi as Abi,
    getErc20TokenAddress(network),
    starknet.account as any,
  )

  const address = starknet.selectedAddress
  return erc20Contract.mint(address, parseInputAmountToUint256("10"))
}






export const checkNameERC20 = async (
  network: PublicNetwork,
): Promise<any> => {
  const starknet = getStarknet()
  
  if (!starknet?.isConnected) {
    console.log("starknet wallet not connected");
    return ("0")
  }
  const erc20Contract = new Contract(
    Erc20Abi as Abi,
    getErc20TokenAddress(network),
    starknet.account as any,
  )

  return erc20Contract.name()
}

export const checkInitialsERC20 = async (
  network: PublicNetwork,
): Promise<any> => {
  const starknet = getStarknet()
  
  if (!starknet?.isConnected) {
    console.log("starknet wallet not connected");
    return ("0")
  }
  const erc20Contract = new Contract(
    Erc20Abi as Abi,
    getErc20TokenAddress(network),
    starknet.account as any,
  )

  return erc20Contract.symbol()
}

export const checkBalanceERC20 = async (
  network: PublicNetwork,
): Promise<any> => {
  const starknet = getStarknet()
  
  if (!starknet?.isConnected) {
    console.log("starknet wallet not connected");
    return ("0")
  }
  const erc20Contract = new Contract(
    Erc20Abi as Abi,
    getErc20TokenAddress(network),
    starknet.account as any,
  )

  const address = starknet.selectedAddress
  
  return erc20Contract.balanceOf(address)
}






