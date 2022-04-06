/* Amplify Params - DO NOT EDIT
	API_MONEYBLINKSWALLET_GRAPHQLAPIENDPOINTOUTPUT
	API_MONEYBLINKSWALLET_GRAPHQLAPIIDOUTPUT
	API_MONEYBLINKSWALLET_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
const AWS = require('aws-sdk');

exports.handler = async (event) => {
    AWS.config.update({region: 'us-east-1'});
    const dynamoClient = new AWS.DynamoDB();
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
        result: {}
    };
    const params = event?.arguments?.values || {};
    try {
        if (!params?.type || !params?.userId) {
            throw Error('Insufficient Params');
        }

        switch (params?.type) {
            case "MOVEMENTS":
                let collectionAmount = 0;
                let blinkSendsAmount = 0;
                let blinkReceivedAmount = 0;
                let packagesAmount = 0;
                let chargesAmount = 0;
                let taxesAmount = 0;
                const {
                    Items: CollectionItems,
                    Count: CollectionCount
                } = await dynamoClient.scan({
                    FilterExpression: 'receiptID = :userID AND shippingID = :userID AND txStatus = :txStatus',
                    ExpressionAttributeValues: {
                        ':userID': {S: params.userId},
                        ':txStatus': {S: 'DOWN_CASH'}
                    },
                    TableName: 'MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'
                }).promise();
                if (CollectionCount > 0) {
                    CollectionItems.forEach((it, index) => {
                        collectionAmount += Number(it?.amountDeposit?.N) || 0;
                    });
                }
                const {
                    Items: CollectionItems1,
                    Count: CollectionCount1
                } = await dynamoClient.scan({
                    FilterExpression: 'receiptID = :userID AND shippingID <> :userID AND isConfirm = :isConfirm AND txStatus = :txStatus',
                    ExpressionAttributeValues: {
                        ':userID': {S: params.userId},
                        ':isConfirm': {BOOL: true},
                        ':txStatus': {S: 'DOWNLOAD'}
                    },
                    TableName: 'MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'
                }).promise();
                if (CollectionCount1 > 0) {
                    CollectionItems1.forEach((it, index) => {
                        collectionAmount += Number(it?.amountDeposit?.N) || 0;
                    });
                }
                const {
                    Items: BlinkSends,
                    Count: BlinkSendsCount
                } = await dynamoClient.scan({
                    FilterExpression: 'receiptID <> :userID AND shippingID = :userID',
                    ExpressionAttributeValues: {
                        ':userID': {S: params.userId}
                    },
                    TableName: 'MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'
                }).promise();
                if (BlinkSendsCount > 0) {
                    BlinkSends.forEach((it, index) => {
                        blinkSendsAmount += Number(it?.amount?.N) || 0;
                    });
                }
                const {
                    Items: BlinkReceived,
                    Count: BlinkReceivedCount
                } = await dynamoClient.scan({
                    FilterExpression: 'receiptID = :userID AND shippingID <> :userID',
                    ExpressionAttributeValues: {
                        ':userID': {S: params.userId}
                    },
                    TableName: 'MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'
                }).promise();
                if (BlinkReceivedCount > 0) {
                    BlinkReceived.forEach((it, index) => {
                        blinkReceivedAmount += Number(it?.amount?.N) || 0;
                    });
                }
                const {
                    Items: Packages,
                    Count: PackagesCount
                } = await dynamoClient.scan({
                    FilterExpression: 'userID = :userID AND blinkPrice > :blinkPrice',
                    ExpressionAttributeValues: {
                        ':userID': {S: params.userId},
                        ':blinkPrice': { N: '0' }
                    },
                    TableName: 'MBBlinkUser-oqkpjuho2ngvbonruy7shv26zu-pre'
                }).promise();
                if (PackagesCount > 0) {
                    Packages.forEach((it, index) => {
                        packagesAmount += Number(it?.amount?.N) || 0;
                    });
                }
                response.result = {
                    collectionAmount,
                    blinkSendsAmount,
                    blinkReceivedAmount,
                    packagesAmount,
                    chargesAmount,
                    taxesAmount
                }
                break;
            default:
                break;
        }
        return response;
    } catch (e) {
        throw e;
    }
};
