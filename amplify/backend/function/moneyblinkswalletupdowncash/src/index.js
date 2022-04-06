/* Amplify Params - DO NOT EDIT
	API_MONEYBLINKSWALLET_GRAPHQLAPIENDPOINTOUTPUT
	API_MONEYBLINKSWALLET_GRAPHQLAPIIDOUTPUT
	API_MONEYBLINKSWALLET_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
const AWS = require('aws-sdk');
const uuid = require('uuid');

exports.handler = async (event) => {
    AWS.config.update({region: 'us-east-1'});
    const dynamoClient = new AWS.DynamoDB();

    let response = {
        statusCode: 200,
        body: event,
    };
    const params = event?.arguments?.values || {};
    try {
        if (!params?.txType || !params?.userId) {
            throw Error('Insufficient Params');
        }
        let code = params?.code;
        let codeId = params?.codeId;
        if (!codeId) {
            codeId = uuid.v4();
        }
        if (!code) {
            const kmsCode = await new AWS.KMS().generateRandom({
                NumberOfBytes: 6
            }).promise();
            code = Buffer.from(kmsCode.Plaintext, 'binary').toString('base64').toUpperCase();
        }
        let ProcessedItems = {
            RequestItems: {}
        };

        switch (params?.txType) {
            case "UP_MONEY_CASH":
                if (params?.amount) {
                    const txId = uuid.v4();
                    const Transaction = {
                        id: {S: txId},
                        type: {S: 'TRANSACTION'},
                        createdAt: {S: (new Date()).toISOString()},
                        updatedAt: {S: (new Date()).toISOString()},
                        amount: {N: params?.total?.toString()},
                        currency: {S: params?.currency || 'USD'},
                        taxes: {N: '0'},
                        charges: {N: '0'},
                        amountDeposit: {N: params?.amount?.toString()},
                        currencyDeposit: {S: params?.currency},
                        message: {S: ''},
                        txType: {S: params?.txType || params?.tx?.txType},
                        txStatus: {S: 'UP_CASH'},
                        shippingID: {S: params?.userId},
                        receiptID: {S: params?.userId},
                        codeID: {S: codeId},
                        txValues: {S: JSON.stringify(params)},
                        isConfirm: {BOOL: false}
                    };
                    ProcessedItems.RequestItems['MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                        PutRequest: {
                            Item: Transaction
                        }
                    }];

                    response.body = {
                        txId
                    };
                } else {
                    ProcessedItems.RequestItems['MBCode-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                        PutRequest: {
                            Item: {
                                id: {S: codeId},
                                userID: {S: params?.userId},
                                code: {S: code},
                                codeType: {S: 'UP_MONEY_CASH'},
                                isUsed: {BOOL: false},
                                isUserUsed: { BOOL: false },
                                createdAt: {S: (new Date()).toISOString()},
                                updatedAt: {S: (new Date()).toISOString()}
                            }
                        }
                    }];
                    response.body = {
                        codeId,
                        code
                    };
                }
                break;
            case "DOWN_MONEY_CASH":
                if (params?.amount) {
                    const txId = uuid.v4();
                    const Transaction = {
                        id: {S: txId},
                        type: {S: 'TRANSACTION'},
                        createdAt: {S: (new Date()).toISOString()},
                        updatedAt: {S: (new Date()).toISOString()},
                        amount: {N: params?.amount?.toString()},
                        currency: {S: params?.currency || 'USD'},
                        taxes: {N: '0'},
                        charges: {N: '0'},
                        amountDeposit: {N: params?.amountToDeposit?.toString()},
                        currencyDeposit: {S: params?.currency},
                        message: {S: 'DOWNLOAD'},
                        txType: {S: params?.txType},
                        txStatus: {S: 'DOWN_CASH'},
                        shippingID: {S: params?.userId},
                        receiptID: {S: params?.userId},
                        codeID: {S: codeId},
                        txValues: {S: JSON.stringify(params)},
                        isConfirm: {BOOL: false}
                    };
                    ProcessedItems.RequestItems['MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                        PutRequest: {
                            Item: Transaction
                        }
                    }];

                    response.body = {
                        txId
                    };
                } else {
                    ProcessedItems.RequestItems['MBCode-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                        PutRequest: {
                            Item: {
                                id: {S: codeId},
                                userID: {S: params?.userId},
                                code: {S: code},
                                codeType: {S: 'DOWN_MONEY_CASH'},
                                isUsed: {BOOL: false},
                                isUserUsed: { BOOL: false },
                                createdAt: {S: (new Date()).toISOString()},
                                updatedAt: {S: (new Date()).toISOString()}
                            }
                        }
                    }];
                    response.body = {
                        codeId,
                        code
                    };
                }
                break;
            default:
                break;
        }
        await dynamoClient.batchWriteItem(ProcessedItems).promise();



        return response;
    } catch (e) {
        throw e;
    }
};
