import algosdk, { makePaymentTxnWithSuggestedParams } from "algosdk";
import {
    algodClient,
    indexerClient,
    votingNote,
    minRound,
    myAlgoConnect,
    numGlobalBytes,
    numGlobalInts,
    numLocalBytes,
    numLocalInts
} from "./constants";
/* eslint import/no-webpack-loader-syntax: off */
import approvalProgram from "!!raw-loader!../contracts/voting_approval.teal";
import clearProgram from "!!raw-loader!../contracts/voting_clear.teal";
import {base64ToUTF8String, utf8ToBase64String} from "./conversions";

class Poll {
    constructor(name, image, description, option1, option2, option3, appId, owner) {
        this.name = name;
        this.image = image;
        this.description = description;
        this.option1 = option1;
        this.option2 = option2;
        this.option3 = option3;
        this.appId = appId;
        this.owner = owner;
    }
}

// Compile smart contract in .teal format to program
const compileProgram = async (programSource) => {
    let encoder = new TextEncoder();
    let programBytes = encoder.encode(programSource);
    let compileResponse = await algodClient.compile(programBytes).do();
    return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
}

// CREATE PRODUCT: ApplicationCreateTxn
export const createPollAction = async (senderAddress, poll) => {
    console.log("Adding poll...")

    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    // Compile programs
    const compiledApprovalProgram = await compileProgram(approvalProgram)
    const compiledClearProgram = await compileProgram(clearProgram)

    // Build note to identify transaction later and required app args as Uint8Arrays
    let note = new TextEncoder().encode(votingNote);
    let name = new TextEncoder().encode(poll.name);
    let image = new TextEncoder().encode(poll.image);
    let description = new TextEncoder().encode(poll.description);
    let option1 = new TextEncoder().encode(poll.option1);
    let option2 = new TextEncoder().encode(poll.option2);
    let option3 = new TextEncoder().encode(poll.option3);

    let appArgs = [name, image, description, option1, option2, option3]

    // Create ApplicationCreateTxn
    let txn = algosdk.makeApplicationCreateTxnFromObject({
        from: senderAddress,
        suggestedParams: params,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: compiledApprovalProgram,
        clearProgram: compiledClearProgram,
        numLocalInts: numLocalInts,
        numLocalByteSlices: numLocalBytes,
        numGlobalInts: numGlobalInts,
        numGlobalByteSlices: numGlobalBytes,
        note: note,
        appArgs: appArgs
    });

    // Get transaction ID
    let txId = txn.txID().toString();

    // Sign & submit the transaction
    let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    console.log("Signed transaction with txID: %s", txId);
    await algodClient.sendRawTransaction(signedTxn.blob).do();

    // Wait for transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

    // Get the completed Transaction
    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // Get created application id and notify about completion
    let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
    let appId = transactionResponse['application-index'];
    console.log("Created new app-id: ", appId);
    return appId;
}

export const voteAction = async (senderAddress, poll, option) => {
    console.log("Voting...");

    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    // Build required app args as Uint8Array
    let voteArg = new TextEncoder().encode("vote")
    let optionArg = new TextEncoder().encode(option);
    let appArgs = [voteArg, optionArg]

    let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAddress,
        appIndex: poll.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        suggestedParams: params,
        appArgs: appArgs
    })

    let signedTxn = await myAlgoConnect.signTransaction(appCallTxn)
    let tx = await algodClient.sendRawTransaction(signedTxn).do()
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
    console.log("Voting transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    //// Create ApplicationCallTxn
    // let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
    //     from: senderAddress,
    //     appIndex: poll.appId,
    //     onComplete: algosdk.OnApplicationComplete.NoOpOC,
    //     suggestedParams: params,
    //     appArgs: appArgs
    // })

    // // Create PaymentTxn
    // let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    //     from: senderAddress,
    //     to: poll.owner,
    //     amount: product.price * count,
    //     suggestedParams: params
    // })

    // let txnArray = [appCallTxn, paymentTxn]

    // // Create group transaction out of previously build transactions
    // let groupID = algosdk.computeGroupID(txnArray)
    // for (let i = 0; i < 2; i++) txnArray[i].group = groupID;

    // // Sign & submit the group transaction
    // let signedTxn = await myAlgoConnect.signTransaction(txnArray.map(txn => txn.toByte()));
    // let tx = await algodClient.sendRawTransaction(signedTxn.map(txn => txn.blob)).do();
    
    // // Wait for group transaction to be confirmed
    // let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
    
    // // Notify about completion
    // console.log("Group transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
}

export const deletePollAction = async (senderAddress, index) => {
    console.log("Deleting application...");

    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    // Create ApplicationDeleteTxn
    let txn = algosdk.makeApplicationDeleteTxnFromObject({
        from: senderAddress, suggestedParams: params, appIndex: index,
    });

    // Get transaction ID
    let txId = txn.txID().toString();

    // Sign & submit the transaction
    let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    console.log("Signed transaction with txID: %s", txId);
    await algodClient.sendRawTransaction(signedTxn.blob).do();

    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

    // Get the completed Transaction
    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // Get application id of deleted application and notify about completion
    let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
    let appId = transactionResponse['txn']['txn'].apid;
    console.log("Deleted app-id: ", appId);
}

export const getPollsAction = async () => {
    console.log("Fetching polls...")
    let note = new TextEncoder().encode(votingNote);
    let encodedNote = Buffer.from(note).toString("base64");

    // Step 1: Get all transactions by notePrefix (+ minRound filter for performance)
    let transactionInfo = await indexerClient.searchForTransactions()
        .notePrefix(encodedNote)
        .txType("appl")
        .minRound(minRound)
        .do();
    let polls = []
    for (const transaction of transactionInfo.transactions) {
        let appId = transaction["created-application-index"]
        if (appId) {
            // Step 2: Get each application by application id
            let poll = await getApplication(appId)
            if (poll) {
                polls.push(poll)
            }
        }
    }
    console.log("Polls fetched.")
    return polls
}

const getApplication = async (appId) => {
    try {
        // 1. Get application by appId
        let response = await indexerClient.lookupApplications(appId).includeAll(true).do();
        if (response.application.deleted) {
            return null;
        }
        let globalState = response.application.params["global-state"]

        // 2. Parse fields of response and return product
        let owner = response.application.params.creator
        let name = ""
        let image = ""
        let description = ""
        let option1 = ""
        let option2 = ""
        let option3 = ""

        const getField = (fieldName, globalState) => {
            return globalState.find(state => {
                return state.key === utf8ToBase64String(fieldName);
            })
        }

        if (getField("NAME", globalState) !== undefined) {
            let field = getField("NAME", globalState).value.bytes
            name = base64ToUTF8String(field)
        }

        if (getField("IMAGE", globalState) !== undefined) {
            let field = getField("IMAGE", globalState).value.bytes
            image = base64ToUTF8String(field)
        }

        if (getField("DESCRIPTION", globalState) !== undefined) {
            let field = getField("DESCRIPTION", globalState).value.bytes
            description = base64ToUTF8String(field)
        }

        if (getField("OPTION1", globalState) !== undefined) {
            option1 = getField("OPTION1", globalState).value.uint
        }

        if (getField("OPTION2", globalState) !== undefined) {
            option2 = getField("OPTION2", globalState).value.uint
        }

        if (getField("OPTION3", globalState) !== undefined) {
            option3 = getField("OPTION3", globalState).value.uint
        }

        return new Poll(name, image, description, option1, option2, option3, appId, owner)
    } catch (err) {
        return null;
    }
}