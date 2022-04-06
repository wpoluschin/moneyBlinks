/* Amplify Params - DO NOT EDIT
	API_MONEYBLINKSWALLET_GRAPHQLAPIENDPOINTOUTPUT
	API_MONEYBLINKSWALLET_GRAPHQLAPIIDOUTPUT
	API_MONEYBLINKSWALLET_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
const AWS = require('aws-sdk');
const moment = require('moment');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    AWS.config.update({region: 'us-east-1'});
    const dynamoClient = new AWS.DynamoDB();
    const pinpoint = new AWS.Pinpoint();
    const s3 = new AWS.S3();
    let result = {
        statusCode: 200
    };

    try {
        const currentDate = new Date();
        let contentPROD = '';
        let contentPICH = '';
        let contentServPays = '';
        let iterator = 0;
        let iteratorPich = 0;
        let itSrvPay = 0;
        const {Items, Count} = await dynamoClient.scan({
            FilterExpression: 'createdAt < :createdAt AND attribute_not_exists(batchCatch) AND attribute_not_exists(processAt) AND paymentMethod = :paymentMethod AND stateCode = :stateCode',
            ExpressionAttributeValues: {
                ':createdAt': {S: currentDate.toISOString()},
                ':paymentMethod': {S: 'ACCOUNT'},
                ':stateCode': { S: 'EC' }
            },
            TableName: 'MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre'
        }).promise();
        const ProcessedItems = {
            RequestItems: {
                'MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre': [],
                'FileUploadBank-oqkpjuho2ngvbonruy7shv26zu-pre': []
            }
        };
        if (Count !== 0) {
            await Promise.all(
                Items.map(async (item, index) => {
                    ProcessedItems.RequestItems['MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre'].push(
                        {
                            PutRequest: {
                                Item: {
                                    ...item,
                                    batchCatch: {S: (new Date()).toISOString()},
                                    processAt: {S: (new Date()).toISOString()},
                                    updatedAt: {S: (new Date()).toISOString()}
                                }
                            }
                        }
                    );
                    const {Item: account} = await dynamoClient.getItem({
                        TableName: 'MBMyPaymentMethod-oqkpjuho2ngvbonruy7shv26zu-pre',
                        Key: {
                            'id': {S: item?.paymentMethodId.S}
                        }
                    }).promise();

                    if (account) {
                        const {Item: country} = await dynamoClient.getItem({
                            TableName: 'MBPaymentMethodCountry-oqkpjuho2ngvbonruy7shv26zu-pre',
                            Key: {
                                'id': {S: account?.paymentMethodCountryID?.S}
                            }
                        }).promise();
                        if (country?.alpha3Code?.S === 'ECU') {
                            const {Item: currentUser} = await dynamoClient.getItem({
                                TableName: 'MBUser-oqkpjuho2ngvbonruy7shv26zu-pre',
                                Key: {
                                    'id': {S: item?.userID?.S}
                                }
                            }).promise();
                            const accountNumber = account?.settings?.M.mask?.S;
                            const bankCode = account?.settings?.M.account_id.S;
                            if (bankCode.substr(0, 4) !== '0010') {
                                iterator++;
                                if (iterator > 1) {
                                    contentPROD = contentPROD + '\n';
                                }
                                contentPROD += `PA\t02005273524\t${iterator}\t\t${currentUser?.identificationNumber?.S}\t${item?.currency?.S}\t${`0000000000000${Number(item?.amount?.N) * 100}`.slice(-13)}\tCTA\t${account?.value?.S.substr(0, 4)}\t${account?.settings?.M.type?.S === 'CC' ? 'CTE' : 'AHO'}\t${`00000000000${accountNumber}`.slice(-11)}\t${currentUser?.identificationType?.S || 'C'}\t${currentUser?.identificationNumber?.S}\t${currentUser?.fullName?.S}\t\t\t\t\t${item?.txID?.S}\t`;
                            } else {
                                iteratorPich++;
                                if (iteratorPich > 1) {
                                    contentPICH += '\n';
                                }
                                contentPICH += `PA\t${iteratorPich}\t${item?.currency?.S}\t${Number(item?.amount?.N) * 100}\tCTA\t${account?.settings?.M.type?.S === 'CC' ? 'CTE' : 'AHO'}\t${accountNumber}\tRemesa MoneyBlinks\t${currentUser?.identificationType?.S || 'C'}\t${currentUser?.identificationNumber?.S}\t${currentUser?.fullName?.S}\t0010`;
                                iteratorPich++;
                            }
                        }
                    }
                })
            );
        }

        const {Items: SrvPayItems, Count: SrvPayCount} = await dynamoClient.scan({
            FilterExpression: 'createdAt < :createdAt AND attribute_not_exists(batchCatch) AND attribute_not_exists(processAt) AND paymentMethod = :paymentMethod AND stateCode = :stateCode',
            ExpressionAttributeValues: {
                ':createdAt': {S: currentDate.toISOString()},
                ':paymentMethod': {S: 'THIRD_PARTIES'},
                ':stateCode': { S: 'EC' }
            },
            TableName: 'MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre'
        }).promise();
        if (SrvPayCount !== 0) {
            await Promise.all(
                SrvPayItems.map(async (item, index) => {
                    ProcessedItems.RequestItems['MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre'].push(
                        {
                            PutRequest: {
                                Item: {
                                    ...item,
                                    batchCatch: {S: (new Date()).toISOString()},
                                    processAt: {S: (new Date()).toISOString()},
                                    updatedAt: {S: (new Date()).toISOString()}
                                }
                            }
                        }
                    );

                    const {Item: currentUser} = await dynamoClient.getItem({
                        TableName: 'MBUser-oqkpjuho2ngvbonruy7shv26zu-pre',
                        Key: {
                            'id': {S: item?.userID?.S}
                        }
                    }).promise();
                    itSrvPay++;
                    if (itSrvPay > 1) {
                        contentServPays = contentServPays + '\n';
                    }
                    contentServPays += `PA\t02005273524\t${itSrvPay}\t\t${currentUser?.identificationNumber?.S}\t${item?.currency?.S}\t${`0000000000000${Number(item?.amount?.N) * 100}`.slice(-13)}\tEFE\t0036\t\t\t${currentUser?.identificationType?.S || 'C'}\t${currentUser?.identificationNumber?.S}\t${currentUser?.fullName?.S}\t\t\t\t\t${item?.txID?.S}\t`;
                })
            );
        }
        if (iteratorPich >= 1) {
            const fileName = `ECU-BANK-PICH-${moment(currentDate).format('YYYYMMDDHHmmss')}.txt`;
            const filePath = `/tmp/${fileName}`
            fs.writeFileSync(filePath, contentPICH);
            const fileStream = fs.createReadStream(filePath);
            const resultPich = await s3.upload({
                Key: path.basename(filePath),
                Body: fileStream,
                Bucket: 'moneyblinkswallets3125742-pre'
            }).promise();
            const {EmailTemplateResponse} = await pinpoint.getEmailTemplate({
                TemplateName: 'UP_MONEY_TO_BANK',
                Version: '1'
            }).promise();
            const AddressToSend = {
                ['bkofec@moneyblinks.com']: {
                    ChannelType: "EMAIL"
                },
                ['afonsecac@moneyblinks.com']: {
                    ChannelType: "EMAIL"
                },
                ['alexander.afonsecac@gmail.com']: {
                    ChannelType: "EMAIL"
                }
            };
            await pinpoint.updateEmailTemplate({
                TemplateName: 'UP_MONEY_TO_BANK',
                EmailTemplateRequest: {
                    DefaultSubstitutions: JSON.stringify({
                        fileName: fileName,
                        link: resultPich?.Location
                    }),
                    HtmlPart: EmailTemplateResponse.HtmlPart,
                    Subject: EmailTemplateResponse.Subject,
                    tags: {
                        'fileName': fileName,
                        'link': resultPich?.Location
                    }
                }
            }).promise();
            ProcessedItems.RequestItems['FileUploadBank-oqkpjuho2ngvbonruy7shv26zu-pre'].push(
                {
                    PutRequest: {
                        Item: {
                            id: {S: uuid.v4()},
                            fileType: {S: "BANK"},
                            type: {S: "PICHINCHA"},
                            fileName: {S: fileName},
                            location: {S: resultPich?.Location},
                            createdAt: {S: (new Date()).toISOString()},
                            updatedAt: {S: (new Date()).toISOString()},
                            isDownload: {BOOL: false}
                        }
                    }
                }
            );
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
                        EmailTemplate: {
                            Name: 'UP_MONEY_TO_BANK',
                            Version: '1'
                        }
                    }
                }
            }).promise();
        }
        if (iterator >= 1) {
            const fileName = `ECU-BANK-PROD-${moment(currentDate).format('YYYYMMDDHHmmss')}.txt`;
            const filePath = `/tmp/${fileName}`
            fs.writeFileSync(filePath, contentPROD);
            const fileStream = fs.createReadStream(filePath);
            result = await s3.upload({
                Key: path.basename(filePath),
                Body: fileStream,
                Bucket: 'moneyblinkswallets3125742-pre'
            }).promise();
            const {EmailTemplateResponse} = await pinpoint.getEmailTemplate({
                TemplateName: 'UP_MONEY_TO_BANK',
                Version: '1'
            }).promise();
            const AddressToSend = {
                ['bkofec@moneyblinks.com']: {
                    ChannelType: "EMAIL"
                },
                ['afonsecac@moneyblinks.com']: {
                    ChannelType: "EMAIL"
                },
                ['alexander.afonsecac@gmail.com']: {
                    ChannelType: "EMAIL"
                }
            };
            await pinpoint.updateEmailTemplate({
                TemplateName: 'UP_MONEY_TO_BANK',
                EmailTemplateRequest: {
                    DefaultSubstitutions: JSON.stringify({
                        fileName: fileName,
                        link: result?.Location
                    }),
                    HtmlPart: EmailTemplateResponse.HtmlPart,
                    Subject: EmailTemplateResponse.Subject,
                    tags: {
                        'fileName': fileName,
                        'link': result?.Location
                    }
                }
            }).promise();
            ProcessedItems.RequestItems['FileUploadBank-oqkpjuho2ngvbonruy7shv26zu-pre'].push(
                {
                    PutRequest: {
                        Item: {
                            id: {S: uuid.v4()},
                            type: {S: "PRODUBANCO"},
                            fileName: {S: fileName},
                            location: {S: result?.Location},
                            createdAt: {S: (new Date()).toISOString()},
                            updatedAt: {S: (new Date()).toISOString()},
                            isDownload: {BOOL: false}
                        }
                    }
                }
            );
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
                        EmailTemplate: {
                            Name: 'UP_MONEY_TO_BANK',
                            Version: '1'
                        }
                    }
                }
            }).promise();
        }
        if (itSrvPay >= 1) {
            const fileName = `ECU-SERVIPAGOS-${moment(currentDate).format('YYYYMMDDHHmmss')}.txt`;
            const filePath = `/tmp/${fileName}`
            fs.writeFileSync(filePath, contentServPays);
            const fileStream = fs.createReadStream(filePath);
            result = await s3.upload({
                Key: path.basename(filePath),
                Body: fileStream,
                Bucket: 'moneyblinkswallets3125742-pre'
            }).promise();
            const {EmailTemplateResponse} = await pinpoint.getEmailTemplate({
                TemplateName: 'UP_MONEY_TO_BANK',
                Version: '1'
            }).promise();
            const AddressToSend = {
                ['bkofec@moneyblinks.com']: {
                    ChannelType: "EMAIL"
                },
                ['afonsecac@moneyblinks.com']: {
                    ChannelType: "EMAIL"
                },
                ['alexander.afonsecac@gmail.com']: {
                    ChannelType: "EMAIL"
                }
            };
            await pinpoint.updateEmailTemplate({
                TemplateName: 'UP_MONEY_TO_BANK',
                EmailTemplateRequest: {
                    DefaultSubstitutions: JSON.stringify({
                        fileName: fileName,
                        link: result?.Location
                    }),
                    HtmlPart: EmailTemplateResponse.HtmlPart,
                    Subject: EmailTemplateResponse.Subject,
                    tags: {
                        'fileName': fileName,
                        'link': result?.Location
                    }
                }
            }).promise();
            ProcessedItems.RequestItems['FileUploadBank-oqkpjuho2ngvbonruy7shv26zu-pre'].push(
                {
                    PutRequest: {
                        Item: {
                            id: {S: uuid.v4()},
                            type: {S: "SERVIPAGOS"},
                            fileName: {S: fileName},
                            location: {S: result?.Location},
                            createdAt: {S: (new Date()).toISOString()},
                            updatedAt: {S: (new Date()).toISOString()},
                            isDownload: {BOOL: false}
                        }
                    }
                }
            );
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
                        EmailTemplate: {
                            Name: 'UP_MONEY_TO_BANK',
                            Version: '1'
                        }
                    }
                }
            }).promise();
        }
        if (ProcessedItems.RequestItems['MBDownloadBlink-oqkpjuho2ngvbonruy7shv26zu-pre'].length > 0) {
            await dynamoClient.batchWriteItem(ProcessedItems).promise();
        }
        return result;
    } catch (e) {
        throw e;
    }
};
