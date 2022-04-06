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

    const dynamoClient = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    const response = {
        statusCode: 200,
        statusText: 'OK',
        data: null
    };
    const {values} = event?.arguments;
    try {
        if (!values) {
            throw Error('Insufficient Params, Input');
        }
        if (!values?.payInfo || !Array.isArray(values.payInfo) || values.payInfo.length === 0) {
            throw Error('Payment information not provided');
        }
        const {Item: user} = await dynamoClient.getItem({
            TableName: 'MBUser-oqkpjuho2ngvbonruy7shv26zu-pre',
            Key: {
                'id': {S: values?.userId}
            }
        }).promise();
        const blinkUserId = uuid.v4();
        const ProcessedItems = {
            RequestItems: {
                'MBBlinkUser-oqkpjuho2ngvbonruy7shv26zu-pre': [{
                    PutRequest: {
                        Item: {
                            id: {S: blinkUserId},
                            userID: {S: values.userId},
                            blinkSettingID: {S: values.blinkSettingID},
                            blinkAcquired: {N: `${values?.packages?.blinks || 0}`},
                            blinkAvailable: {N: `${values?.packages?.blinks || 0}`},
                            blinkPrice: {N: `${values?.packages?.totalPrice || 0}`},
                            isPromotional: {BOOL: false},
                            currency: {S: values?.currency},
                            createdAt: {S: (new Date()).toISOString()},
                            updatedAt: {S: (new Date()).toISOString()}
                        }
                    }
                }],
                'MBBlinkPay-oqkpjuho2ngvbonruy7shv26zu-pre': []
            }
        };
        values?.payInfo.forEach((id) => {
            ProcessedItems.RequestItems['MBBlinkPay-oqkpjuho2ngvbonruy7shv26zu-pre'].push({
                PutRequest: {
                    Item: {
                        id: {S: uuid.v4()},
                        type: {S: 'BLINK'},
                        payID: {S: id},
                        blinkID: {S: blinkUserId},
                        userID: {S: values?.userId},
                        createdAt: {S: (new Date()).toISOString()}
                    }
                }
            });
        });
        const {Items, Count} = await dynamoClient.scan({
            FilterExpression: 'userID = :userID AND isActive = :isActive AND currency = :currency',
            ExpressionAttributeValues: {
                ':userID': {S: values.userId},
                ':isActive': {BOOL: true},
                ':currency': {S: values.currency}
            },
            TableName: 'MBFinancialData-oqkpjuho2ngvbonruy7shv26zu-pre'
        }).promise();
        if (Count !== 0) {
            const financialData = Items[0];
            const newAmount = Number(financialData?.blinks?.N) + values?.packages?.blinks;
            financialData.blinks = { N: newAmount.toString() };
            financialData.updatedAt = {S: (new Date()).toISOString()};
            ProcessedItems
                .RequestItems['MBFinancialData-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                PutRequest: {
                        Item: financialData
                }
            }];
        } else {
            ProcessedItems
                .RequestItems['MBFinancialData-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                PutRequest: {
                        Item: {
                            id: {S: uuid.v4()},
                            type: {S: 'UserBlink'},
                            amount: {N: '0'},
                            currency: {S: values?.currency},
                            blinks: {N: `${values?.packages?.blinks || 0}`},
                            isActive: {BOOL: true},
                            userID: {S: values?.userId},
                            createdAt: {S: (new Date()).toISOString()},
                            updatedAt: {S: (new Date()).toISOString()}
                        }
                }
            }];
        }
        response.data = await dynamoClient.batchWriteItem(ProcessedItems).promise();
        return response;
    } catch (e) {
        throw e;
    }
};
