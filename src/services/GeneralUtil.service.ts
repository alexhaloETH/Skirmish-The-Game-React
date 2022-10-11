import { encode } from "starknet"
import { utils } from "ethers"
import {number, uint256 } from "starknet"
import {Buffer} from 'buffer';



export const formatAddress = (address: string) =>
  encode.addHexPrefix(encode.removeHexPrefix(address).padStart(64, "0"))

export const truncateAddress = (address: string) => {
  return truncateHex(formatAddress(address))
}

export const truncateHex = (value: string) => {
  const hex = value.slice(0, 2)
  const start = value.slice(2, 6)
  const end = value.slice(-4)
  return `${hex} ${start} ... ${end}`
}


export function feltToString(felt :any) {
  const newStrB = Buffer.from(felt.toString(16), 'hex')
  return newStrB.toString()
}

export function stringToFelt(str :any) {
  return "0x" + Buffer.from(str).toString('hex')
}

export function stringToFeltNo_0x(str :any) {
  return Buffer.from(str).toString('hex')
}

export function getUint256CalldataFromBN(bn: number.BigNumberish) {
  return { type: "struct" as const, ...uint256.bnToUint256(bn) }
}

export function parseInputAmountToUint256(input: string, decimals: number = 18) {
  return getUint256CalldataFromBN(utils.parseUnits(input, decimals).toString())
}


export function decryptEAS128(input: string, decimals: number = 18) {
  return getUint256CalldataFromBN(utils.parseUnits(input, decimals).toString())
}

export function encryptEAS128(input: string, decimals: number = 18) {
  return getUint256CalldataFromBN(utils.parseUnits(input, decimals).toString())
}

export function hexToBytes(hex : any) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

//