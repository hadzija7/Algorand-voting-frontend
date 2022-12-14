import algosdk from "algosdk";
import MyAlgoConnect from "@randlabs/myalgo-connect";

const config = {
    algodToken: "",
    algodServer: "https://node.testnet.algoexplorerapi.io",
    algodPort: "",
    indexerToken: "",
    indexerServer: "https://algoindexer.testnet.algoexplorerapi.io",
    indexerPort: "",
}

export const algodClient = new algosdk.Algodv2(config.algodToken, config.algodServer, config.algodPort)

export const indexerClient = new algosdk.Indexer(config.indexerToken, config.indexerServer, config.indexerPort);

export const myAlgoConnect = new MyAlgoConnect();

//limit the searching area for indexer
export const minRound = 21540981;

// https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0002.md
export const votingNote = "voting-system:uv1"

// Maximum local storage allocation, immutable
export const numLocalInts = 1;
export const numLocalBytes = 0;
// Maximum global storage allocation, immutable
export const numGlobalInts = 5; // Global variables stored as Int: count, sold
export const numGlobalBytes = 8; // Global variables stored as Bytes: name, description, image

export const ALGORAND_DECIMALS = 6;