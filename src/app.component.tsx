import { useCallback, useEffect, useState, FC, } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import styles from "./styles/app.module.css";

import stylesARG from "./styles/Home.module.css"

import { checkNameERC20, Network, checkBalanceERC20, checkInitialsERC20 } from "./services/token.service"

import {
  truncateAddress,
  truncateHex,
  stringToFelt,
  feltToString,
  stringToFeltNo_0x,
  getUint256CalldataFromBN,
  parseInputAmountToUint256,
  hexToBytes
} from "./services/GeneralUtil.service"

import {
  addWalletChangeListener,
  chainId,
  connectWallet,
  removeWalletChangeListener,
  disconnectWallet,
  walletAddress
} from "./services/wallet.service"

import {
  GetRealmData,
  multiCallSetData
} from "./services/TroopDatabase.service"

import {
  checkSNSAvailability,
  setSNS
} from "./services/SkirmishGameContract.service"



import { Buffer } from 'buffer';
import {
  getErc20TokenAddress,
  mintToken,
  transfer,
} from "./services/token.service"

import {
  addToken,
  getExplorerBaseUrl,
  networkId,
  signMessage,
  waitForTransaction,
} from "./services/wallet.service"

import { toBN, toFelt } from "starknet/dist/utils/number";
import { uint256, number } from "starknet";


import { url } from "inspector";
import { Console } from "console";


import { } from "ethers";
//rt {} from "snappyjs";

const SnappyJS = require('snappyjs');
const { uncompress, compress } = SnappyJS;


const Aes_js = require('aes-js');
const { utils } = Aes_js;

type Status = "idle" | "approve" | "pending" | "success" | "failure"





const App = () => {



  const tokenOffset = useState(10 ** 18)
  const [address, setAddress] = useState<string>()
  const [chain, setChain] = useState(chainId())
  const [isConnected, setConnected] = useState(false)

  const [network, setnetwork] = useState(networkId())

  const [lastTransactionHash, setLastTransactionHash] = useState("")
  const [transactionStatus, setTransactionStatus] = useState<Status>("idle")
  const [transactionError, setTransactionError] = useState("")

  const [isPlaying, setIsPlaying] = useState(false);
  const [screenshotDatas, setScreenshotDatas] = useState<string[]>([]);
  const [scores, setScores] = useState<[number, number][]>([]);
  var newNetVar: any = ""


  const tokenAddress = getErc20TokenAddress(network as any)
  const ethAddress =
    network === "goerli-alpha"
      ? "0x03e41c33cfb4081c8a40f08bc61d7b62396485587415b967e1dc295a156d03e9"
      : undefined

  if (network !== "goerli-alpha" && network !== "mainnet-alpha") {
  }
  else {
    newNetVar = network
  }



  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleConnectClick = async () => {
    const wallet = await connectWallet()
    setAddress(wallet?.selectedAddress)
    setChain(chainId())
    setnetwork(networkId())
    setConnected(!!wallet?.isConnected)

    sendMessage("--- UI", "SetAddressFelt", stringToFelt(wallet?.selectedAddress))
    sendMessage("--- UI", "SetAddress", wallet?.selectedAddress)
  }


  //--------------------------------- CONTRACT SIDE -----------------------------------------------


  //
  //  CONTRACT COMMUNICATION
  //



  //DELETE
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleMintSubmit = async (MintAmount: string) => {

    setTransactionStatus("approve")

    const result = await mintToken(MintAmount, newNetVar)

    if (result === "0") { handleExitGame() }

    setLastTransactionHash(result.transaction_hash)
    // this is where we send the message to unity about the tx
    var string_conc = result.transaction_hash + " MintToken"
    sendMessage("CanvasLobby", "AddTX", result.transaction_hash)
    handleWaitForTransaction(result.transaction_hash)
  };


  // example @view function for "Text" return   to delete
  const handleNameCheck = async () => {

    const result = await checkNameERC20(newNetVar)

    if (result === "0") { handleExitGame() }

    const to_send = feltToString(toBN(result.toString()))
    console.log(to_send);
  };

  // example @view function for Uint256 return
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleCheckBalance = async () => {

    const result = await checkBalanceERC20(newNetVar)

    if (result === "0") { handleExitGame() }

    const hex = uint256.bnToUint256(toBN(result[0]['low']))["low"]

    const felt = number.toFelt(hex.toString())

    const string_val = (felt).toString()

    sendMessage("--- UI", "SetBalance", string_val)
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleMultiCallSetDeckData = async (RealmsData: string) => {

    console.log("----------------START OF MULTI------------------");

    const troopDatabaseAddress = "0x0218f28664c5a5d896f97ab4acacfb7c1be8c8d7e272a54a6bc11ac9d859aa36"
    const fucntionToCall = "SetDeckData"

    const arrayUnityTeamData = RealmsData.split("/");

    const arrayKeyData = arrayUnityTeamData[arrayUnityTeamData.length - 1].split("-");

    var arrayKey = [];

    for (let step = 0; step < arrayKeyData.length; step++) {
      arrayKey[step] = parseInt(arrayKeyData[step])
    }
    console.log(arrayKey + " this is the saved key for the multicall");    //pop the buffer

    var obj: any = {
      ArgentCall: []
    };

    for (let step = 0; step < arrayUnityTeamData.length - 1; step++) {


      const arrayUnityTeamDataFocused = arrayUnityTeamData[step].split("#");

      const realmID = arrayUnityTeamDataFocused[1];

      const arrayUnityData = arrayUnityTeamDataFocused[0].split("-");   // get the individaul ID

      var buffer = new ArrayBuffer(16)

      let view = new Uint8Array(buffer);
      // store everything in the buffer

      for (let step = 0; step < 16; step++) {


        if (step >= arrayUnityData.length) {
          view[step] = 0;
        }
        else {
          view[step] = parseInt(arrayUnityData[step]);
        }
      }
      console.log("this is the uint8array " + view);

      var compressed = SnappyJS.compress(view);       


      var aesCtr = new Aes_js.ModeOfOperation.ctr(arrayKey);
      var encryptedBytes = aesCtr.encrypt(compressed);


      var felt = stringToFelt(encryptedBytes);
      console.log("result for this iteration " + felt + " for realm " + realmID);

      obj.ArgentCall.push({
        contractAddress: troopDatabaseAddress,
        entrypoint: fucntionToCall,
        calldata: [realmID, felt]
      });
    }

    const result = await multiCallSetData(obj.ArgentCall, newNetVar);

    console.log("-------------- END OF MULTI------------------");
    setLastTransactionHash(result.transaction_hash);
    // this is where we send the message to unity about the tx
    var string_conc = result.transaction_hash + " SetSquad";
    sendMessage("CanvasLobby", "AddTX", string_conc);
    handleWaitForTransaction(result.transaction_hash);

  };


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleAskTroopData = async (_realmIdData: string) => {

    console.log("--------------------------------------------START OF THE ASK----------------------------------------------------------");
    console.log("i have been asked for data with this data" + _realmIdData);

    const arrayUnitySqaudData = _realmIdData.split("/");

    const realmID = arrayUnitySqaudData[0]

    const key = arrayUnitySqaudData[1]

    const arrayKeyData = key.split("-");

    var arrayKey = [];

    for (let step = 0; step < arrayKeyData.length; step++) {
      arrayKey[step] = parseInt(arrayKeyData[step])
    }




    const result = await GetRealmData(realmID, newNetVar)

    if (result === "0") { handleExitGame() }

    var encryptedData = result.toString()  //gets the right thing  this gets the encrypted felt from the contract
    console.log(encryptedData);

    const encryptedDatad = BigInt(encryptedData)

    var hexString: string = encryptedDatad.toString(16);

    var somthing = hexToBytes(hexString)

    const aesCtr = new Aes_js.ModeOfOperation.ctr(arrayKey);
    var decryptedBytes = aesCtr.decrypt(somthing);

    console.log(decryptedBytes);

    // Convert our bytes back into text
    var decryptedText = Aes_js.utils.utf8.fromBytes(decryptedBytes);

    try {
      var uncompressed = SnappyJS.uncompress(Aes_js.utils.utf8.toBytes(decryptedText))
      uncompressed = uncompressed + "_" + realmID

      sendMessage("DeckBuildTrial", "CallForRecieve", uncompressed)
    } catch (error) {
      sendMessage("DeckBuildTrial", "CallForRecieve", "")
    }
  };


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSetSNS = async (SNS: string) => {
    const result = await setSNS(SNS, newNetVar)

    if (result === "0") { handleExitGame() }

    console.log("setting your SNS to " + SNS);


    setLastTransactionHash(result.transaction_hash)
    // this is where we send the message to unity about the tx
    var string_conc = result.transaction_hash + " SetSNS"
    sendMessage("CanvasLobby", "AddTX", string_conc)
    handleWaitForTransaction(result.transaction_hash)


  };


  const handleGetSNSAvailability = async (SNS: string) => {

    const result = await checkSNSAvailability(SNS, newNetVar)

    if (result === "0") { handleExitGame() }


    var something = result.toString()  //gets the right thing  this gets the encrypted felt from the contract
    console.log(something);

    var cond = 1;

    if (something === "0") { cond = 1 }
    else { cond = 2 }


    sendMessage("--- UI", "receiveCheckSNS", cond)
  };


  // this is called as soon as the game loads, to be deletes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleGetAddressUpdate = async () => {

    if (address?.toString() === undefined) {
      handleExitGame()
    }
    else {
      sendMessage("--- UI", "SetAddressFelt", stringToFeltNo_0x(address).toString())
      sendMessage("--- UI", "SetAddress", address.toString())
    }
  };



  const handleExitGame = async () => {
    sendMessage("--- Scene", "HardRstartGame")
  };



  const handleWaitForTransaction = async (trans: string) => {

    // this function talks to the UI prefab in the settings Lobby that displays all of the curr TXs

    var conc_string = ""

    try {
      await waitForTransaction(trans)
      setTransactionStatus("success")
      conc_string = trans.toString() + " Success"
    } catch (error: any) {

      setTransactionStatus("failure")
      conc_string = trans.toString() + " Failed"
    };

    sendMessage("CanvasLobby", "UpdateTXStatus", conc_string.toString())
  }







  //
  // UNITY SIDE
  //

  const {
    unityProvider,
    isLoaded,
    loadingProgression,
    sendMessage,
    addEventListener,
    removeEventListener,
    requestFullscreen,
  } = useUnityContext({
    loaderUrl: "/unitybuild/Build/unitybuild.loader.js",
    dataUrl: "/unitybuild/Build/unitybuild.data.unityweb",
    frameworkUrl: "/unitybuild/Build/unitybuild.framework.js.unityweb",
    codeUrl: "/unitybuild/Build/unitybuild.wasm.unityweb",
    webglContextAttributes: {
      preserveDrawingBuffer: true,
    },
  });



  // THIS FUNCTION WILL NOT BE USED AND IS HERE FOR DEBUG ONLY, THE FULLSCREEN IS NOT POSSIBLE VIA CODE
  const handleClickFullscreen = () => {
    if (isLoaded === false) {
      return;
    }
    requestFullscreen(true);
  };

  const handleGetTeamDataunity = useCallback((score: string) => {

    var something = score
    handleAskTroopData(something)
    // Do something with the score
  }, [handleAskTroopData]);


  const handleSendTeamDataunity = useCallback((score: string) => {

    var something = score
    handleMultiCallSetDeckData(something)
    // Do something with the score
  }, [handleMultiCallSetDeckData]);


  const handleSetSNSunity = useCallback((data: string) => {
    handleSetSNS(data)
  }, [handleSetSNS]);



  const handleGetSNSunity = useCallback((data: string) => {
    handleGetSNSAvailability(data)
  }, []);


  const handleHostGameunity = useCallback((data: string) => {
    handleGetSNSAvailability(data)
  }, []);


  const handleJoinGameunity = useCallback((data: string) => {
    handleGetSNSAvailability(data)
  }, []);


  //
  //  EFFECT FUNCTIONS
  //


  // event listener for the transactions
  useEffect(() => {
    ; (async () => {
      if (lastTransactionHash && transactionStatus === "pending") {
        setTransactionError("")
        try {
          await waitForTransaction(lastTransactionHash)
          //setTransactionStatus("success")
        } catch (error: any) {
          //setTransactionStatus("failure")
          let message = error ? `${error}` : "No further details"
          if (error?.response) {
            message = JSON.stringify(error.response, null, 2)
          }
          setTransactionError(message)
        }
      }
    })()
  }, [transactionStatus, lastTransactionHash])

  // event listener for Unity
  useEffect(() => {
    addEventListener("ConnectWallet", handleConnectClick);
    addEventListener("CheckBalanceERC20", handleCheckBalance);
    addEventListener("RequestSquadData", handleGetTeamDataunity);
    addEventListener("SendSquadData", handleSendTeamDataunity);
    addEventListener("SetSNS", handleSetSNSunity);
    addEventListener("CheckSNS", handleGetSNSunity);
    return () => {
      removeEventListener("ConnectWallet", handleConnectClick);
      removeEventListener("CheckBalanceERC20", handleCheckBalance);
      removeEventListener("RequestSquadData", handleAskTroopData);
      removeEventListener("SendSquadData", handleSendTeamDataunity);
      removeEventListener("SetSNS", handleSetSNSunity);
      removeEventListener("CheckSNS", handleGetSNSunity);
    };
  }, [addEventListener, removeEventListener, handleConnectClick, handleCheckBalance, handleAskTroopData, handleSetSNSunity, handleGetSNSunity, handleGetTeamDataunity, handleSendTeamDataunity]);

  



  //
  //  HTML FUNCTIONS
  //


  return (
    <div className={styles.container}>

      <div className={styles.unityWrapper}>
        {isLoaded === false && (
          <div className={styles.loadingBar}>
            <div
              className={styles.loadingBarFill}
              style={{ width: loadingProgression * 100 }}
            />
          </div>
        )}
        <Unity
          unityProvider={unityProvider}
          style={{ display: isLoaded ? "block" : "none" }}

        />
      </div>
      <div className="buttons">
        <br />
        <br /> <br />
        <button className={stylesARG.connect} onClick={handleConnectClick}>
          Connect Wallet
        </button>
        {/* <button onClick={() => handleCheckBalance()}>
          check balance
        </button>

        <button onClick={() => handleAskTroopData("30/1-1-7-0-0-4-3-8-7-2-2-2-6-7-6-8")}>
          check realm
        </button>

        <button onClick={() => handleMintSubmit("10")}>
          Mint tken
        </button>

        <button onClick={() => handleSetSNS("test1fs67")}>
          SNS set test1
        </button>

        <button onClick={() => handleGetSNSAvailability("test1")}>
          test1
        </button>


        <button onClick={() => handleGetSNSAvailability("test12")}>
          test12
        </button>

        <button onClick={() => handleMultiCallSetDeckData("1-2-3-4-2-3-1-6-1-2-7-2-3-1-2-0#30/1-1-7-0-0-4-3-8-7-2-2-2-6-7-6-8")}>
          multicall
        </button> */}

        {/* <button onClick={() => 
        handleExitGame()}>
          exit addressss
        </button> */}

        <button onClick={handleClickFullscreen}>Fullscreen</button>
      </div>
      <h2><code>{address}</code></h2>
      <h2><code>{chain}</code></h2>
      <h2><code>{network}</code></h2>
      <h2><code>{lastTransactionHash}</code></h2>

      <h2><code>{transactionStatus}</code></h2>

      
    </div>
  );
};

export { App };
