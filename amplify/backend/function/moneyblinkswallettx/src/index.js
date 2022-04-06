/* Amplify Params - DO NOT EDIT
	API_MONEYBLINKSWALLET_GRAPHQLAPIENDPOINTOUTPUT
	API_MONEYBLINKSWALLET_GRAPHQLAPIIDOUTPUT
	API_MONEYBLINKSWALLET_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
const AWS = require('aws-sdk');
const uuid = require('uuid');
const axios = require('axios');

exports.handler = async (event) => {
    AWS.config.update({region: 'us-east-1'});
    const dynamoClient = new AWS.DynamoDB();
    const pinpoint = new AWS.Pinpoint();

    let response = {
        statusCode: 200,
        body: event,
    };
    const params = event?.arguments?.values || {};
    try {
        let txId = params?.txId;
        if (!txId) {
            txId = uuid.v4();
        }
        if (!params?.txType || !params?.txStatus || !params?.userId) {
            throw Error('Insufficient Params');
        }
        const {Item: user} = await dynamoClient.getItem({
            TableName: 'MBUser-oqkpjuho2ngvbonruy7shv26zu-pre',
            Key: {
                'id': {S: params?.userId}
            }
        }).promise();
        let ProcessedItems = {
            RequestItems: {}
        };
        const kmsCode = await new AWS.KMS().generateRandom({
            NumberOfBytes: 6
        }).promise();
        let code = params?.code;
        let codeId = params?.codeId;
        if (!codeId) {
            codeId = uuid.v4();
        }
        if (!code) {
            code = Buffer.from(kmsCode.Plaintext, 'binary').toString('base64').toUpperCase();
        }
        switch (params?.txType) {
            case 'SEND':
                const isUsed = params?.txStatus !== 'SHARED';
                ProcessedItems.RequestItems['MBCode-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                    PutRequest: {
                        Item: {
                            id: {S: codeId},
                            userID: {S: params?.userId},
                            code: {S: code},
                            codeType: {S: 'TX'},
                            isUsed: {BOOL: false},
                            isUserUsed: { BOOL: isUsed },
                            createdAt: {S: (new Date()).toISOString()},
                            updatedAt: {S: (new Date()).toISOString()}
                        }
                    }
                }];
                const Transaction = {
                    id: {S: txId},
                    userID: {S: params?.userId},
                    type: {S: 'TRANSACTION'},
                    createdAt: {S: (new Date()).toISOString()},
                    updatedAt: {S: (new Date()).toISOString()},
                    amount: {N: params?.total?.toString()},
                    currency: {S: params?.currency},
                    taxes: {N: params?.subTotalTax?.toString()},
                    charges: {N: params?.subTotalCommission?.toString()},
                    amountDeposit: {N: params?.amount?.toString()},
                    currencyDeposit: {S: params?.isMBContact ? params?.contact?.currency : params?.currency},
                    message: {S: params?.message},
                    txType: {S: params?.txType},
                    txStatus: {S: params?.txStatus},
                    shippingID: {S: params?.userId},
                    codeID: {S: codeId},
                    txValues: {S: JSON.stringify(params)},
                    isConfirm: {BOOL: false}
                };
                ProcessedItems.RequestItems['MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                    PutRequest: {
                        Item: Transaction
                    }
                }];

                switch (params?.txStatus) {
                    case 'SEND':
                        ProcessedItems.RequestItems['MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                            PutRequest: {
                                Item: {
                                    ...Transaction,
                                    ...{
                                        receiptID: {S: params?.contact?.id},
                                        isConfirm: {BOOL: true}
                                    }
                                }
                            }
                        }]
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
                                        txID: {S: txId}
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
                                        blinkPrice: {N: `${params?.blinksSettings?.blinkCost}`},
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
                            const newShipments = Number(contact?.myShipments?.N) + 1;
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
                                            txId,
                                            txType: "SEND",
                                            txStatus: "SEND",
                                            userId: params?.contact?.id,
                                            read: true
                                        }) },
                                    title: { S: `${ params?.contact?.locale === 'es' ? 'Le han enviado un blink' : 'They have sent you a blink'}` },
                                    message: { S: `${ params?.contact?.locale === 'es' ? `${user?.fullName?.S} le ha enviado un blink por ${params?.amount.toFixed(2)} ${params?.currency}.` : `${user?.fullName?.S} they have sent you a blink for the value of ${params?.amount.toFixed(2)} ${params?.currency}`}`},
                                    userID: { S: params?.contact?.id }
                                }
                            }
                        }]
                        await dynamoClient.batchWriteItem(ProcessedItems).promise();

                        try {
                            const {SMSTemplateResponse} = await pinpoint.getSmsTemplate({
                                TemplateName: `SEND_BLINK_${params?.contact?.locale?.toUpperCase() || 'ES'}`,
                                Version: '1'
                            }).promise();
                            await pinpoint.updateSmsTemplate({
                                TemplateName: `SEND_BLINK_${params?.contact?.locale?.toUpperCase() || 'ES'}`,
                                Version: '1',
                                CreateNewVersion: false,
                                SMSTemplateRequest: {
                                    Body: SMSTemplateResponse.Body,
                                    DefaultSubstitutions: JSON.stringify({
                                        senderName: user?.fullName?.S,
                                        amount: params?.amount?.toFixed(2).toString(),
                                        currency: params?.currency,
                                        code: code
                                    }),
                                    tags: {
                                        'senderName': user?.fullName?.S,
                                        'amount': params?.amount?.toString(),
                                        'currency': params?.currency,
                                        'code': code
                                    }
                                }
                            }).promise();
                            const {EmailTemplateResponse} = await pinpoint.getEmailTemplate({
                                TemplateName: 'SEND_BLINK_TO_CONTACT',
                                Version: '1'
                            }).promise();

                            await pinpoint.updateEmailTemplate({
                                TemplateName: 'SEND_BLINK_TO_CONTACT',
                                EmailTemplateRequest: {
                                    DefaultSubstitutions: JSON.stringify({
                                        senderName: user?.fullName?.S,
                                        amount: params?.amount?.toFixed(2).toString(),
                                        currency: params?.currency,
                                        code: code
                                    }),
                                    HtmlPart: EmailTemplateResponse.HtmlPart,
                                    Subject: EmailTemplateResponse.Subject,
                                    tags: {
                                        'senderName': user?.fullName?.S,
                                        'amount': params?.amount?.toString(),
                                        'currency': params?.currency,
                                        'code': code
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
                                            Name: `SEND_BLINK_${params?.contact?.locale?.toUpperCase() || 'ES'}`,
                                            Version: '1'
                                        },
                                        EmailTemplate: {
                                            Name: 'SEND_BLINK_TO_CONTACT',
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
                                'Le han enviado un blink' :
                                'They have sent you a blink',
                            params?.contact?.locale === 'es' ?
                                `${user?.fullName?.S} le ha enviado un blink por ${params?.amount.toFixed(2)} ${params?.currency}.` :
                                `${user?.fullName?.S} they have sent you a blink for the value of ${params?.amount.toFixed(2)} ${params?.currency}`,
                            {
                                txId,
                                txType: "SEND",
                                txStatus: "SEND",
                                userId: params?.contact?.id,
                                read: true
                            }
                        );


                        response.body = {
                            txId,
                            txType: params?.txType,
                            txStatus: params?.txStatus,
                            code
                        };

                        break;
                    case 'SHARED':
                        await dynamoClient.batchWriteItem(ProcessedItems).promise();
                        response.body = {
                            txId,
                            txType: params?.txType,
                            txStatus: params?.txStatus,
                            code,
                            amount: params?.amount
                        };
                        break;
                    case 'STANDBY':
                        const {Item: transaction} = await dynamoClient.getItem({
                            TableName: 'MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre',
                            Key: {
                                'id': {S: txId}
                            }
                        }).promise();
                        ProcessedItems = {
                            RequestItems: {}
                        };
                        ProcessedItems.RequestItems['MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                            PutRequest: {
                                Item: {
                                    ...transaction,
                                    ...{
                                        isConfirm: {BOOL: true},
                                        txStatus: { S: 'SEND' }
                                    }
                                }
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
                                        txID: {S: txId}
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
                                        blinkPrice: {N: `${params?.blinksSettings?.blinkCost}`},
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
                        ProcessedItems.RequestItems['MBNotification-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                            PutRequest: {
                                Item: {
                                    id: { S: uuid.v4() },
                                    type: { S: "NOTIFICATION" },
                                    createdAt: { S: (new Date()).toISOString() },
                                    updatedAt: { S: (new Date()).toISOString() },
                                    isRead: { BOOL: false },
                                    data: { S: JSON.stringify({
                                            txId,
                                            txType: "SEND",
                                            txStatus: "SEND",
                                            userId: params?.contact?.id,
                                            read: true
                                        }) },
                                    title: { S: `${ params?.contact?.locale === 'es' ? 'Le han enviado un blink' : 'They have sent you a blink'}` },
                                    message: { S: `${ params?.contact?.locale === 'es' ? `${user?.fullName?.S} le ha enviado un blink por ${Number(transaction?.amount.N).toFixed(2)} ${transaction?.currency.S}.` : `${user?.fullName?.S} they have sent you a blink for the value of ${Number(transaction?.amount.N).toFixed(2)} ${transaction?.currency?.S}`}`},
                                    userID: { S: params?.contact?.id }
                                }
                            }
                        }]
                        await dynamoClient.batchWriteItem(ProcessedItems).promise();

                        try {
                            const {SMSTemplateResponse} = await pinpoint.getSmsTemplate({
                                TemplateName: `SEND_BLINK_${params?.contact?.locale?.toUpperCase() || 'ES'}`,
                                Version: '1'
                            }).promise();
                            await pinpoint.updateSmsTemplate({
                                TemplateName: `SEND_BLINK_${params?.contact?.locale?.toUpperCase() || 'ES'}`,
                                Version: '1',
                                CreateNewVersion: false,
                                SMSTemplateRequest: {
                                    Body: SMSTemplateResponse.Body,
                                    DefaultSubstitutions: JSON.stringify({
                                        senderName: user?.fullName?.S,
                                        amount: params?.amount?.toFixed(2).toString(),
                                        currency: params?.currency,
                                        code: code
                                    }),
                                    tags: {
                                        'senderName': user?.fullName?.S,
                                        'amount': params?.amount?.toString(),
                                        'currency': params?.currency,
                                        'code': code
                                    }
                                }
                            }).promise();
                            const {EmailTemplateResponse} = await pinpoint.getEmailTemplate({
                                TemplateName: 'SEND_BLINK_TO_CONTACT',
                                Version: '1'
                            }).promise();

                            await pinpoint.updateEmailTemplate({
                                TemplateName: 'SEND_BLINK_TO_CONTACT',
                                EmailTemplateRequest: {
                                    DefaultSubstitutions: JSON.stringify({
                                        senderName: user?.fullName?.S,
                                        amount: params?.amount?.toFixed(2).toString(),
                                        currency: params?.currency,
                                        code: code
                                    }),
                                    HtmlPart: EmailTemplateResponse.HtmlPart,
                                    Subject: EmailTemplateResponse.Subject,
                                    tags: {
                                        'senderName': user?.fullName?.S,
                                        'amount': params?.amount?.toString(),
                                        'currency': params?.currency,
                                        'code': code
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
                                            Name: `SEND_BLINK_${params?.contact?.locale?.toUpperCase() || 'ES'}`,
                                            Version: '1'
                                        },
                                        EmailTemplate: {
                                            Name: 'SEND_BLINK_TO_CONTACT',
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
                                'Le han enviado un blink' :
                                'They have sent you a blink',
                            params?.contact?.locale === 'es' ?
                                `${user?.fullName?.S} le ha enviado un blink por ${params?.amount.toFixed(2)} ${params?.currency}.` :
                                `${user?.fullName?.S} they have sent you a blink for the value of ${params?.amount.toFixed(2)} ${params?.currency}`,
                            {
                                txId,
                                txType: "SEND",
                                txStatus: "SEND",
                                userId: params?.contact?.id,
                                read: true
                            }
                        );


                        response.body = {
                            txId,
                            txType: params?.txType,
                            txStatus: params?.txStatus,
                            code
                        };
                        break;
                    default:
                        break;
                }

                break;
            case 'REQUEST':
                ProcessedItems.RequestItems['MBCode-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                    PutRequest: {
                        Item: {
                            id: {S: codeId},
                            userID: {S: params?.userId},
                            code: {S: code},
                            codeType: {S: 'TX'},
                            isUsed: {BOOL: false},
                            isUserUsed: { BOOL: true },
                            createdAt: {S: (new Date()).toISOString()},
                            updatedAt: {S: (new Date()).toISOString()}
                        }
                    }
                }];
                ProcessedItems.RequestItems['MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                    PutRequest: {
                        Item: {
                            id: {S: txId},
                            userID: {S: params?.userId},
                            type: {S: 'TRANSACTION'},
                            createdAt: {S: (new Date()).toISOString()},
                            updatedAt: {S: (new Date()).toISOString()},
                            amount: {N: params?.total?.toString()},
                            currency: {S: params?.currency},
                            taxes: {N: '0'},
                            charges: {N: '0'},
                            amountDeposit: {N: params?.amount?.toString()},
                            currencyDeposit: {S: params?.currency},
                            requestMessage: {S: params?.requestMessage},
                            txType: {S: params?.txType},
                            txStatus: {S: params?.txStatus},
                            shippingID: {S: params?.contact?.id},
                            receiptID: { S: params?.userId },
                            codeID: {S: codeId},
                            txValues: {S: JSON.stringify(params)},
                            isConfirm: {BOOL: false}
                        }
                    }
                }];
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
                    const newReceipts = Number(contact?.myReceipts?.N) + 1;
                    contact.myReceipts = {N: `${newReceipts}`};
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
                                myShipments: {N: '0'},
                                myReceipts: {N: '1'},
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
                                    txId,
                                    txType: "REQUEST",
                                    txStatus: "REQUEST",
                                    userId: params?.contact?.id,
                                    read: true
                                }) },
                            title: { S: `${ params?.contact?.locale === 'es' ? 'Le han enviado un pedido de blink' : 'You have been sent a blink order'}` },
                            message: { S: `${ params?.contact?.locale === 'es' ? `${user?.fullName?.S} le ha pedido un blink por ${params?.amount.toFixed(2)} ${params?.currency}.` : `${user?.fullName?.S} has asked you a blink for ${params?.amount.toFixed(2)} ${params?.currency}`}`},
                            userID: { S: params?.contact?.id }
                        }
                    }
                }]
                response.body = {
                    txId,
                    txType: params?.txType,
                    txStatus: params?.txStatus,
                    code,
                    amount: params?.amount
                }
                await dynamoClient.batchWriteItem(ProcessedItems).promise();
                try {
                    const {SMSTemplateResponse} = await pinpoint.getSmsTemplate({
                        TemplateName: `REQUEST_BLINK_${params?.contact?.locale?.toUpperCase() || 'ES'}`,
                        Version: '1'
                    }).promise();
                    await pinpoint.updateSmsTemplate({
                        TemplateName: `REQUEST_BLINK_${params?.contact?.locale?.toUpperCase() || 'ES'}`,
                        Version: '1',
                        CreateNewVersion: false,
                        SMSTemplateRequest: {
                            Body: SMSTemplateResponse.Body,
                            DefaultSubstitutions: JSON.stringify({
                                senderName: user?.fullName?.S,
                                amount: params?.amount?.toFixed(2).toString(),
                                currency: params?.currency
                            }),
                            tags: {
                                'senderName': user?.fullName?.S,
                                'amount': params?.amount?.toString(),
                                'currency': params?.currency
                            }
                        }
                    }).promise();
                    const {EmailTemplateResponse} = await pinpoint.getEmailTemplate({
                        TemplateName: 'REQUEST_BLINK_TO_CONTACT',
                        Version: '1'
                    }).promise();

                    await pinpoint.updateEmailTemplate({
                        TemplateName: 'REQUEST_BLINK_TO_CONTACT',
                        EmailTemplateRequest: {
                            DefaultSubstitutions: JSON.stringify({
                                requestName: user?.fullName?.S,
                                amount: params?.amount?.toFixed(2).toString(),
                                currency: params?.currency
                            }),
                            HtmlPart: EmailTemplateResponse.HtmlPart,
                            Subject: EmailTemplateResponse.Subject,
                            tags: {
                                'requestName': user?.fullName?.S,
                                'amount': params?.amount?.toString(),
                                'currency': params?.currency
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
                                    Name: `REQUEST_BLINK_${params?.contact?.locale?.toUpperCase() || 'ES'}`,
                                    Version: '1'
                                },
                                EmailTemplate: {
                                    Name: 'REQUEST_BLINK_TO_CONTACT',
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
                        'Le han solicitado un blink' :
                        'You have been asked for a blink',
                    params?.contact?.locale === 'es' ?
                        `${user?.fullName?.S} le ha solicitado un blink por ${params?.amount.toFixed(2)} ${params?.currency}.` :
                        `${user?.fullName?.S} has requested a blink for ${params?.amount.toFixed(2)} ${params?.currency}`,
                    {
                        txId,
                        txType: "REQUEST",
                        txStatus: "REQUEST",
                        userId: params?.contact?.id,
                        read: true
                    }
                );
                break;
            default:
                break;
        }
        return response;
    } catch (e) {
        if (params?.payInfo?.length > 0) {
            // TODO Reverse PayData
        }
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
            //deviceToken
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
