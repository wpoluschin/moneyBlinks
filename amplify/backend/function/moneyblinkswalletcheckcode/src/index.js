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
    // TODO implement
    AWS.config.update({region: 'us-east-1'});
    const dynamoClient = new AWS.DynamoDB();
    const pinpoint = new AWS.Pinpoint();
    let response = {
        statusCode: 200,
        body: event?.arguments?.values,
    };
    const params = event?.arguments?.values || {};
    try {
        if (!params?.userId || !params?.code) {
            throw Error('Insufficient Params');
        }

        const {Item: currentUser } = await dynamoClient.getItem({
            TableName: 'MBUser-oqkpjuho2ngvbonruy7shv26zu-pre',
            Key: {
                'id': {S: params?.userId}
            }
        }).promise();
        const ProcessedItems = {
            RequestItems: {}
        };

        const { Items, Count } = await dynamoClient.scan({
            FilterExpression: 'userID <> :userID AND code = :code',
            ExpressionAttributeValues: {
                ':userID': {S: params?.userId},
                ':code': {S: params?.code}
            },
            TableName: 'MBCode-oqkpjuho2ngvbonruy7shv26zu-pre'
        }).promise();
        if (Count === 0) {
            throw Error('The code you provide is not available in our system.');
        } else if (Count > 1) {
            throw Error('Our codes can only be used once.');
        }
        const codeItem = Items[0];
        if (codeItem?.isUserUsed?.BOOL) {
            throw Error('CODE_IS_USED');
        }
        const {Item: user } = await dynamoClient.getItem({
            TableName: 'MBUser-oqkpjuho2ngvbonruy7shv26zu-pre',
            Key: {
                'id': {S: codeItem?.userID?.S}
            }
        }).promise();
        const { Items: Contacts, Count: ContactCount } = await dynamoClient.scan({
            FilterExpression: 'invitingID = :invitingID AND invitedID = :invitedID',
            ExpressionAttributeValues: {
                ':invitingID': {S: codeItem?.userID?.S },
                ':invitedID': {S: params?.userId }
            },
            TableName: 'MBContact-oqkpjuho2ngvbonruy7shv26zu-pre'
        }).promise();
        if (ContactCount > 0) {
            const contact = Contacts[0];
            const valueUp = Number(contact.myShipments.N) + 1;
            ProcessedItems.RequestItems['MBContact-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                PutRequest: {
                    Item: {
                        ...contact,
                        ...{
                            myShipments: { N: `${valueUp}` },
                            updatedAt: { S: (new Date()).toISOString() }
                        }
                    }
                }
            }];
        } else {
            ProcessedItems.RequestItems['MBContact-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                PutRequest: {
                    Item: {
                        myShipments: { N: '1' },
                        updatedAt: { S: (new Date()).toISOString() },
                        myReceipts: { N: '0' },
                        invitingID: { S: codeItem?.userID?.S },
                        createdAt: { S: (new Date()).toISOString() },
                        isFavorite: { BOOL: false },
                        id: { S: uuid.v4() },
                        invitedID: { S: params?.userId }
                    }
                }
            }];
        }
        ProcessedItems.RequestItems['MBCode-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
            PutRequest: {
                Item: {
                    ...codeItem,
                    ...{
                        isUsed: { BOOL: false },
                        isUserUsed: { BOOL: true },
                        updatedAt: { S: (new Date()).toISOString() }
                    }
                }
            }
        }];

        switch (codeItem.codeType.S) {
            case 'TX':
                const { Items: Transactions, Count: TransactionsCount } = await dynamoClient.scan({
                    FilterExpression: 'shippingID = :shippingID AND codeID = :codeID',
                    ExpressionAttributeValues: {
                        ':shippingID': {S: codeItem?.userID?.S },
                        ':codeID': {S: codeItem?.id?.S }
                    },
                    TableName: 'MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'
                }).promise();
                if (TransactionsCount === 1) {
                    const transaction = Transactions[0];
                    ProcessedItems.RequestItems['MBTransaction-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                        PutRequest: {
                            Item: {
                                ...transaction,
                                ...{
                                    receiptID: { S: params?.userId },
                                    txStatus: { S: "STANDBY" },
                                    amount: { N: transaction.amountDeposit.N }
                                }
                            }
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
                                        txId: transaction.id.S,
                                        txType: "SEND",
                                        txStatus: "STANDBY",
                                        userId: user?.id?.S,
                                        read: true
                                    }) },
                                title: { S: `${ user?.locale.S === 'es' ? 'Confirmación de código compartido por redes' : 'Network code sharing confirmation'}` },
                                message: { S: `${currentUser?.fullName?.S} ${ user?.locale.S === 'es' ? 'ha recibido el blink que le enviaste, ya puede pagar y confirmar el blink.' : 'he has received the blink you sent him, he can now pay and confirm the blink.'}`},
                                userID: { S: user?.id?.S }
                            }
                        }
                    }];
                    if (user?.deviceToken.S) {
                        await sendNotification(
                            user?.deviceToken.S,
                            user?.locale.S === 'es' ?
                                'Confirmación de código compartido por redes' :
                                'Network code sharing confirmation',
                            user?.locale.S === 'es' ?
                                `${user?.fullName?.S} ha recibido el blink que le enviaste, ya puede pagar y confirmar el blink.` :
                                `${user?.fullName?.S} he has received the blink you sent him, he can now pay and confirm the blink.`,
                            {
                                txId: transaction.id.S,
                                txType: "SEND",
                                txStatus: "STANDBY",
                                userId: user?.id?.S,
                                read: true
                            }
                        );
                    }
                }
                break;
            default:
                ProcessedItems.RequestItems['MBNotification-oqkpjuho2ngvbonruy7shv26zu-pre'] = [{
                    PutRequest: {
                        Item: {
                            id: { S: uuid.v4() },
                            type: { S: "NOTIFICATION" },
                            createdAt: { S: (new Date()).toISOString() },
                            updatedAt: { S: (new Date()).toISOString() },
                            isRead: { BOOL: false },
                            data: { S: JSON.stringify({
                                    userId: user?.id?.S,
                                    read: true
                                }) },
                            title: { S: `${ currentUser?.locale.S === 'es' ? 'Confirmación de código compartido por redes' : 'Network code sharing confirmation'}` },
                            message: { S: `${currentUser?.fullName?.S} ${ currentUser?.locale.S === 'es' ? 'ha recibido el blink que le enviaste, ya puede pagar y confirmar el blink.' : 'he has received the blink you sent him, he can now pay and confirm the blink.'}`},
                            userID: { S: user?.id?.S }
                        }
                    }
                }];
                if (user?.deviceToken.S) {
                    await sendNotification(
                        user?.deviceToken.S,
                        user?.locale.S === 'es' ?
                            'Han aceptado una invitación que realizaste a usar MoneyBlinks' :
                            'They have accepted an invitation you made to use MoneyBlinks',
                        user?.locale.S === 'es' ?
                            `${currentUser?.fullName?.S} ha aceptado una invitación que realizaste a usar MoneyBlinks.` :
                            `${currentUser?.fullName?.S} has accepted an invitation you made to use MoneyBlinks.`,
                        {
                            userId: user?.id?.S,
                            read: true
                        }
                    );
                }
                break;
        }
        await dynamoClient.batchWriteItem(ProcessedItems).promise();

        try {
            const {SMSTemplateResponse} = await pinpoint.getSmsTemplate({
                TemplateName: `CONFIRM_SHARED_${user.locale?.S.toUpperCase() || 'ES'}`,
                Version: '1'
            }).promise();
            const {EmailTemplateResponse} = await pinpoint.getEmailTemplate({
                TemplateName: 'CONFIRM_BLINK_SHARED',
                Version: '1'
            }).promise();

            const AddressToSend = {
                [user?.phoneNumber?.S]: {
                    ChannelType: "SMS"
                },
                [user?.email?.S]: {
                    ChannelType: "EMAIL"
                }
            }
            if (Object.keys(AddressToSend).length > 0) {
                await pinpoint.updateSmsTemplate({
                    TemplateName: `CONFIRM_SHARED_${user.locale?.S.toUpperCase() || 'ES'}`,
                    Version: '1',
                    CreateNewVersion: false,
                    SMSTemplateRequest: {
                        Body: SMSTemplateResponse.Body,
                        DefaultSubstitutions: JSON.stringify({
                            userName: currentUser?.fullName?.S,
                            code: params?.code
                        }),
                        tags: {
                            'userName': currentUser?.fullName?.S,
                            'code': params?.code
                        }
                    }
                }).promise();
                await pinpoint.updateEmailTemplate({
                    TemplateName: 'CONFIRM_BLINK_SHARED',
                    EmailTemplateRequest: {
                        DefaultSubstitutions: JSON.stringify({
                            userName: currentUser?.fullName?.S,
                            code: params?.code
                        }),
                        HtmlPart: EmailTemplateResponse.HtmlPart,
                        Subject: EmailTemplateResponse.Subject,
                        tags: {
                            'userName': currentUser?.fullName?.S,
                            'code': params?.code
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
                                Name: `CONFIRM_SHARED_${user?.locale?.S.toUpperCase() || 'ES'}`,
                                Version: '1'
                            },
                            EmailTemplate: {
                                Name: 'CONFIRM_BLINK_SHARED',
                                Version: '1'
                            }
                        }
                    }
                }).promise();
            }
        } catch (e) {
            console.error(e);
        }

        return response;
    } catch (e) {
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
