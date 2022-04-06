import React, {useContext, useEffect, useState} from "react";
import {KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {Text} from "react-native-paper";
import {API, graphqlOperation, I18n} from "aws-amplify";

import {themeDefault} from "../../constants/Colors";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import {listMBPaymentMethodCountrys} from "../graphql/queries";
import {createPlaidToken} from "../../functions/functions";
import {mbCommonStyles} from "../../constants/styles";
import PlaidLink from "./PlaidLink";
import AccountNoConnectedForm from "./AccountNoConnectedForm";

// @ts-ignore
export default function PaymentForm({route}) {

    const {handleLoading, mbUser}: any = useContext(MBContext);

    const [isPermitted, setIsPermitted] = useState<boolean | null>(null);
    const [paymentMethodRoute, setPaymentMethodRoute] = useState<string | null>(null);
    const [paymentMethodType, setPaymentMethodType] = useState<string | null>(null);

    const [paymentMethod, setPaymentMethod] = useState<any>(null);
    const [config, setConfig] = useState<any>(null);

    const [tokenPlaidExpired, setTokenPlaidExpired] = useState<boolean | null>(null);
    const [plaidToken, setPlaidToken] = useState<any>(null);

    useEffect(() => {
        if (route?.name) {
            setPaymentMethodRoute(route.name);
            switch (route.name) {
                case 'PaymentCardAdd':
                    setIsPermitted(false);
                    setPaymentMethodType('CARD');
                    break;

                case 'PaymentAccountAdd':
                    setPaymentMethodType('ACCOUNT');
                    break;

                default:
                    setPaymentMethodType('ACCOUNT');
                    break;
            }
        }
    }, [
        route
    ]);

    useEffect(() => {
        async function loadPayments(payType: string) {
            handleLoading(true);
            try {
                const {
                    data: {
                        listMBPaymentMethodCountrys: {
                            items: payments
                        }
                    }
                }: any = await API.graphql(graphqlOperation(
                    listMBPaymentMethodCountrys,
                    {
                        filter: {
                            alpha2Code: {eq: mbUser?.alpha2Code},
                            alpha3Code: {eq: mbUser?.alpha3Code},
                            paymentTypeCode: {eq: payType}
                        }
                    }
                ));
                setIsPermitted(payments.length !== 0);
                if (payments.length > 0) {
                    setPaymentMethod(payments[0]);
                    if (payments[0].settings) {
                        const configuration = JSON.parse(payments[0].settings).settings;
                        setConfig(configuration);
                    }
                }
                handleLoading(false);
            } catch (e) {
                handleLoading(false);
            }

        }

        if (paymentMethodType) {
            loadPayments(paymentMethodType);
        }
    }, [
        paymentMethodType
    ]);

    useEffect(() => {
        async function openCreatedTokenPlaid() {
            const plaidLinkToken = await createPlaidToken(
                config.clientId,
                config.clientSecret,
                mbUser,
                config.environment,
                'US',
                mbUser.locale
            );
            setPlaidToken(plaidLinkToken);
            setTokenPlaidExpired(false);
        }

        if (config && paymentMethodType === 'ACCOUNT') {
            if (!config.noConnected && config.apiPlatform === 'PLAID') {
                openCreatedTokenPlaid();
            }
        }
    }, [
        config
    ])

    if (isPermitted !== null && !isPermitted) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{I18n.get('ERROR_METHOD_UNAVAILABILITY')}</Text>
            </View>
        );
    }

    if (tokenPlaidExpired) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{I18n.get('LOADING_INFO')}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={mbCommonStyles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView style={mbCommonStyles.scrollView}>
                    {
                        paymentMethodType === 'ACCOUNT' &&
                        config &&
                        !config.noConnected &&
                        config.apiPlatform === 'PLAID' &&
                        !tokenPlaidExpired &&
                        plaidToken && (
                            <PlaidLink
                                plaidToken={plaidToken}
                                configuration={config}
                                paymentMethodCountry={paymentMethod}/>
                        )
                    }
                    {
                        paymentMethodType === 'ACCOUNT' &&
                        paymentMethod &&
                        config &&
                        config.noConnected && (
                            <View style={{
                                flex: 1
                            }}>
                                <AccountNoConnectedForm paymentMethodCountry={paymentMethod}/>
                            </View>
                        )
                    }
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    error: {
        fontSize: 24,
        color: themeDefault.colors.error,
        textAlign: "center",
        marginHorizontal: 10
    },
});
