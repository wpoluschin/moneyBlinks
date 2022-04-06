import React, {Fragment, useContext, useEffect, useState} from "react";
import {Dimensions, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {I18n, Storage} from "aws-amplify";
import {Avatar, Divider, Text} from "react-native-paper";

import {mbCommonStyles} from "../../../constants/styles";
import MBContext from "../../../contexts/MoneyBlinks/MBContext";
import HomeBlinkContext from "../../../contexts/HomeBlink/HomeBlinkContext";
import {themeDefault} from "../../../constants/Colors";
import moment from "moment";
import {TxStatus, TxType} from "../../API";
import {navigateToRouteBlink} from "../../../functions/functions";

const {width, height} = Dimensions.get("window");

export default function Register() {
    const navigation = useNavigation();

    const {mbUser}: any = useContext(MBContext);
    const {
        historicalTx,
        handleLoadingHistoricalTx,
        handleMoveTx
    }: any = useContext(HomeBlinkContext);

    const [txType] = useState<string>("ALL");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isLoading) {
            loadTx();
        }
    }, [
        isLoading
    ]);

    async function loadTx() {
        setIsLoading(false);
        await handleLoadingHistoricalTx(txType);
    }

    async function loadImage(avatarUrl: string) {
        return await Storage.get(avatarUrl);
    }

    const loadTransaction = async (tx: any) => {
        handleMoveTx(tx);
        navigateToRouteBlink(tx, mbUser, navigation);
    }


    return (
        <SafeAreaView style={mbCommonStyles.container}>
            <ScrollView style={mbCommonStyles.scrollView}>
                <View
                    style={{
                        marginTop: 20,
                        flexDirection: "row"
                    }}>

                </View>
                <ScrollView
                    style={{
                        width: width - 40,
                        height: height - 180
                    }}>
                    {
                        historicalTx && historicalTx?.length > 0 ?
                            (
                                <Fragment>
                                    {
                                        historicalTx?.map((tx: any, index: number) => {
                                            let image: any = null;
                                            let name = '';
                                            let amount: number = 0;
                                            let iconName = 'publish';
                                            if (tx?.shippingID === mbUser?.id) {
                                                amount = parseFloat(tx?.amount);
                                            } else if (tx?.receiptID === mbUser?.id) {
                                                amount = parseFloat(tx?.amountDeposit);
                                                iconName = 'download';
                                            }
                                            if (tx?.isConfirm && tx?.isReceipt) {
                                                if (tx?.shippingID === mbUser?.id) {
                                                    iconName = 'cash-minus';
                                                } else if (tx?.receiptID === mbUser?.id) {
                                                    iconName = 'cash-plus';
                                                }
                                            }
                                            if (tx?.txStatus === TxStatus.REJECT) {
                                                iconName = 'cash-remove';
                                            }
                                            if (tx?.shippingID === mbUser?.id && tx?.receipt) {
                                                name = tx?.receipt?.fullName;
                                                if (tx?.receipt?.avatarUrl) {
                                                    (async () => {
                                                        image = await loadImage(tx?.receipt?.avatarUrl);
                                                    })();
                                                }
                                            } else if (tx?.receiptID && tx?.receiptID === mbUser?.id) {
                                                name = tx?.shipping.fullName;
                                                if (tx?.shipping?.avatarUrl) {
                                                    (async () => {
                                                        image = await loadImage(tx?.shipping?.avatarUrl);
                                                    })();
                                                }
                                            }
                                            const color: string = (tx?.txType === TxType.SEND &&
                                                (tx?.txStatus === TxStatus.SEND ||
                                                    tx?.txStatus === TxStatus.SHARED ||
                                                    tx?.txStatus === TxStatus.STANDBY)) ||
                                            tx?.txStatus === TxStatus.REQUEST ? themeDefault.colors.warn :
                                                tx?.txStatus === TxStatus.REJECT ?
                                                    themeDefault.colors.error : themeDefault.colors.notification;
                                            return (
                                                <Fragment key={index}>
                                                    <TouchableOpacity
                                                        style={{
                                                            flexDirection: "row",
                                                            marginHorizontal: 0,
                                                            marginVertical: 10,
                                                            paddingVertical: 10
                                                        }}
                                                        onPress={() => loadTransaction(tx)}>
                                                        {
                                                            image ?
                                                                <Avatar.Image
                                                                    size={36}
                                                                    source={{
                                                                        uri: image
                                                                    }}/> :
                                                                <Avatar.Icon size={36} icon="account"/>
                                                        }
                                                        <Text style={{
                                                            height: 36,
                                                            paddingLeft: 2,
                                                            textAlignVertical: "center",
                                                            fontSize: 12,
                                                            flex: 0.4,
                                                            color: '#97A19A'
                                                        }}>
                                                            {`${name}`}
                                                        </Text>
                                                        <Text style={{
                                                            color,
                                                            height: 36,
                                                            paddingLeft: 2,
                                                            fontSize: 11,
                                                            textAlignVertical: "center",
                                                            textAlign: "right",
                                                            flex: 0.25
                                                        }}>{`$ ${amount?.toFixed(2)}`}</Text>
                                                        <Text style={{
                                                            height: 36,
                                                            paddingLeft: 5,
                                                            fontSize: 11,
                                                            textAlignVertical: "center",
                                                            color: '#97A19A',
                                                            flex: 0.25
                                                        }}>{moment(new Date(tx?.createdAt)).format('L')}</Text>
                                                        <Avatar.Icon size={36}
                                                                     style={{
                                                                         backgroundColor: 'transparent',
                                                                         flex: 0.1,
                                                                         marginLeft: -15
                                                                     }}
                                                                     color='#97A19A'
                                                                     icon={`${iconName}`}/>
                                                    </TouchableOpacity>
                                                    <Divider/>
                                                </Fragment>
                                            );
                                        })
                                    }
                                </Fragment>
                            ) : (
                                <View style={styles.containerError}>
                                    <Text style={styles.errorText}>
                                        {I18n.get('NO_HISTORICAL_TX')}
                                    </Text>
                                </View>
                            )
                    }
                </ScrollView>
            </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    containerError: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        height: height - 180
    },
    errorText: {
        fontSize: 24,
        color: themeDefault.colors.error,
        textAlign: "center",
        marginHorizontal: 10
    },
});
