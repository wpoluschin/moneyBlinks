import React, {useContext, useRef, useState} from "react";
import {useNavigation} from "@react-navigation/native";
import {Dimensions, StyleSheet, View} from "react-native";
import {Button, Text} from "react-native-paper";
import {API, graphqlOperation, I18n} from "aws-amplify";
import WebView from "react-native-webview";
import * as queryString from "querystring";
import {ShouldStartLoadRequest, WebViewErrorEvent, WebViewNavigationEvent} from "react-native-webview/lib/WebViewTypes";

const { height } = Dimensions.get('window');

import {mbCommonStyles} from "../../constants/styles";
import {themeDefault} from "../../constants/Colors";
import {getInfoPlaidAccounts, getPlaidAccessToken} from "../../functions/functions";
import {PlaidAccount} from "../../functions/interfaces";
import {listMBMyPaymentMethods} from "../graphql/queries";
import {createMBMyPaymentMethod} from "../graphql/mutations";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import PaymentMethodContext from "../../contexts/PaymentMethod/PaymentMethodContext";

// @ts-ignore
export default function PlaidLink({ plaidToken, configuration, paymentMethodCountry }) {
    let webviewRef: any = useRef<any>();

    const { handleLoading, mbUser }: any = useContext(MBContext);
    const { handleIsBack }: any = useContext(PaymentMethodContext);

    const [errorStatus, setErrorStatus] = useState<string | null>(null);

    const {link_token} = plaidToken;
    const navigation = useNavigation();

    const handleShouldHandleEvent = (event: ShouldStartLoadRequest): boolean => {
        if (event.url.startsWith('plaidlink://')) {
            const eventParams = queryString.parse(event.url)
            if (event.url.startsWith('plaidlink://exit')) {
                navigation.navigate('AccountList');
                return true;
            } else if (event.url.startsWith('plaidlink://connected')) {
                const publicToken = (eventParams.public_token || eventParams['plaidlink://connected?public_token']) as string;
                const institutionName = eventParams.institution_name as string;
                const accountsInfo = JSON.parse(eventParams.accounts as string);
                connectApplication(publicToken, accountsInfo, institutionName);
            }
            return false;
        }
        return true;
    }

    function connectApplication(publicToken: string, accountsInfo: string, institutionName: string) {
        if (accountsInfo) {
            handleLoading(true);
            (async () => {
                try {
                    const { access_token } = await getPlaidAccessToken(
                        publicToken,
                        configuration.clientId,
                        configuration.clientSecret,
                        configuration.environment
                    );
                    const {accounts} = await getInfoPlaidAccounts(
                        access_token,
                        configuration.environment,
                        configuration.clientId,
                        configuration.clientSecret
                    );
                    if (accounts && accounts.length > 0) {
                        await Promise.all(
                            accounts.map(async (account: PlaidAccount, index: number) => {
                                account.institutionName = institutionName;
                                account.usedToPay = true;
                                account.publicToken = publicToken;
                                account.accessToken = access_token;
                                await createPlaidAccountBank(account);
                                if (index === accounts.length - 1) {
                                    handleLoading(false);
                                    handleIsBack(true);
                                    navigation.navigate('AccountList');
                                }
                            })
                        );
                    } else {
                        handleLoading(false);
                    }
                } catch (e) {
                    console.log(e.message || e);
                    handleLoading(false);
                }
            })();
        }
    }

    async function createPlaidAccountBank(account: PlaidAccount) {
        try {
            const {
                data: {
                    listMBMyPaymentMethods: {
                        items: myAccounts
                    }
                }
            }: any = await API.graphql(graphqlOperation(listMBMyPaymentMethods, {
                filter: {
                    accountId: {eq: account.account_id},
                    userID: {eq: mbUser?.id},
                    payType: {eq: 'ACCOUNT'}
                }
            }));
            if (myAccounts.length === 0) {
                await API.graphql(graphqlOperation(createMBMyPaymentMethod, {
                    input: {
                        paymentMethodCountryID: paymentMethodCountry?.id,
                        userID: mbUser?.id,
                        value: account.account_id,
                        accountId: account.account_id,
                        label: `${account.name} ----${account.mask}`,
                        settings: JSON.stringify(account),
                        isActive: true,
                        isUsedPayment: true,
                        payType: 'ACCOUNT',
                        description: `${account.institutionName} ${account?.official_name ? account.official_name : ''} ${account.balances.iso_currency_code}`
                    }
                }));
            }
        } catch (e) {
            console.log('Account ', e.message || e);
        }
    }

    const handleOnEndLoad = (ev: WebViewNavigationEvent | WebViewErrorEvent) => {
        const eEvent: any = ev?.nativeEvent;
        if (eEvent.hasOwnProperty('code') && eEvent.code < 0) {
            setErrorStatus(eEvent.description);
        }
    }

    if (errorStatus === 'net::ERR_UNKNOWN_URL_SCHEME') {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>
                    {I18n.get('NO_PLAID_PAGE_AVAILABILITY')}
                </Text>
                <Button
                    onPress={() => {
                        navigation.goBack();
                    }}
                    style={mbCommonStyles.submitBtn}>
                    {I18n.get('PLAID_RETRY')}
                </Button>
            </View>
        );
    }

    return (
        <WebView
            source={{
                uri: `https://cdn.plaid.com/link/v2/stable/link.html?isWebview=true&token=${link_token}`,
            }}
            ref={(ref) => (webviewRef = ref)}
            containerStyle={{
                paddingVertical: 10,
                height: height - 40,
                overflow: "scroll"
            }}
            originWhitelist={['https://*', 'plaidlink://*']}
            onLoadEnd={handleOnEndLoad}
            onShouldStartLoadWithRequest={handleShouldHandleEvent}
        />
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: height - 40
    },
    error: {
        fontSize: 24,
        color: themeDefault.colors.error,
        textAlign: "center",
        marginHorizontal: 10
    },
});
