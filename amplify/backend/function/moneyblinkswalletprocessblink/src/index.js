/* Amplify Params - DO NOT EDIT
	API_MONEYBLINKSWALLET_GRAPHQLAPIENDPOINTOUTPUT
	API_MONEYBLINKSWALLET_GRAPHQLAPIIDOUTPUT
	API_MONEYBLINKSWALLET_GRAPHQLAPIKEYOUTPUT
	API_MONEYBLINKSWALLET_MBCODETABLE_ARN
	API_MONEYBLINKSWALLET_MBCODETABLE_NAME
	API_MONEYBLINKSWALLET_MBCONTACTTABLE_ARN
	API_MONEYBLINKSWALLET_MBCONTACTTABLE_NAME
	API_MONEYBLINKSWALLET_MBCOUNTRYTABLE_ARN
	API_MONEYBLINKSWALLET_MBCOUNTRYTABLE_NAME
	API_MONEYBLINKSWALLET_MBFINANCIALDATATABLE_ARN
	API_MONEYBLINKSWALLET_MBFINANCIALDATATABLE_NAME
	API_MONEYBLINKSWALLET_MBMYPAYMENTMETHODTABLE_ARN
	API_MONEYBLINKSWALLET_MBMYPAYMENTMETHODTABLE_NAME
	API_MONEYBLINKSWALLET_MBPAYMENTMETHODCOUNTRYTABLE_ARN
	API_MONEYBLINKSWALLET_MBPAYMENTMETHODCOUNTRYTABLE_NAME
	API_MONEYBLINKSWALLET_MBPAYMENTMETHODTABLE_ARN
	API_MONEYBLINKSWALLET_MBPAYMENTMETHODTABLE_NAME
	API_MONEYBLINKSWALLET_MBTRANSACTIONTABLE_ARN
	API_MONEYBLINKSWALLET_MBTRANSACTIONTABLE_NAME
	API_MONEYBLINKSWALLET_MBUSERTABLE_ARN
	API_MONEYBLINKSWALLET_MBUSERTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */
const AWS = require('aws-sdk');
const uuid = require('uuid');
const plaid = require('plaid');
const axios = require('axios');

exports.handler = async (event) => {
    AWS.config.update({region: 'us-east-1'});
    const dynamoClient = new AWS.DynamoDB();
    const pinpoint = new AWS.Pinpoint();
    let response = {
        statusCode: 200,
        body: event?.arguments?.values,
    };
    let reversePaymentOrderMT = null;
    let reverseParams = null;
    let headers = null;
    const params = event?.arguments?.values || {};
    try {
        if (!params?.tx || !params?.tx?.id || !params?.userId || !params?.code) {
            throw Error('Insufficient Params');
        }
        const {Item: user} = await dynamoClient.getItem({
            TableName: 'MBUser-oqkpjuho2ngvbonruy7shv26zu-pre',
            Key: {
                'id': {S: params?.userId}
            }
        }).promise();
        const ProcessedItems = {
            RequestItems: {}
        };

        const { Items, Count } = await dynamoClient.scan({
            FilterExpression: 'userID <> :userID AND isUsed = :isUsed AND code = :code AND codeType = :codeType',
            ExpressionAttributeValues: {
                ':userID': {S: params?.userId},
                ':isUsed': {BOOL: false},
                ':code': {S: params?.code},
                ':codeType': { S: "TX" }
            },
            TableName: 'MBCode-oqkpjuho2ngvbonruy7shv26zu-pre'
        }).promise();
        if (Count === 0) {
            throw Error('The code you provide is not available in our system.');
        } else if (Count > 1) {
            throw Error('Our codes can only be used once.');
        } else if (Items[0].code?.S !== params?.tx?.moneyBlinksCode.code) {
            throw Error('The code provided by you is incorrect. Please try another code.');
        }
        const { Item: Transaction } = await dynamoClient.getItem({
            TableName: 'MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre',
            Key: {
                'id': {S: params?.tx?.id}
            }
        }).promise();
        const CodeItem = Items[0];
        ProcessedItems.RequestItems['MBCode-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
            PutRequest: {
                Item: {
                    ...CodeItem,
                    ...{
                        isUsed: { BOOL: true },
                        updatedAt: { S: (new Date()).toISOString() }
                    }
                }
            }
        }];
        switch (params?.tx?.txType) {
            case "SEND":
                if (params?.tx?.txStatus === "SEND" || params?.tx?.txStatus === "CONFIRM") {
                    if (!params?.tx?.isConfirm) {
                        throw Error('The blink cannot be processed.');
                    } else if (params?.tx?.isReceipt) {
                        throw Error('The blink has already been processed before.');
                    } else if ( Transaction?.receiptID?.S !== params?.userId) {
                        throw Error('You do not have permissions to process this blink.');
                    }
                    // TO-DO Realizar conversion de moneda para cuando proceda.
                    Transaction.isReceipt = { BOOL: true };
                    Transaction.txStatus = { S: "DOWNLOAD" };
                    Transaction.updatedAt = { S: (new Date()).toISOString() };
                    ProcessedItems.RequestItems['MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                        PutRequest: {
                            Item: Transaction
                        }
                    }];
                    if (params?.paymentMethod === "AMOUNTMB") {
                        const {Items, Count} = await dynamoClient.scan({
                            FilterExpression: 'userID = :userID AND isActive = :isActive AND currency = :currency',
                            ExpressionAttributeValues: {
                                ':userID': {S: params?.userId},
                                ':isActive': {BOOL: true},
                                ':currency': {S: user?.currency?.S}
                            },
                            TableName: 'MBFinancialData-oqkpjuho2ngvbonruy7shv26zu-pre'
                        }).promise();
                        if (Count !== 0) {
                            const financialData = Items[0];
                            const newAmount = parseFloat(financialData?.amount?.N) + parseFloat(Transaction?.amountDeposit?.N);
                            financialData.amount = {N: newAmount.toString()};
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
                                        id: { S: uuid.v4() },
                                        type: {S: "MBFinancialData"},
                                        amount: { N: Transaction.amountDeposit.N },
                                        currency: { S: Transaction.currencyDeposit.S },
                                        blinks: { N: '0' },
                                        isActive: { BOOL: true },
                                        userID: { S: params?.userId },
                                        createdAt: { S: (new Date()).toISOString() },
                                        updatedAt: { S: (new Date()).toISOString() }
                                    }
                                }
                            }];
                        }

                        ProcessedItems.RequestItems['MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                            PutRequest: {
                                Item: {
                                    id: { S: uuid.v4() },
                                    type: { S: "TX" },
                                    txID: { S: params?.tx?.id },
                                    createdAt: { S: (new Date()).toISOString() },
                                    updatedAt: { S: (new Date()).toISOString() },
                                    processAt: { S: (new Date()).toISOString() },
                                    paymentMethod: { S: params?.paymentMethod },
                                    paymentMethodId: { S: params?.paymentMethodId },
                                    batchCatch: { S: (new Date()).toISOString() },
                                    userID: { S: params?.userId },
                                    amount: { N: Transaction.amountDeposit?.N },
                                    currency: { S: `${Transaction.currencyDeposit.S || params?.tx?.currency}` },
                                    stateCode: { S: params?.alpha2Code }
                                }
                            }
                        }];
                    } else if (params?.paymentMethod === "ACCOUNT") {
                        const { Item: PaymentMethod } = await dynamoClient.getItem({
                            TableName: "MBMyPaymentMethod-oqkpjuho2ngvbonruy7shv26zu-pre",
                            Key: {
                                id: { S: params?.paymentMethodId }
                            }
                        }).promise();

                        if (!PaymentMethod) {
                            throw Error('The account provided for the deposit does not exist.');
                        }

                        const { Item: CountryPaymentMethod } = await dynamoClient.getItem({
                            TableName: 'MBPaymentMethodCountry-oqkpjuho2ngvbonruy7shv26zu-pre',
                            Key: {
                                id: { S: PaymentMethod.paymentMethodCountryID.S }
                            }
                        }).promise();

                        if (!CountryPaymentMethod) {
                            throw Error('The account provided for the deposit does not exist.');
                        }
                        const setting = CountryPaymentMethod.settings.M.settings.M;
                        const {
                            noConnected,
                            environment,
                            clientSecret,
                            clientId,
                            apiVersion,
                            apiPlatform
                        } = setting;
                        if (!noConnected?.BOOL && apiPlatform?.S === "PLAID") {
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
                                    account_id,
                                    accessToken
                                } = PaymentMethod.settings?.M;
                                const {accounts: plaidAccounts, status_code} = await plaidClient.getAccounts(accessToken?.S, {
                                    'account_ids': [account_id?.S]
                                });

                                if (status_code === 200 && plaidAccounts.length > 0) {
                                    const userAccount = plaidAccounts[0];
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
                                    reverseParams = modernTreasury?.settings?.M;
                                    if (!organizationID?.S || !key.S || !endpoint?.S) {
                                        throw Error('Your payment cannot be processed at this time. Please try another time.');
                                    }
                                    headers = {
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
                                        "amount": (parseFloat(Transaction?.amountDeposit?.N) * 100),
                                        "description": `MoneyBlinks Wallet Credit To Account User by: Blink Download`,
                                        "direction": "credit",
                                        "priority": "high",
                                        "currency": Transaction.currencyDeposit?.S,
                                        "receiving_account_id": modernTreasuryCounterpartiesAccount?.id,
                                        "originating_account_id": internalAccount.id
                                    }, {
                                        headers
                                    });
                                    if (statusOrder >= 400) {
                                        throw Error(statusTextOrder);
                                    }
                                    reversePaymentOrderMT = paymentOrder;
                                    ProcessedItems.RequestItems['MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                                        PutRequest: {
                                            Item: {
                                                id: { S: uuid.v4() },
                                                type: { S: "TX" },
                                                txID: { S: params?.tx?.id },
                                                createdAt: { S: (new Date()).toISOString() },
                                                updatedAt: { S: (new Date()).toISOString() },
                                                processAt: { S: (new Date()).toISOString() },
                                                paymentMethod: { S: params?.paymentMethod },
                                                paymentMethodId: { S: params?.paymentMethodId },
                                                batchCatch: { S: (new Date()).toISOString() },
                                                userID: { S: params?.userId },
                                                amount: { N: params?.tx?.amountDeposit },
                                                currency: { S: params?.tx?.currencyDeposit },
                                                stateCode: { S: params?.alpha2Code }
                                            }
                                        }
                                    }];
                                }
                            }
                        } else if (noConnected.BOOL) {
                            ProcessedItems.RequestItems['MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                                PutRequest: {
                                    Item: {
                                        id: { S: uuid.v4() },
                                        type: { S: "TX" },
                                        txID: { S: params?.tx?.id },
                                        createdAt: { S: (new Date()).toISOString() },
                                        updatedAt: { S: (new Date()).toISOString() },
                                        paymentMethod: { S: "ACCOUNT" },
                                        paymentMethodId: { S: params?.paymentMethodId },
                                        userID: { S: params?.userId },
                                        amount: { N: `${params?.amountToDeposit || params?.tx?.amountDeposit}` },
                                        currency: { S: `${Transaction.currencyDeposit?.S || params?.tx?.currency}` },
                                        stateCode: { S: params?.alpha2Code }
                                    }
                                }
                            }];
                        }
                    } else if (params?.paymentMethod === "THIRD_PARTIES") {
                        ProcessedItems.RequestItems['MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                            PutRequest: {
                                Item: {
                                    id: { S: uuid.v4() },
                                    type: { S: "TX" },
                                    txID: { S: params?.tx?.id },
                                    createdAt: { S: (new Date()).toISOString() },
                                    updatedAt: { S: (new Date()).toISOString() },
                                    paymentMethod: { S: params?.paymentMethod },
                                    paymentMethodId: { S: params?.paymentMethodId },
                                    userID: { S: params?.userId },
                                    amount: { N: `${params?.amountToDeposit || params?.tx?.amountToDeposit}` },
                                    currency: { S: `${Transaction.currencyDeposit?.S || params?.tx?.currency}` },
                                    stateCode: { S: params?.alpha2Code }
                                }
                            }
                        }];
                    }
                    ProcessedItems.RequestItems['MBNotification-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                        PutRequest: {
                            Item: {
                                id: { S: uuid.v4() },
                                type: { S: "NOTIFICATION" },
                                createdAt: { S: (new Date()).toISOString() },
                                updatedAt: { S: (new Date()).toISOString() },
                                isRead: { BOOL: false },
                                data: { S: JSON.stringify({
                                        txId: params?.tx?.id,
                                        txType: params?.tx?.txType,
                                        txStatus: params?.tx?.txStatus,
                                        userId: params?.tx?.shippingID,
                                        read: true
                                    }) },
                                title: { S: `${ params?.tx?.shipping?.locale === 'es' ? 'Han descargado el blink enviado' : 'They have downloaded the blink sent'}` },
                                message: { S: `${ params?.tx?.shipping?.contact?.locale === 'es' ? `${user?.fullName?.S} ha descargado el blink enviado por ${params?.tx?.amount.toFixed(2)} ${params?.tx?.currency}.` : `${user?.fullName?.S} has downloaded the blink sent by ${params?.tx?.amount.toFixed(2)} ${params?.tx?.currency}`}`},
                                userID: { S: params?.tx?.shippingID }
                            }
                        }
                    }];
                    // console.log(ProcessedItems.RequestItems['MBCode-oqkpjuho2ngvbonruy7shv26zu-pre'][0].PutRequest.Item);
                    // console.log(ProcessedItems.RequestItems['MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'][0].PutRequest.Item);
                    // console.log(ProcessedItems.RequestItems['MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre'][0].PutRequest.Item);
                    await dynamoClient.batchWriteItem(ProcessedItems).promise();


                    try {
                        const {SMSTemplateResponse} = await pinpoint.getSmsTemplate({
                            TemplateName: `DOWNLOAD_BLINK_BY_USER_${params?.tx?.shipping?.locale?.toUpperCase() || 'ES'}`,
                            Version: '1'
                        }).promise();
                        const {EmailTemplateResponse} = await pinpoint.getEmailTemplate({
                            TemplateName: 'USER_DOWNLOAD_BLINK',
                            Version: '1'
                        }).promise();

                        const AddressToSend = {
                            [params?.tx?.shipping?.phoneNumber]: {
                                ChannelType: "SMS"
                            },
                            [params?.tx?.shipping?.email]: {
                                ChannelType: "EMAIL"
                            }
                        }
                        if (Object.keys(AddressToSend).length > 0) {
                            await pinpoint.updateSmsTemplate({
                                TemplateName: `DOWNLOAD_BLINK_BY_USER_${params?.tx?.shipping?.locale?.toUpperCase() || 'ES'}`,
                                Version: '1',
                                CreateNewVersion: false,
                                SMSTemplateRequest: {
                                    Body: SMSTemplateResponse.Body,
                                    DefaultSubstitutions: JSON.stringify({
                                        receiptName: user?.fullName?.S,
                                        amount: params?.amount?.toFixed(2).toString(),
                                        currency: params?.currency
                                    }),
                                    tags: {
                                        'receiptName': user?.fullName?.S,
                                        'amount': params?.amount?.toString(),
                                        'currency': params?.currency
                                    }
                                }
                            }).promise();

                            await pinpoint.updateEmailTemplate({
                                TemplateName: 'USER_DOWNLOAD_BLINK',
                                EmailTemplateRequest: {
                                    DefaultSubstitutions: JSON.stringify({
                                        receiptName: user?.fullName?.S,
                                        amount: params?.amount?.toFixed(2).toString(),
                                        currency: params?.currency
                                    }),
                                    HtmlPart: EmailTemplateResponse.HtmlPart,
                                    Subject: EmailTemplateResponse.Subject,
                                    tags: {
                                        'receiptName': user?.fullName?.S,
                                        'amount': params?.amount?.toString(),
                                        'currency': params?.currency
                                    }
                                }
                            }).promise();
                            await pinpoint.sendMessages({
                                ApplicationId: 'cd59bc0a77c7450e89f926cadc2d784b',
                                MessageRequest: {
                                    Addresses: AddressToSend,
                                    MessageConfiguration: {
                                        SMSMessage: {
                                            MessageType: "TRANSACTIONAL"
                                        }
                                    },
                                    TemplateConfiguration: {
                                        SMSTemplate: {
                                            Name: `DOWNLOAD_BLINK_BY_USER_${params?.tx?.shipping?.locale?.toUpperCase() || 'ES'}`,
                                            Version: '1'
                                        },
                                        EmailTemplate: {
                                            Name: 'USER_DOWNLOAD_BLINK',
                                            Version: '1'
                                        }
                                    }
                                }
                            }).promise();
                        }
                    } catch (e) {
                        console.error(e);
                    }

                    await sendNotification(
                        params?.tx?.shipping?.deviceToken,
                        params?.tx?.shipping?.locale === 'es' ?
                            'Han recibido tu blink enviado' :
                            'They\'ve received your sent blink',
                        params?.tx?.shipping?.locale === 'es' ?
                            `${user?.fullName?.S} ha recibido el blink que le enviaste por ${params?.tx?.amount?.toFixed(2)} ${params?.tx?.currency}.` :
                            `${user?.fullName?.S} he has received the blink you sent him by ${params?.tx?.amount?.toFixed(2)} ${params?.tx?.currency}`,
                        {
                            txId: params?.tx?.id,
                            txType: "SEND",
                            txStatus: "DOWNLOAD",
                            userId: params?.tx?.shippingID,
                            read: false
                        }
                    );
                }
                break;
            case "REQUEST":
                if (params?.txStatus === "REJECT") {
                    Transaction.txStatus = { S: "REJECT" };
                    Transaction.isReceipt = { BOOL: false };
                    Transaction.updatedAt = { S: (new Date()).toISOString() };

                    ProcessedItems.RequestItems['MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                        PutRequest: {
                            Item: Transaction
                        }
                    }];
                    ProcessedItems.RequestItems['MBNotification-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                        PutRequest: {
                            Item: {
                                id: { S: uuid.v4() },
                                type: { S: "NOTIFICATION" },
                                createdAt: { S: (new Date()).toISOString() },
                                updatedAt: { S: (new Date()).toISOString() },
                                isRead: { BOOL: false },
                                data: { S: JSON.stringify({
                                        txId: params?.tx?.id,
                                        txType: params?.tx?.txType,
                                        txStatus: params?.tx?.txStatus,
                                        userId: params?.tx?.receiptID,
                                        read: true
                                    }) },
                                title: { S: `${ params?.tx?.receipt?.locale === 'es' ? 'Le han rechazado un blink que solicitaste' : 'They have rejected a blink that you requested'}` },
                                message: { S: `${ params?.tx?.receipt?.contact?.locale === 'es' ? `${user?.fullName?.S} le ha rechazado un blink por ${params?.tx?.amount.toFixed(2)} ${params?.tx?.currency}.` : `${user?.fullName?.S} they have rejected you a blink for the value of ${params?.tx?.amount.toFixed(2)} ${params?.tx?.currency}`}`},
                                userID: { S: params?.tx?.receiptID }
                            }
                        }
                    }];
                    await dynamoClient.batchWriteItem(ProcessedItems).promise();

                    await sendNotification(
                        params?.tx?.receipt?.deviceToken,
                        params?.tx?.receipt?.locale === 'es' ?
                            'Le han rechazado un blink que solicitaste' :
                            'They have rejected a blink that you requested',
                        params?.tx?.receipt?.locale === 'es' ?
                            `${user?.fullName?.S} le ha rechazado un blink por ${params?.tx?.amount.toFixed(2)} ${params?.tx?.currency}.` :
                            `${user?.fullName?.S} they have rejected you a blink for the value of ${params?.tx?.amount.toFixed(2)} ${params?.tx?.currency}`,
                        {
                            txId: params?.tx?.id,
                            txType: "REQUEST",
                            txStatus: "REJECT",
                            userId: params?.tx?.receipt?.id,
                            read: false
                        }
                    );
                    response.body = {
                        txId: params?.tx?.id,
                        txType: "REQUEST",
                        txStatus: "REJECT",
                        userId: params?.tx?.receipt?.id,
                    };
                    try {
                        const {SMSTemplateResponse} = await pinpoint.getSmsTemplate({
                            TemplateName: `SMS_REJECTED_BLINK_REQUEST_${params?.tx?.receipt?.locale?.toUpperCase() || 'ES'}`,
                            Version: '1'
                        }).promise();
                        const {EmailTemplateResponse} = await pinpoint.getEmailTemplate({
                            TemplateName: 'REQUEST_BLINK_REJECTED',
                            Version: '1'
                        }).promise();

                        const AddressToSend = {
                            [params?.tx?.receipt?.phoneNumber]: {
                                ChannelType: "SMS"
                            },
                            [params?.tx?.receipt?.email]: {
                                ChannelType: "EMAIL"
                            }
                        }
                        if (Object.keys(AddressToSend).length > 0) {
                            await pinpoint.updateSmsTemplate({
                                TemplateName: `SMS_REJECTED_BLINK_REQUEST_${params?.tx?.receipt?.locale?.toUpperCase() || 'ES'}`,
                                Version: '1',
                                CreateNewVersion: false,
                                SMSTemplateRequest: {
                                    Body: SMSTemplateResponse.Body,
                                    DefaultSubstitutions: JSON.stringify({
                                        name: user?.fullName?.S,
                                        amount: params?.tx.amount?.toFixed(2).toString(),
                                        currency: params?.tx.currency
                                    }),
                                    tags: {
                                        'name': user?.fullName?.S,
                                        'amount': params?.tx.amount?.toString(),
                                        'currency': params?.tx.currency
                                    }
                                }
                            }).promise();

                            await pinpoint.updateEmailTemplate({
                                TemplateName: 'REQUEST_BLINK_REJECTED',
                                EmailTemplateRequest: {
                                    DefaultSubstitutions: JSON.stringify({
                                        name: user?.fullName?.S,
                                        amount: params?.tx.amount?.toFixed(2).toString(),
                                        currency: params?.tx.currency
                                    }),
                                    HtmlPart: EmailTemplateResponse.HtmlPart,
                                    Subject: EmailTemplateResponse.Subject,
                                    tags: {
                                        'name': user?.fullName?.S,
                                        'amount': params?.tx?.amount?.toString(),
                                        'currency': params?.tx?.currency
                                    }
                                }
                            }).promise();
                            await pinpoint.sendMessages({
                                ApplicationId: 'cd59bc0a77c7450e89f926cadc2d784b',
                                MessageRequest: {
                                    Addresses: AddressToSend,
                                    MessageConfiguration: {
                                        SMSMessage: {
                                            MessageType: "TRANSACTIONAL"
                                        }
                                    },
                                    TemplateConfiguration: {
                                        SMSTemplate: {
                                            Name: `SMS_REJECTED_BLINK_REQUEST_${params?.tx?.receipt?.locale?.toUpperCase() || 'ES'}`,
                                            Version: '1'
                                        },
                                        EmailTemplate: {
                                            Name: 'REQUEST_BLINK_REJECTED',
                                            Version: '1'
                                        }
                                    }
                                }
                            }).promise();
                        }
                    } catch (e) {
                        console.error(e);
                    }
                } else if (params?.txStatus === "CONFIRM") {
                    ProcessedItems.RequestItems['MBCode-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                        PutRequest: {
                            Item: {
                                ...CodeItem,
                                ...{
                                    userID: { S: params?.tx?.shippingID },
                                    isUsed: { BOOL: false },
                                    updatedAt: { S: (new Date()).toISOString() }
                                }
                            }
                        }
                    }];
                    Transaction.txStatus = { S: "CONFIRM" };
                    Transaction.isConfirm = { BOOL: true };
                    Transaction.updatedAt = { S: (new Date()).toISOString() };
                    const message = params?.message || params?.tx?.message || '';
                    Transaction.message = { S: message };

                    ProcessedItems.RequestItems['MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                        PutRequest: {
                            Item: Transaction
                        }
                    }];
                    ProcessedItems.RequestItems['MBTransactionPay-oqkpjuho2ngvbonruy7shv26zu-pre'] = [];
                    params?.payInfo?.forEach(payId => {
                        ProcessedItems.RequestItems['MBTransactionPay-oqkpjuho2ngvbonruy7shv26zu-pre'].push({
                            PutRequest: {
                                Item: {
                                    id: {S: uuid.v4()},
                                    userID: {S: params?.userId},
                                    type: {S: 'type'},
                                    createdAt: {S: (new Date()).toISOString()},
                                    payID: {S: payId},
                                    txID: {S: params?.tx?.id}
                                }
                            }
                        });
                    });

                    if (params?.blinkUserId) {
                        const {Item: BlinkUser} = await dynamoClient.getItem({
                            TableName: 'MBBlinkUser-oqkpjuho2ngvbonruy7shv26zu-pre',
                            Key: {
                                'id': {S: params?.blinkUserId}
                            },
                        }).promise();
                        const blinksAvailable = parseInt(BlinkUser?.blinkAvailable?.N);
                        if (blinksAvailable <= 0) {
                            throw Error('You don\'t have blinks availabilities');
                        }
                        const newBlinkUserAmount = blinksAvailable - 1;
                        BlinkUser.blinkAvailable = {N: newBlinkUserAmount.toString()};
                        BlinkUser.updatedAt = {S: (new Date()).toISOString()};
                        ProcessedItems.RequestItems['MBBlinkUser-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                            PutRequest: {
                                Item: BlinkUser
                            }
                        }];
                        const {Items, Count} = await dynamoClient.scan({
                            FilterExpression: 'userID = :userID AND isActive = :isActive AND currency = :currency',
                            ExpressionAttributeValues: {
                                ':userID': {S: params?.userId},
                                ':isActive': {BOOL: true},
                                ':currency': {S: params?.currency}
                            },
                            TableName: 'MBFinancialData-oqkpjuho2ngvbonruy7shv26zu-pre'
                        }).promise();
                        if (Count !== 0) {
                            const financialData = Items[0];
                            const newAmount = parseInt(financialData?.blinks?.N) - 1;
                            financialData.blinks = {N: newAmount.toString()};
                            financialData.updatedAt = {S: (new Date()).toISOString()};
                            ProcessedItems
                                .RequestItems['MBFinancialData-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                                PutRequest: {
                                    Item: financialData
                                }
                            }];
                        }
                    } else {
                        ProcessedItems.RequestItems['MBBlinkUser-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                            PutRequest: {
                                Item: {
                                    id: {S: uuid.v4()},
                                    blinkAcquired: {N: '1'},
                                    isPromotional: {BOOL: false},
                                    blinkPrice: {N: params?.blinksSettings?.blinkCost},
                                    currency: {S: `${params?.blinksSettings?.currency || params?.currency}`},
                                    blinkSettingID: {S: params?.blinksSettings?.id},
                                    userID: {S: params?.userId},
                                    updatedAt: {S: (new Date()).toISOString()},
                                    createdAt: {S: (new Date()).toISOString()},
                                    blinkAvailable: {N: '0'}
                                }
                            }
                        }];
                    }

                    const {Items, Count} = await dynamoClient.scan({
                        FilterExpression: 'invitingID = :invitingID AND invitedID = :invitedID',
                        ExpressionAttributeValues: {
                            ':invitingID': {S: params?.userId},
                            ':invitedID': {S: params?.contact?.id}
                        },
                        TableName: 'MBContact-oqkpjuho2ngvbonruy7shv26zu-pre'
                    }).promise();
                    if (Count !== 0) {
                        const contact = Items[0];
                        const newShipments = parseInt(contact?.myShipments?.N) + 1;
                        contact.myShipments = {N: `${newShipments}`};
                        contact.updatedAt = {S: (new Date()).toISOString()};
                        ProcessedItems.RequestItems['MBContact-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                            PutRequest: {
                                Item: contact
                            }
                        }];
                    } else {
                        ProcessedItems.RequestItems['MBContact-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                            PutRequest: {
                                Item: {
                                    id: {S: uuid.v4()},
                                    invitingID: {S: params?.userId},
                                    invitedID: {S: params?.contact?.id},
                                    isFavorite: {BOOL: false},
                                    myShipments: {N: '1'},
                                    myReceipts: {N: '0'},
                                    createdAt: {S: (new Date()).toISOString()},
                                    updatedAt: {S: (new Date()).toISOString()}
                                }
                            }
                        }];
                    }
                    ProcessedItems.RequestItems['MBNotification-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                        PutRequest: {
                            Item: {
                                id: { S: uuid.v4() },
                                type: { S: "NOTIFICATION" },
                                createdAt: { S: (new Date()).toISOString() },
                                updatedAt: { S: (new Date()).toISOString() },
                                isRead: { BOOL: false },
                                data: { S: JSON.stringify({
                                        txId: params?.tx?.id,
                                        txType: params?.tx?.txType,
                                        txStatus: params?.tx?.txStatus,
                                        userId: params?.contact?.id,
                                        read: true
                                    }) },
                                title: { S: `${ params?.contact?.locale === 'es' ? 'Le han confirmado un blink que solicitaste' : 'They have confirmed a blink you requested'}` },
                                message: { S: `${ params?.contact?.locale === 'es' ? `${user?.fullName?.S} le ha confirmado un blink por ${params?.tx?.amount.toFixed(2)} ${params?.tx?.currency}.` : `${user?.fullName?.S} they have confirm you a blink for the value of ${params?.tx?.amount.toFixed(2)} ${params?.tx?.currency}`}`},
                                userID: { S: params?.contact?.id }
                            }
                        }
                    }];
                    await dynamoClient.batchWriteItem(ProcessedItems).promise();

                    try {
                        const {SMSTemplateResponse} = await pinpoint.getSmsTemplate({
                            TemplateName: `SEND_REQUEST_BLINK_${params?.contact?.locale?.toUpperCase() || 'ES'}`,
                            Version: '1'
                        }).promise();
                        await pinpoint.updateSmsTemplate({
                            TemplateName: `SEND_REQUEST_BLINK_${params?.contact?.locale?.toUpperCase() || 'ES'}`,
                            Version: '1',
                            CreateNewVersion: false,
                            SMSTemplateRequest: {
                                Body: SMSTemplateResponse.Body,
                                DefaultSubstitutions: JSON.stringify({
                                    senderName: user?.fullName?.S,
                                    amount: params?.tx?.amount?.toFixed(2).toString(),
                                    currency: params?.tx?.currency,
                                    code: params?.code
                                }),
                                tags: {
                                    'senderName': user?.fullName?.S,
                                    'amount': params?.tx?.amount?.toString(),
                                    'currency': params?.tx?.currency,
                                    'code': params?.code
                                }
                            }
                        }).promise();
                        const {EmailTemplateResponse} = await pinpoint.getEmailTemplate({
                            TemplateName: 'SEND_REQUEST_BLINK_TO_CONTACT',
                            Version: '1'
                        }).promise();

                        await pinpoint.updateEmailTemplate({
                            TemplateName: 'SEND_REQUEST_BLINK_TO_CONTACT',
                            EmailTemplateRequest: {
                                DefaultSubstitutions: JSON.stringify({
                                    senderName: user?.fullName?.S,
                                    amount: params?.tx?.amount?.toFixed(2).toString(),
                                    currency: params?.tx?.currency,
                                    code: params?.code
                                }),
                                HtmlPart: EmailTemplateResponse.HtmlPart,
                                Subject: EmailTemplateResponse.Subject,
                                tags: {
                                    'senderName': user?.fullName?.S,
                                    'amount': params?.tx?.amount?.toString(),
                                    'currency': params?.tx?.currency,
                                    'code': params?.code
                                }
                            }
                        }).promise();

                        await pinpoint.sendMessages({
                            ApplicationId: 'cd59bc0a77c7450e89f926cadc2d784b',
                            MessageRequest: {
                                Addresses: {
                                    [params?.contact?.phoneNumber]: {
                                        ChannelType: "SMS"
                                    },
                                    [params?.contact?.email]: {
                                        ChannelType: "EMAIL"
                                    }
                                },
                                MessageConfiguration: {
                                    SMSMessage: {
                                        MessageType: "TRANSACTIONAL"
                                    }
                                },
                                TemplateConfiguration: {
                                    SMSTemplate: {
                                        Name: `SEND_REQUEST_BLINK_${params?.contact?.locale?.toUpperCase() || 'ES'}`,
                                        Version: '1'
                                    },
                                    EmailTemplate: {
                                        Name: 'SEND_REQUEST_BLINK_TO_CONTACT',
                                        Version: '1'
                                    }
                                }
                            }
                        }).promise();
                    } catch (err) {
                        console.error(err);
                    }

                    await sendNotification(
                        params?.contact?.deviceToken,
                        params?.contact?.locale === 'es' ?
                            'Le han confirmado un blink que solicitaste' :
                            'They have confirmed a blink you requested',
                        params?.contact?.locale === 'es' ? `${user?.fullName?.S} le ha confirmado un blink por ${params?.amount.toFixed(2)} ${params?.currency}.` :
                            `${user?.fullName?.S} they have confirm you a blink for the value of ${params?.amount.toFixed(2)} ${params?.currency}`,
                        {
                            txId: params?.tx?.id,
                            txType: "REQUEST",
                            txStatus: "CONFIRM",
                            userId: params?.contact?.id,
                            read: true
                        }
                    );
                } else if (params?.tx?.txStatus === "CONFIRM") {
                    if (!params?.tx?.isConfirm) {
                        throw Error('The blink cannot be processed.');
                    } else if (params?.tx?.isReceipt) {
                        throw Error('The blink has already been processed before.');
                    } else if ( Transaction?.receiptID?.S !== params?.userId) {
                        throw Error('You do not have permissions to process this blink.');
                    }
                    // TO-DO Realizar conversion de moneda para cuando proceda.
                    Transaction.isReceipt = { BOOL: true };
                    Transaction.txStatus = { S: "DOWNLOAD" };
                    Transaction.updatedAt = { S: (new Date()).toISOString() };
                    ProcessedItems.RequestItems['MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                        PutRequest: {
                            Item: Transaction
                        }
                    }];
                    if (params?.paymentMethod === "AMOUNTMB") {
                        const {Items, Count} = await dynamoClient.scan({
                            FilterExpression: 'userID = :userID AND isActive = :isActive AND currency = :currency',
                            ExpressionAttributeValues: {
                                ':userID': {S: params?.userId},
                                ':isActive': {BOOL: true},
                                ':currency': {S: user?.currency?.S}
                            },
                            TableName: 'MBFinancialData-oqkpjuho2ngvbonruy7shv26zu-pre'
                        }).promise();
                        if (Count !== 0) {
                            const financialData = Items[0];
                            const newAmount = Number(financialData?.amount?.N) + Number(Transaction?.amountDeposit?.N);
                            financialData.amount = {N: newAmount.toString()};
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
                                        id: { S: uuid.v4() },
                                        type: {S: "MBFinancialData"},
                                        amount: { N: Transaction.amountDeposit.N },
                                        currency: { S: Transaction.currencyDeposit.S },
                                        blinks: { N: '0' },
                                        isActive: { BOOL: true },
                                        userID: { S: params?.userId },
                                        createdAt: { S: (new Date()).toISOString() },
                                        updatedAt: { S: (new Date()).toISOString() }
                                    }
                                }
                            }];
                        }

                        ProcessedItems.RequestItems['MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                            PutRequest: {
                                Item: {
                                    id: { S: uuid.v4() },
                                    type: { S: "TX" },
                                    txID: { S: params?.tx?.id },
                                    createdAt: { S: (new Date()).toISOString() },
                                    updatedAt: { S: (new Date()).toISOString() },
                                    processAt: { S: (new Date()).toISOString() },
                                    paymentMethod: { S: params?.paymentMethod },
                                    paymentMethodId: { S: params?.paymentMethodId },
                                    batchCatch: { S: (new Date()).toISOString() },
                                    userID: { S: params?.userId },
                                    amount: { N: Transaction.amountDeposit?.N },
                                    currency: { S: Transaction.currencyDeposit.S },
                                    stateCode: { S: params?.alpha2Code }
                                }
                            }
                        }];
                    } else if (params?.paymentMethod === "ACCOUNT") {
                        const { Item: PaymentMethod } = await dynamoClient.getItem({
                            TableName: "MBMyPaymentMethod-oqkpjuho2ngvbonruy7shv26zu-pre",
                            Key: {
                                id: { S: params?.paymentMethodId }
                            }
                        }).promise();

                        if (!PaymentMethod) {
                            throw Error('The account provided for the deposit does not exist.');
                        }

                        const { Item: CountryPaymentMethod } = await dynamoClient.getItem({
                            TableName: 'MBPaymentMethodCountry-oqkpjuho2ngvbonruy7shv26zu-pre',
                            Key: {
                                id: { S: PaymentMethod.paymentMethodCountryID.S }
                            }
                        }).promise();

                        if (!CountryPaymentMethod) {
                            throw Error('The account provided for the deposit does not exist.');
                        }
                        const setting = CountryPaymentMethod.settings.M.settings.M;
                        const {
                            noConnected,
                            environment,
                            clientSecret,
                            clientId,
                            apiVersion,
                            apiPlatform
                        } = setting;
                        if (!noConnected?.BOOL && apiPlatform?.S === "PLAID") {
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
                                    account_id,
                                    accessToken
                                } = PaymentMethod.settings?.M;
                                const {accounts: plaidAccounts, status_code} = await plaidClient.getAccounts(accessToken?.S, {
                                    'account_ids': [account_id?.S]
                                });

                                if (status_code === 200 && plaidAccounts.length > 0) {
                                    const userAccount = plaidAccounts[0];
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
                                    reverseParams = modernTreasury?.settings?.M;
                                    if (!organizationID?.S || !key.S || !endpoint?.S) {
                                        throw Error('Your payment cannot be processed at this time. Please try another time.');
                                    }
                                    headers = {
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
                                        "amount": (parseFloat(Transaction?.amountDeposit?.N) * 100),
                                        "description": `MoneyBlinks Wallet Credit To Account User by: Blink Download`,
                                        "direction": "credit",
                                        "priority": "high",
                                        "currency": Transaction.currencyDeposit?.S,
                                        "receiving_account_id": modernTreasuryCounterpartiesAccount?.id,
                                        "originating_account_id": internalAccount.id
                                    }, {
                                        headers
                                    });
                                    if (statusOrder >= 400) {
                                        throw Error(statusTextOrder);
                                    }
                                    reversePaymentOrderMT = paymentOrder;
                                    ProcessedItems.RequestItems['MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                                        PutRequest: {
                                            Item: {
                                                id: { S: uuid.v4() },
                                                type: { S: "TX" },
                                                txID: { S: params?.tx?.id },
                                                createdAt: { S: (new Date()).toISOString() },
                                                updatedAt: { S: (new Date()).toISOString() },
                                                processAt: { S: (new Date()).toISOString() },
                                                paymentMethod: { S: params?.paymentMethod },
                                                paymentMethodId: { S: params?.paymentMethodId },
                                                batchCatch: { S: (new Date()).toISOString() },
                                                userID: { S: params?.userId },
                                                amount: { N: `${params?.amountToDeposit || Transaction?.amountDeposit?.N}` },
                                                currency: { S: `${Transaction.currencyDeposit?.S || params?.tx?.currency}` },
                                                stateCode: { S: params?.alpha2Code }
                                            }
                                        }
                                    }];
                                }
                            }
                        } else if (noConnected.BOOL) {
                            ProcessedItems.RequestItems['MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                                PutRequest: {
                                    Item: {
                                        id: { S: uuid.v4() },
                                        type: { S: "TX" },
                                        txID: { S: params?.tx?.id },
                                        createdAt: { S: (new Date()).toISOString() },
                                        updatedAt: { S: (new Date()).toISOString() },
                                        paymentMethod: { S: params?.paymentMethod },
                                        paymentMethodId: { S: params?.paymentMethodId },
                                        userID: { S: params?.userId },
                                        amount: { N: `${params?.amountToDeposit || params?.tx?.amountDeposit}` },
                                        currency: { S: `${Transaction.currencyDeposit?.S || params?.tx?.currency}` },
                                        stateCode: { S: params?.alpha2Code }
                                    }
                                }
                            }];
                        }
                    } else if (params?.paymentMethod === "THIRD_PARTIES") {
                        ProcessedItems.RequestItems['MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                            PutRequest: {
                                Item: {
                                    id: { S: uuid.v4() },
                                    type: { S: "TX" },
                                    txID: { S: params?.tx?.id },
                                    createdAt: { S: (new Date()).toISOString() },
                                    updatedAt: { S: (new Date()).toISOString() },
                                    paymentMethod: { S: params?.paymentMethod },
                                    paymentMethodId: { S: params?.paymentMethodId },
                                    userID: { S: params?.userId },
                                    amount: { N: params?.tx?.amountToDeposit },
                                    currency: { S: (Transaction.currencyDeposit?.S || params?.tx?.currency) },
                                    stateCode: { S: params?.alpha2Code }
                                }
                            }
                        }];
                    }
                    ProcessedItems.RequestItems['MBNotification-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                        PutRequest: {
                            Item: {
                                id: { S: uuid.v4() },
                                type: { S: "NOTIFICATION" },
                                createdAt: { S: (new Date()).toISOString() },
                                updatedAt: { S: (new Date()).toISOString() },
                                isRead: { BOOL: false },
                                data: { S: JSON.stringify({
                                        txId: params?.tx?.id,
                                        txType: params?.tx?.txType,
                                        txStatus: params?.tx?.txStatus,
                                        userId: params?.tx?.shippingID,
                                        read: false
                                    }) },
                                title: { S: `${ params?.tx?.shipping?.locale === 'es' ? 'El usuario ha descargado el blink enviado' : 'User has downloaded sent blink'}` },
                                message: { S: `${ params?.tx?.shipping?.locale === 'es' ? `${user?.fullName?.S} ha descargado el blink enviado por ${params?.tx?.amount.toFixed(2)} ${params?.tx?.currency}.` : `${user?.fullName?.S} has downloaded the blink sent by ${params?.tx?.amount.toFixed(2)} ${params?.tx?.currency}`}`},
                                userID: { S: params?.tx?.shippingID }
                            }
                        }
                    }];
                    await dynamoClient.batchWriteItem(ProcessedItems).promise();


                    try {
                        const {SMSTemplateResponse} = await pinpoint.getSmsTemplate({
                            TemplateName: `DOWNLOAD_BLINK_BY_USER_${params?.tx?.shipping?.locale?.toUpperCase() || 'ES'}`,
                            Version: '1'
                        }).promise();
                        const {EmailTemplateResponse} = await pinpoint.getEmailTemplate({
                            TemplateName: 'USER_DOWNLOAD_BLINK',
                            Version: '1'
                        }).promise();

                        const AddressToSend = {
                            [params?.tx?.shipping?.phoneNumber]: {
                                ChannelType: "SMS"
                            },
                            [params?.tx?.shipping?.email]: {
                                ChannelType: "EMAIL"
                            }
                        }
                        if (Object.keys(AddressToSend).length > 0) {
                            await pinpoint.updateSmsTemplate({
                                TemplateName: `DOWNLOAD_BLINK_BY_USER_${params?.tx?.shipping?.locale?.toUpperCase() || 'ES'}`,
                                Version: '1',
                                CreateNewVersion: false,
                                SMSTemplateRequest: {
                                    Body: SMSTemplateResponse.Body,
                                    DefaultSubstitutions: JSON.stringify({
                                        receiptName: user?.fullName?.S,
                                        amount: params?.amount?.toFixed(2).toString(),
                                        currency: params?.currency
                                    }),
                                    tags: {
                                        'receiptName': user?.fullName?.S,
                                        'amount': params?.amount?.toString(),
                                        'currency': params?.currency
                                    }
                                }
                            }).promise();

                            await pinpoint.updateEmailTemplate({
                                TemplateName: 'USER_DOWNLOAD_BLINK',
                                EmailTemplateRequest: {
                                    DefaultSubstitutions: JSON.stringify({
                                        receiptName: user?.fullName?.S,
                                        amount: params?.amount?.toFixed(2).toString(),
                                        currency: params?.currency
                                    }),
                                    HtmlPart: EmailTemplateResponse.HtmlPart,
                                    Subject: EmailTemplateResponse.Subject,
                                    tags: {
                                        'receiptName': user?.fullName?.S,
                                        'amount': params?.amount?.toString(),
                                        'currency': params?.currency
                                    }
                                }
                            }).promise();
                            await pinpoint.sendMessages({
                                ApplicationId: 'cd59bc0a77c7450e89f926cadc2d784b',
                                MessageRequest: {
                                    Addresses: AddressToSend,
                                    MessageConfiguration: {
                                        SMSMessage: {
                                            MessageType: "TRANSACTIONAL"
                                        }
                                    },
                                    TemplateConfiguration: {
                                        SMSTemplate: {
                                            Name: `DOWNLOAD_BLINK_BY_USER_${params?.tx?.shipping?.locale?.toUpperCase() || 'ES'}`,
                                            Version: '1'
                                        },
                                        EmailTemplate: {
                                            Name: 'USER_DOWNLOAD_BLINK',
                                            Version: '1'
                                        }
                                    }
                                }
                            }).promise();
                        }
                    } catch (e) {
                        console.error(e);
                    }

                    await sendNotification(
                        params?.tx?.shipping?.deviceToken,
                        params?.tx?.shipping?.locale === 'es' ?
                            'El usuario ha descargado el blink enviado' :
                            'User has downloaded sent blink',
                        params?.tx?.shipping?.locale === 'es' ?
                            `${user?.fullName?.S} ha descargado el blink enviado por ${params?.tx?.amount.toFixed(2)} ${params?.tx?.currency}.` :
                            `${user?.fullName?.S} has downloaded the blink sent by ${params?.tx?.amount.toFixed(2)} ${params?.tx?.currency}`,
                        {
                            txId: params?.tx?.id,
                            read: false
                        }
                    );
                }
                break;
            default:
                break;
        }
        return response;
    } catch (e) {
        // if (reversePaymentOrderMT) {
        //     await axios.post(`${reverseParams?.endpoint?.S}/payment_orders/${reversePaymentOrderMT.id}/reversal`, {
        //         "reason": "incorrect_receiving_account"
        //     }, {
        //         headers
        //     });
        // }
        throw e;
    }

    async function sendNotification(
        deviceToken,
        title,
        body,
        data,
        badge = null,
        accessToken = null
    ) {
        try {
            let bodyData = {
                title,
                body,
                data,
                to: deviceToken,
            };
            if (badge) {
                bodyData['badge'] = badge;
            }

            return await axios.post('https://exp.host/--/api/v2/push/send', bodyData, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken ? accessToken : 'u2uzgs1E-js8B4N7FjEg3FbeY7mQMyXZIoQViufs'}`
                }
            });
        } catch (e) {
            console.error(e);
        }
    }
};
