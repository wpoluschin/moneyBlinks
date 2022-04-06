import React, {useContext, useEffect, useRef, useState} from "react";
import {Image, ImageBackground, Share, StyleSheet, TouchableOpacity, View} from "react-native";
import {Button, Text} from "react-native-paper";
import {API, graphqlOperation, I18n} from "aws-amplify";
import {useNavigation} from "@react-navigation/native";
import * as Notifications from 'expo-notifications';

import MBContext from "../../contexts/MoneyBlinks/MBContext";
import HomeBlinkContext from "../../contexts/HomeBlink/HomeBlinkContext";
import {navigateToRouteBlink, registerForPushNotificationsAsync} from "../../functions/functions";
import { createOrValidateCode, updateMBUser } from "../graphql/mutations";
import {TxStatus, TxType} from "../API";
import {getMBTransaction} from "../graphql/queries";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export default function Home() {

    const navigation = useNavigation();
    const {mbUser, updatedAccountInfo, handleNotifications, handleLoading}: any = useContext(MBContext);
    const notificationListener = useRef();
    const responseListener = useRef();

    const {
        handleAmount,
        handlePromotionalBlinks,
        handleTxType,
        handleReloadFinancial,
        handleNavigateToHme,
        amount,
        blinks,
        transactionType,
        navigateToHome,
        reloadFinancialInfo,
        handleMoveTx
    }: any = useContext(HomeBlinkContext);

    const [amountEnter, setAmountEnter] = useState<string>(`0`);
    const [amountPart, setAmountPart] = useState<string>(`00`);

    const [isNormal, setIsNormal] = useState(true);
    const [logoBackground, setLogoBackground] = useState<any>(require('../../assets/images/fc-normal-mb-x390.png'));

    useEffect(() => {
        // @ts-ignore
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            const { userId, txType, txStatus } = notification?.request?.content?.data;
            if (notification && mbUser && userId === mbUser?.id) {
                handleNotifications(mbUser);
                if ((txType === TxType.SEND &&
                    (txStatus === TxStatus.SEND || txStatus === TxStatus.CONFIRM)) ||
                    (txType === TxType.REQUEST && txStatus === TxStatus.CONFIRM)) {
                    _onBlinkReceived();
                } else if (txType === TxType.REQUEST && txStatus === TxStatus.REJECT) {
                    _onBlinkReject();
                } else if (txType === TxType.REQUEST && txStatus === TxStatus.REQUEST) {
                    _onBlinkRequest();
                }
            }
        });

        return () => {
            // @ts-ignore
            Notifications.removeNotificationSubscription(notificationListener);
        }
    }, [])

    useEffect(() => {
        // @ts-ignore
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const { txId, userId, read }: any = response?.notification?.request?.content?.data;
            if (response && read && userId === mbUser?.id) {
                handleNotifications(mbUser);
                loadTxById(txId);
            }
        });
        return () => {
            // @ts-ignore
            Notifications.removeNotificationSubscription(responseListener);
        }
    }, []);

    useEffect(() => {
        async function generateTokenDevice() {
            const token = await registerForPushNotificationsAsync();

            await API.graphql(graphqlOperation(updateMBUser, {
                input: {
                    id: mbUser?.id,
                    deviceToken: token
                }
            }));
        }

        loadFinancialInfo();
        generateTokenDevice();
    }, []);

    useEffect(() => {
        if (reloadFinancialInfo) {
            loadFinancialInfo();
        }
    }, [
        reloadFinancialInfo
    ]);

    useEffect(() => {
        if (navigateToHome && transactionType) {
            if (transactionType === TxType.SEND || transactionType === TxType.SEND_REQUEST) {
                onSendBlink();
            } else if (transactionType === TxType.REQUEST) {
                onRequestBlink();
            }
        }
    }, [
        navigateToHome, transactionType
    ]);

    useEffect(() => {
        async function loadPromotionalBlink() {
            await handlePromotionalBlinks();
        }

        if (updatedAccountInfo) {
            loadPromotionalBlink();
        }
    }, [
        updatedAccountInfo
    ]);

    useEffect(() => {
        if (amount !== undefined && amount !== null && typeof amount === 'number') {
            const decimal: string[] = amount.toFixed(2).toString().split('.');
            setAmountEnter(decimal[0]);
            setAmountPart(decimal[1]);
        }
    }, [amount]);

    async function loadFinancialInfo() {
        await handleAmount();
    }

    async function loadTxById(id: string) {
        handleLoading(true);
        try {
            const {
                data: {
                    getMBTransaction: tx
                }
            }: any = await API.graphql(graphqlOperation(getMBTransaction, {
                id
            }));
            handleMoveTx(tx);
            navigateToRouteBlink(tx, mbUser, navigation);
        } catch (e) {

        } finally {
            handleLoading(false);
        }
    }

    const checkIsAvailability = () => {
        if (mbUser) {
            if (mbUser?.avatarUrl &&
                mbUser?.identificationUrl &&
                mbUser?.birthDate &&
                mbUser?.identificationNumber &&
                mbUser?.state &&
                mbUser?.country) {
                return true
            } else {
                alert(I18n.get('COMPLETE_INFORMATION'));
                return false;
            }
        } else {
            alert(I18n.get('COMPLETE_INFORMATION'));
            return false;
        }
    }

    const _navigateToTxs = () => {
        navigation.navigate('Register');
    }

    const _onGoToPackages = () => {
        navigation.navigate('Packages');
    }

    const onSendBlink = () => {
        handleTxType(null);
        handleReloadFinancial(null);
        handleNavigateToHme(null);
        setTimeout(() => {
            setLogoBackground(require('../../assets/images/fc-send-mb-x390.gif'));
            setTimeout(() => {
                setLogoBackground(require('../../assets/images/fc-normal-mb-x390.png'));
            }, 5000);
        }, 500);
    }

    const onRequestBlink = () => {
        handleTxType(null);
        handleReloadFinancial(null);
        handleNavigateToHme(null);
        setTimeout(() => {
            setLogoBackground(require('../../assets/images/fc-send-request-x390.gif'));
            setTimeout(() => {
                setLogoBackground(require('../../assets/images/fc-normal-mb-x390.png'));
            }, 4500);
        }, 500);
    }

    const _onBlinkReceived = () => {
        setTimeout(() => {
            setLogoBackground(require('../../assets/images/fc-in-x390.gif'));
            setTimeout(() => {
                setLogoBackground(require('../../assets/images/fc-normal-mb-x390.png'));
            }, 4500);
        }, 500);
    }

    const _onBlinkRequest = () => {
        setTimeout(() => {
            setLogoBackground(require('../../assets/images/fc-request-x390.gif'));
            setTimeout(() => {
                setLogoBackground(require('../../assets/images/fc-normal-mb-x390.png'));
            }, 4500);
        }, 500);
    }

    const _onBlinkReject = () => {
        setTimeout(() => {
            setLogoBackground(require('../../assets/images/fc-denied-x390.gif'));
            setTimeout(() => {
                setLogoBackground(require('../../assets/images/fc-normal-mb-x390.png'));
            }, 4500);
        }, 500);
    }

    const onShared = async () => {
        handleLoading(true);
        try {
            if (mbUser) {
                let code: any;
                const {
                    data: {
                        createOrValidateCode: response
                    }
                }: any = await API.graphql(graphqlOperation(createOrValidateCode, {
                    values: JSON.stringify({
                        type: "CODE_SHARED",
                        isCreated: true,
                        userId: mbUser?.id
                    })
                }));

                const result = JSON.parse(response);

                const {action} = await Share.share({
                    message: `${mbUser?.fullName}${I18n.get('MESSAGE_SHARED_INVITE_1')}https://moneyblinks.com${I18n.get('MESSAGE_SHARED_INVITE_2')}${result?.body?.code}`
                });
                if (action === Share.sharedAction) {

                }
            }
        } catch (e) {
            console.log('Error => ', e);
        } finally {
            handleLoading(false);
        }
    }

    return (
        <View style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: '#FBFBFB',
            paddingBottom: 20
        }}>
            <View style={{
                flexDirection: "row",
                marginTop: 20,
                justifyContent: "space-between"
            }}>
                <TouchableOpacity
                    style={{
                        alignSelf: 'flex-start',
                        marginLeft: 10
                    }}
                    onPress={() => {
                        if (checkIsAvailability()) {
                            navigation.navigate('SendBlink');
                        } else {
                            alert(`${I18n.get('COMPLETE_INFORMATION')}`)
                        }
                    }}>
                    <Button mode="text"
                            labelStyle={{
                                fontSize: 18
                            }}
                            color={'#00B7E7'}
                            icon="publish"
                            style={{
                                backgroundColor: 'transparent',
                            }}>
                        {I18n.get('BTN_SEND')}
                    </Button>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        alignSelf: 'flex-end',
                        marginRight: 10
                    }}
                    onPress={() => {
                        if (checkIsAvailability()) {
                            navigation.navigate('RequestBlink');
                        } else {
                            alert(`${I18n.get('COMPLETE_INFORMATION')}`)
                        }
                    }}>
                    <Button
                        labelStyle={{
                            fontSize: 18
                        }}
                        color='#00B7E7'
                        icon="download"
                        mode="text">
                        {I18n.get('BTN_RECEIVED')}
                    </Button>
                </TouchableOpacity>
            </View>
            <View style={{
                width: '100%',
                alignItems: 'center',
                flex: 0.3,
                flexDirection: 'row',
                justifyContent: 'center'
            }}>
                {
                    isNormal && (
                        <Image source={logoBackground} style={{
                            resizeMode: 'contain'
                        }}/>
                    )
                }
            </View>
            <View style={{
                marginHorizontal: 20,
                marginTop: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: -60
            }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('CashMoney')}
                    style={{
                        flex: 0.5,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        alignContent: "center",
                        marginLeft: 10
                    }}>
                    <Text style={stylesHome.text}>{`$ ${amountEnter}`}</Text>
                    <View
                        style={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                            borderBottomWidth: 1,
                            borderBottomColor: '#0771B8'
                        }}>
                        <Text style={stylesHome.minText}>
                            {`.${(amountPart + '00').slice(0, 2)}`}
                        </Text>
                        <Text style={stylesHome.minTextSub}>
                            {I18n.get('AMOUNT')}
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={_onGoToPackages}
                    style={{
                        flex: 0.5,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        alignContent: "center",
                        marginRight: 10
                    }}>
                    <Text style={stylesHome.text}>{blinks}</Text>
                    <View style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        borderBottomWidth: 1,
                        borderBottomColor: '#0771B8'
                    }}>
                        <Text style={stylesHome.minText}>
                            {'Blinks (P)'}
                        </Text>
                        <Text style={stylesHome.minTextSub}>
                            {I18n.get('REMAIN')}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={{
                flexDirection: "row",
                marginBottom: -60,
                alignContent: "center"
            }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('HaveCode')}
                    style={{
                        flex: 1
                    }}>
                    <View style={{
                        alignSelf: "center",
                        borderBottomWidth: 1,
                        borderBottomColor: '#0771B8'
                    }}>
                        <Text style={{
                            ...stylesHome.minTextSub,
                            fontSize: 20
                        }}>{I18n.get('HAVE_CODE')}</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={{
                flexDirection: "row",
                justifyContent: "space-around",
            }}>
                <View style={{alignItems: "center"}} onTouchStart={onShared}>
                    <ImageBackground
                        style={stylesHome.backgroundImage}
                        source={require('../../assets/images/contacts.png')}/>
                    <Button mode="text"
                            color='#00B7E7'>
                        {I18n.get('SEND_INVITE')}
                    </Button>
                </View>
                <View style={{alignItems: "center"}} onTouchStart={_onGoToPackages}>
                    <ImageBackground
                        style={stylesHome.backgroundImage}
                        source={require('../../assets/images/packages.png')}/>
                    <Button mode="text"
                            color='#00B7E7'>
                        {I18n.get('BUY_PACKAGES')}
                    </Button>
                </View>
                <View style={{alignItems: "center"}} onTouchStart={_navigateToTxs}>
                    <ImageBackground
                        style={stylesHome.backgroundImage}
                        source={require('../../assets/images/register.png')}/>
                    <Button mode="text"
                            color='#00B7E7'>
                        {I18n.get('REGISTERS')}
                    </Button>
                </View>
            </View>
        </View>
    );
}


const stylesHome = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column"
    },
    image: {
        flex: 1,
        resizeMode: "cover",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 80
    },
    imageBackground: {
        width: '100%',
        height: '100%',
        flexDirection: "row",
    },
    backgroundImage: {
        resizeMode: "cover",
        width: 60,
        height: 60
    },
    text: {
        color: '#E98A3C',
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
    },
    minText: {
        color: '#E98A3C',
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",
    },
    minTextSub: {
        color: '#E98A3C',
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",
        fontFamily: "Roboto-Bold"
    }
});
