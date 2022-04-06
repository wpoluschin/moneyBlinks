/* Amplify Params - DO NOT EDIT
	API_MONEYBLINKSWALLET_GRAPHQLAPIENDPOINTOUTPUT
	API_MONEYBLINKSWALLET_GRAPHQLAPIIDOUTPUT
	API_MONEYBLINKSWALLET_GRAPHQLAPIKEYOUTPUT
	API_MONEYBLINKSWALLET_MBCODETABLE_ARN
	API_MONEYBLINKSWALLET_MBCODETABLE_NAME
	API_MONEYBLINKSWALLET_MBCONTACTTABLE_ARN
	API_MONEYBLINKSWALLET_MBCONTACTTABLE_NAME
	API_MONEYBLINKSWALLET_MBTRANSACTIONTABLE_ARN
	API_MONEYBLINKSWALLET_MBTRANSACTIONTABLE_NAME
	API_MONEYBLINKSWALLET_MBUSERTABLE_ARN
	API_MONEYBLINKSWALLET_MBUSERTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */
const AWS = require('aws-sdk');
const uuid = require('uuid');
const axios = require('axios');

exports.handler = async (event) => {
    AWS.config.update({region: 'us-east-1'});
    const dynamoClient = new AWS.DynamoDB();
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    const params = event?.arguments?.values || {};
    try {
        if (!params?.type || !params?.userId || params?.isCreated === undefined || params?.isCreated === null) {
            throw Error('Insufficient Params');
        }
        const kmsCode = await new AWS.KMS().generateRandom({
            NumberOfBytes: 6
        }).promise();
        const code = Buffer.from(kmsCode.Plaintext, 'binary').toString('base64').toUpperCase();
        switch (params?.type) {
            case "CODE_SHARED":
                if (!params?.isCreated) {
                    throw Error('Insufficient Params');
                }
                const codeId = uuid.v4();
                const ProcessedItems = {
                    RequestItems: {
                        ['MBCode-oqkpjuho2ngvbonruy7shv26zu-pre']: [{
                            PutRequest: {
                                Item: {
                                    id: {S: codeId},
                                    userID: {S: params?.userId},
                                    code: {S: code},
                                    codeType: {S: 'CONTACT'},
                                    isUsed: {BOOL: false},
                                    createdAt: {S: (new Date()).toISOString()},
                                    updatedAt: {S: (new Date()).toISOString()}
                                }
                            }
                        }]
                    }
                };
                await dynamoClient.batchWriteItem(ProcessedItems).promise();
                response.body = {
                    codeId,
                    code
                };
                break;
            default:
                break;
        }
        return response;
    } catch (e) {
        throw e;
    }
};
