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
    constructor(id, image, description, option1, option2, option3, count1, count2, count3, voting_start, voting_end, winner, owner, appId) {
        this.id = id;
        this.image = image;
        this.description = description;
        this.option1 = option1;
        this.option2 = option2;
        this.option3 = option3;
        this.count1 = count1;
        this.count2 = count2;
        this.count3 = count3;
        this.voting_start = voting_start;
        this.voting_end = voting_end;
        this.winner = winner;
        this.owner = owner;
        this.appId = appId;
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
    let id = new TextEncoder().encode(poll.id);
    let image = new TextEncoder().encode(poll.image);
    let description = new TextEncoder().encode(poll.description);
    let option1 = new TextEncoder().encode(poll.option1);
    let option2 = new TextEncoder().encode(poll.option2);
    let option3 = new TextEncoder().encode(poll.option3);
    let voting_duration = algosdk.encodeUint64(poll.voting_end);

    let appArgs = [id, image, description, option1, option2, option3, voting_duration]

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

export const optInAction = async (senderAddress, poll) => {
    console.log("Opting in...")

    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    let optinTxn = algosdk.makeApplicationOptInTxnFromObject({
        from: senderAddress,
        appIndex: poll.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        suggestedParams: params,
    })

    let signedTxn = await myAlgoConnect.signTransaction(optinTxn.toByte())
    let tx = await algodClient.sendRawTransaction(signedTxn.blob).do()
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
    console.log("Voting transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
}

export const declareWinnerAction = async (senderAddress, poll) => {
    console.log("Declaring the winner...")

    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    let voteArg = new TextEncoder().encode("declare_winner")
    let appArgs = [voteArg]

    let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAddress,
        appIndex: poll.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        suggestedParams: params,
        appArgs: appArgs
    })

    let signedTxn = await myAlgoConnect.signTransaction(appCallTxn.toByte())
    let tx = await algodClient.sendRawTransaction(signedTxn.blob).do()
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
    console.log("Voting transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
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
    console.log("Option: ", option)

    let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAddress,
        appIndex: poll.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        suggestedParams: params,
        appArgs: appArgs
    })

    let signedTxn = await myAlgoConnect.signTransaction(appCallTxn.toByte())
    let tx = await algodClient.sendRawTransaction(signedTxn.blob).do()
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
    console.log("Voting transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
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
        let id = ""
        let image = ""
        let description = ""
        let option1 = ""
        let option2 = ""
        let option3 = ""
        let winner = ""
        let voting_start = 0
        let voting_end = 0
        let count1 = 0
        let count2 = 0
        let count3 = 0

        const getField = (fieldName, globalState) => {
            return globalState.find(state => {
                return state.key === utf8ToBase64String(fieldName);
            })
        }

        if (getField("ID", globalState) !== undefined) {
            let field = getField("ID", globalState).value.bytes
            id = base64ToUTF8String(field)
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
            let field = getField("OPTION1", globalState).value.bytes
            option1 = base64ToUTF8String(field)
        }

        if (getField("OPTION2", globalState) !== undefined) {
            let field = getField("OPTION2", globalState).value.bytes
            option2 = base64ToUTF8String(field)
        }

        if (getField("OPTION3", globalState) !== undefined) {
            let field = getField("OPTION3", globalState).value.bytes
            option3 = base64ToUTF8String(field)
        }

        if (getField("WINNER", globalState) !== undefined) {
            let field = getField("WINNER", globalState).value.bytes
            winner = base64ToUTF8String(field)
        }

        if (getField("START", globalState) !== undefined) {
            voting_start = getField("START", globalState).value.uint
        }

        if (getField("END", globalState) !== undefined) {
            voting_end = getField("END", globalState).value.uint
        }

        if (getField("COUNT1", globalState) !== undefined) {
            count1 = getField("COUNT1", globalState).value.uint
        }

        if (getField("COUNT2", globalState) !== undefined) {
            count2 = getField("COUNT2", globalState).value.uint
        }

        if (getField("COUNT3", globalState) !== undefined) {
            count3 = getField("COUNT3", globalState).value.uint
        }

        return new Poll(id, image, description, option1, option2, option3, count1, count2, count3, voting_start, voting_end, winner, owner, appId)
    } catch (err) {
        return null;
    }
}