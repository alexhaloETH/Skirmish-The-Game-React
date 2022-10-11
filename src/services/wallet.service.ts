import { connect, getStarknet , disconnect} from "@argent/get-starknet"
import { constants, shortString } from "starknet"
import { Network } from "./token.service"


import { StarknetChainId } from "starknet/dist/constants"
import { useStarknet } from '@starknet-react/core'
import { Wallet } from "ethers"


export const connectWallet = async () => {
  const windowStarknet = await connect(
    {include: ["argentX", "braavos"], showList: true })

  await windowStarknet?.enable({ showModal: false })
  return windowStarknet
}
// the braavos wallet returns something even tho it shouldnt leading to the error



// not working
export const disconnectWallet = async () => {
  await disconnect({clearLastWallet: true, clearDefaultWallet : true})
  
}


export const walletAddress = async (): Promise<string | undefined> => {
  const starknet = getStarknet()
  if (!starknet?.isConnected) {
    console.log("starknet wallet not connected");
    return ("0")
  }
  return starknet.selectedAddress
}



// another issue with the return       not to force restart
export const networkId = (): Network | undefined => {
  const starknet = getStarknet()
  if (!starknet?.isConnected) {
    console.log("starknet wallet not connected");
    return
  }
  try {
    const { chainId } = starknet.provider
    if (chainId === constants.StarknetChainId.MAINNET) {
      return "mainnet-alpha"
    } else if (chainId === constants.StarknetChainId.TESTNET) {
      return "goerli-alpha"
    } 
  } catch {}
}


// add token to a wallet as simple as just calling the func with the address of the token
// might be issues with the way this returns
export const addToken = async (address: string): Promise<void> => {
  const starknet = getStarknet()
  if (!starknet?.isConnected) {
    console.log("starknet wallet not connected");
    
  }
  await starknet.request({
    type: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address,
      },
    },
  })
}


export const getExplorerBaseUrl = (): string | undefined => {
  const network = networkId()
  if (network === "mainnet-alpha") {
    return "https://voyager.online"
  } else if (network === "goerli-alpha") {
    return "https://goerli.voyager.online"
  }
}


// get the chain ID    not too force restart
export const chainId = (): string | undefined => {
  const starknet = getStarknet()
  if (!starknet?.isConnected) {
    console.log("starknet wallet not connected");
    return 
  }
  try {
    return shortString.decodeShortString(starknet.provider.chainId)
  } catch {}
}


export const waitForTransaction = async (hash: string) => {
  const starknet = getStarknet()
  if (!starknet?.isConnected) {
    console.log("starknet wallet not connected");
    return ("0")
  }
  return starknet.provider.waitForTransaction(hash)
}



// not too sure yet     vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
export const signMessage = async (message: string) => {
  const starknet = getStarknet()
  if (!starknet?.isConnected)
  {   
    console.log("starknet wallet not connected");
    return ("0")
  }
  if (!shortString.isShortString(message)) {
    throw Error("message must be a short string")
  }

  return starknet.account.signMessage({
    domain: {
      name: "Example DApp",
      chainId: networkId() === "mainnet-alpha" ? "SN_MAIN" : "SN_GOERLI",
      version: "0.0.1",
    },
    types: {
      StarkNetDomain: [
        { name: "name", type: "felt" },
        { name: "chainId", type: "felt" },
        { name: "version", type: "felt" },
      ],
      Message: [{ name: "message", type: "felt" }],
    },
    primaryType: "Message",
    message: {
      message,
    },
  })
}


export const addWalletChangeListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  const starknet = getStarknet()
  if (!starknet?.isConnected) {
    console.log("starknet wallet not connected");
    return ("0")
  }
  starknet.on("accountsChanged", handleEvent)
}

export const removeWalletChangeListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  const starknet = getStarknet()
  if (!starknet?.isConnected) {
    console.log("starknet wallet not connected");
    return ("0")
  }
  starknet.off("accountsChanged", handleEvent)
}
