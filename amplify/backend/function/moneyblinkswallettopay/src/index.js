/* Amplify Params - DO NOT EDIT
	API_MONEYBLINKSWALLET_GRAPHQLAPIENDPOINTOUTPUT
	API_MONEYBLINKSWALLET_GRAPHQLAPIIDOUTPUT
	API_MONEYBLINKSWALLET_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
const AWS = require('aws-sdk');
const uuid = require('uuid');
const plaid = require('plaid');
const axios = require('axios');

exports.handler = async (event) => {
    AWS.config.update({region: 'us-east-1'});

    const dynamoClient = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    // TODO implement
    let response = {
        statusCode: 200,
        status: 'OK',
        body: event.arguments,
        error: null,
        payInfo: null
    };
    const {payInput} = event?.arguments;
    try {
        if (!payInput) {
            throw Error('Insufficient Params');
        }
        if (!payInput.paymentMethod || !payInput.userId ||
            !payInput.total || !payInput.currency || !payInput.description) {
            throw Error('Insufficient Params');
        }
        const {Item: user} = await dynamoClient.getItem({
            TableName: 'MBUser-oqkpjuho2ngvbonruy7shv26zu-pre',
            Key: {
                'id': {S: payInput?.userId}
            }
        }).promise();
        if (!user?.isAvailabilityTx?.BOOL) {
            throw Error('Your user is not authorized to carry out transactions.');
        }
        if (payInput.paymentMethod === 'ACCOUNT' || payInput.paymentMethod === 'CARD' || payInput.paymentMethod === 'THIRD_PARTIES') {
            throw Error('Payment method no accepted');
        }
        const payId = uuid.v4();
        if (payInput.paymentMethod === 'AMOUNTMB') {
            const {Items, Count} = await dynamoClient.scan({
                FilterExpression: 'userID = :userID AND isActive = :isActive AND currency = :currency',
                ExpressionAttributeValues: {
                    ':userID': {S: payInput.userId},
                    ':isActive': {BOOL: true},
                    ':currency': {S: payInput.currency}
                },
                TableName: 'MBFinancialData-oqkpjuho2ngvbonruy7shv26zu-pre'
            }).promise();
            if (Count === 0) {
                throw Error('Insufficient founds');
            }
            let amount = Items[0].amount.N || 0;
            let item = Items[0];
            if (amount < payInput.total) {
                throw Error('Insufficient founds');
            } else {
                const resultAmount = amount - payInput.total;
                item.amount = {N: resultAmount.toString()};
                item.updatedAt = {S: (new Date()).toISOString()};
                const {UnprocessedItems} = await dynamoClient.batchWriteItem({
                    RequestItems: {
                        'MBFinancialData-oqkpjuho2ngvbonruy7shv26zu-pre': [
                            {
                                PutRequest: {
                                    Item: item
                                }
                            }
                        ],
                        'MBPay-oqkpjuho2ngvbonruy7shv26zu-pre': [
                            {
                                PutRequest: {
                                    Item: {
                                        "id": {S: payId},
                                        "type": {S: "PAY"},
                                        "amount": {N: payInput.total.toString()},
                                        "currency": {S: payInput.currency},
                                        "userID": {S: payInput.userId},
                                        "paymentMethodCountry": {S: "AMOUNTMB"},
                                        "createdAt": {S: (new Date()).toISOString()},
                                        "updatedAt": {S: (new Date()).toISOString()}
                                    }
                                }
                            }
                        ]
                    }
                }).promise();
                if (Object.keys(UnprocessedItems).length !== 0) {
                    throw Error('An error occurred during the payment process.')
                }
                response.payInfo = [payId];
            }
        } else {
            const {Item} = await dynamoClient.getItem({
                TableName: 'MBMyPaymentMethod-oqkpjuho2ngvbonruy7shv26zu-pre',
                Key: {
                    'id': {S: payInput.paymentMethod}
                }
            }).promise();
            if (!Item) {
                throw Error('Payment method not found');
            }
            switch (Item?.payType?.S) {
                case "ACCOUNT":
                    const ProcessedItems = {
                        RequestItems: {}
                    };
                    const {Item: PaymentMethodCountry} = await dynamoClient.getItem({
                        TableName: 'MBPaymentMethodCountry-oqkpjuho2ngvbonruy7shv26zu-pre',
                        Key: {
                            'id': {S: Item?.paymentMethodCountryID?.S}
                        }
                    }).promise();
                    if (!PaymentMethodCountry) {
                        throw Error('An error occurred during the payment process.');
                    }
                    if (!PaymentMethodCountry?.isShipping?.BOOL) {
                        throw Error('This payment method is not available for shipping or purchases.');
                    }
                    const {
                        noConnected,
                        environment,
                        clientSecret,
                        clientId,
                        apiVersion,
                        apiPlatform
                    } = PaymentMethodCountry?.settings?.M?.settings?.M;
                    if (noConnected?.BOOL) {
                        throw Error('This payment method is not available for shipping or purchases.');
                    }
                    if (apiPlatform?.S === "PLAID") {
                        const plaidClient = new plaid.Client({
                            clientID: clientId?.S,
                            secret: clientSecret?.S,
                            env: environment?.S,
                            options: {
                                version: apiVersion?.S
                            },
                        });
                        const {
                            accessToken,
                            account_id
                        } = Item?.settings?.M;
                        const {accounts: plaidAccounts, status_code} = await plaidClient.getBalance(accessToken?.S, {
                            'account_ids': [account_id?.S]
                        });
                        let usedAmountUser = payInput.total;
                        let amountToReduce = null;
                        if (user?.isUsedMoneyBlinkAmount?.BOOL) {
                            const {Items, Count} = await dynamoClient.scan({
                                FilterExpression: 'userID = :userID AND isActive = :isActive AND currency = :currency',
                                ExpressionAttributeValues: {
                                    ':userID': {S: payInput.userId},
                                    ':isActive': {BOOL: true},
                                    ':currency': {S: payInput.currency}
                                },
                                TableName: 'MBFinancialData-oqkpjuho2ngvbonruy7shv26zu-pre'
                            }).promise();
                            if (Count !== 0) {
                                const amount = Items[0].amount.N || 0;
                                if (amount > 0) {
                                    amountToReduce = Items[0];
                                    const ItemPay = {
                                        id: {S: payId},
                                        type: {S: "PAY"},
                                        amount: {N: '0'},
                                        currency: {S: payInput.currency},
                                        userID: {S: payInput.userId},
                                        paymentMethodCountry: {S: "AMOUNTMB"},
                                        createdAt: {S: (new Date()).toISOString()},
                                        updatedAt: {S: (new Date()).toISOString()}
                                    };
                                    const newAmount = amountToReduce?.amount?.N - payInput.total;
                                    if (newAmount < 0) {
                                        ItemPay.amount = { N: amount.toString() };
                                        amountToReduce.amount = {N: '0'};
                                        usedAmountUser = -1 * newAmount;
                                    } else {
                                        ItemPay.amount = { N: payInput.total.toString() };
                                        amountToReduce.amount = {N: newAmount.toString()};
                                    }
                                    ProcessedItems
                                        .RequestItems['MBFinancialData-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                                        PutRequest: {
                                            Item: amountToReduce
                                        }
                                    }];
                                    ProcessedItems
                                        .RequestItems['MBPay-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                                        PutRequest: {
                                            Item: ItemPay
                                        }
                                    }];
                                    response.payInfo = [
                                        payId
                                    ];
                                }
                            }
                        }
                        if (status_code === 200 && plaidAccounts.length > 0) {
                            const userAccount = plaidAccounts[0];
                            const {balances} = userAccount;
                            if (balances?.current < usedAmountUser) {
                                throw Error('Insufficient founds');
                            }
                            if (usedAmountUser > 0) {
                                const {Items, Count} = await dynamoClient.scan({
                                    FilterExpression: 'platform = :platform AND isActive = :isActive',
                                    ExpressionAttributeValues: {
                                        ':platform': {S: "ModernTreasury"},
                                        ':isActive': {BOOL: true}
                                    },
                                    TableName: 'MBSettings-oqkpjuho2ngvbonruy7shv26zu-pre'
                                }).promise();
                                if (Count === 0) {
                                    throw Error('Your payment cannot be processed at this time. Please try another time.');
                                }
                                const modernTreasury = Items[0];
                                const {organizationID, key, endpoint} = modernTreasury?.settings?.M;
                                if (!organizationID?.S || !key.S || !endpoint?.S) {
                                    throw Error('Your payment cannot be processed at this time. Please try another time.');
                                }
                                const headers = {
                                    'Authorization': `Basic ${Buffer.from(`${organizationID.S}:${key.S}`).toString("base64")}`
                                }
                                const {status, statusText} = await axios.get(`${endpoint.S}/ping`, {
                                    headers
                                });
                                if (status !== 200) {
                                    throw Error(statusText);
                                }
                                const {
                                    data: internalAccounts,
                                    status: accountStatus,
                                    statusText: accountText
                                } = await axios.get(`${endpoint.S}/internal_accounts`, {
                                    headers
                                });
                                if (accountStatus >= 400) {
                                    throw Error(accountText);
                                }
                                if (internalAccounts.length === 0) {
                                    throw Error('Your payment cannot be processed at this time. Please try another time.');
                                }
                                const corporateUSD = internalAccounts.filter((account) => account.currency.toUpperCase().indexOf("USD") === 0);
                                if (corporateUSD.length === 0) {
                                    throw Error('Your payment cannot be processed at this time. Please try another time.');
                                }
                                const internalAccount = corporateUSD[0];
                                const {processor_token, request_id} = await plaidClient
                                    .createProcessorToken(accessToken?.S, userAccount.account_id, 'modern_treasury');
                                const {
                                    data: counterParties,
                                    status: statusCounterparties,
                                    statusText: statusTextCounterparties
                                } = await axios.post(`${endpoint.S}/counterparties`, {
                                    name: user?.fullName?.S,
                                    "accounts": [
                                        {
                                            "plaid_processor_token": processor_token
                                        }
                                    ]
                                }, {
                                    headers
                                });
                                if (statusCounterparties >= 400) {
                                    throw Error(statusTextCounterparties);
                                }
                                const modernTreasuryCounterpartiesAccount = counterParties.accounts[0];
                                const {
                                    data: paymentOrder,
                                    status: statusOrder,
                                    statusText: statusTextOrder
                                } = await axios.post(`${endpoint.S}/payment_orders`, {
                                    "type": "ach",
                                    "amount": (usedAmountUser * 100),
                                    "description": `MoneyBlinks Wallet Debit From Account User by: ${payInput.description}`,
                                    "direction": "debit",
                                    "priority": "high",
                                    "currency": payInput.currency,
                                    "receiving_account_id": modernTreasuryCounterpartiesAccount?.id,
                                    "originating_account_id": internalAccount.id
                                }, {
                                    headers
                                });
                                if (statusOrder >= 400) {
                                    throw Error(statusTextOrder);
                                }
                                if (paymentOrder) {
                                    if (ProcessedItems
                                        .RequestItems
                                        .hasOwnProperty('MBPay-oqkpjuho2ngvbonruy7shv26zu-pre')) {
                                        const newPayId = uuid.v4();
                                        ProcessedItems
                                            .RequestItems['MBPay-oqkpjuho2ngvbonruy7shv26zu-pre'].push({
                                            PutRequest: {
                                                Item: {
                                                    "id": {S: newPayId},
                                                    "type": {S: "PAY"},
                                                    "amount": {N: usedAmountUser.toString()},
                                                    "currency": {S: payInput.currency},
                                                    "userID": {S: payInput.userId},
                                                    "paymentMethodCountry": {S: "ACCOUNT"},
                                                    "paymentID": {S: payInput.paymentMethod},
                                                    "createdAt": {S: (new Date()).toISOString()},
                                                    "updatedAt": {S: (new Date()).toISOString()}
                                                }
                                            }
                                        });
                                        response.payInfo = [
                                            payId,
                                            newPayId
                                        ]
                                    } else {
                                        ProcessedItems
                                            .RequestItems['MBPay-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                                            PutRequest: {
                                                Item: {
                                                    "id": {S: payId},
                                                    "type": {S: "PAY"},
                                                    "amount": {N: usedAmountUser.toString()},
                                                    "currency": {S: payInput.currency},
                                                    "userID": {S: payInput.userId},
                                                    "paymentMethodCountry": {S: "ACCOUNT"},
                                                    "paymentID": {S: payInput.paymentMethod},
                                                    "createdAt": {S: (new Date()).toISOString()},
                                                    "updatedAt": {S: (new Date()).toISOString()}
                                                }
                                            }
                                        }];
                                        response.payInfo = [payId];
                                    }
                                }
                            }
                        }
                    }
                    await dynamoClient.batchWriteItem(ProcessedItems).promise();
                    break;
                default:
                    break;
            }
        }
        return response;
    } catch (e) {
        console.log('Error', e);
        throw e;
    }
};
