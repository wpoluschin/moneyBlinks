import React, {useContext, useEffect, useState} from "react";
import {SafeAreaView, ScrollView, StyleSheet, View} from "react-native";

import PaymentMethodContext from "../../contexts/PaymentMethod/PaymentMethodContext";
import {themeDefault} from "../../constants/Colors";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import {Button, Dialog, Divider, List, Paragraph, Portal, Text} from "react-native-paper";
import {API, graphqlOperation, I18n} from "aws-amplify";
import {mbCommonStyles} from "../../constants/styles";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {deleteMBMyPaymentMethod} from "../graphql/mutations";

export default function AccountList() {

    const {
        handleIsBack,
        handleLoadPaymentMethodsList,
        handlePaymentCountries,
        isBack,
        paymentMethods,
        paymentsCountries
    }: any = useContext(PaymentMethodContext);
    const {handleLoading, handleError, mbUser}: any = useContext(MBContext);

    const [accounts, setAccounts] = useState<any[]>([]);
    const [isPermitted, setIsPermitted] = useState<boolean>(true);
    const [visible, setVisible] = useState<boolean>(false);
    const [removeIndex, setRemoveIndex] = useState<number>(-1);

    useEffect(() => {
        async function loadIsAvailability() {
            await handlePaymentCountries(mbUser, 'ACCOUNT', handleLoading, handleError);
        }

        loadIsAvailability();
        loadAccounts();
    }, []);

    useEffect(() => {
        if (isBack) {
            loadAccounts();
        }
    }, [
        isBack
    ]);

    useEffect(() => {
        if (paymentMethods) {
            setAccounts(paymentMethods);
        }
    }, [
        paymentMethods
    ]);

    useEffect(() => {
        if (paymentsCountries !== undefined) {
            setIsPermitted(paymentsCountries && paymentsCountries.length !== 0);
        }
    }, [
        paymentsCountries
    ]);

    async function loadAccounts() {
        await handleLoadPaymentMethodsList(handleLoading, handleError, mbUser);
        handleIsBack(false);
    }

    if (!isPermitted) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{I18n.get('ERROR_METHOD_UNAVAILABILITY')}</Text>
            </View>
        );
    }

    if (isPermitted && accounts.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{I18n.get('ACCOUNT_NOT_FOUND')}</Text>
            </View>
        );
    }

    const hideRemove = () => setVisible(false);

    const removeAccount = async () => {
        handleLoading(true);
        hideRemove();
        try {
            if (removeIndex > -1) {
                const account: any = accounts[removeIndex];
                await API.graphql(graphqlOperation(deleteMBMyPaymentMethod, {
                    input: {
                        id: account.id
                    }
                }));
                await loadAccounts();
            }
        } catch (e) {
            console.log(e.message || e);
        } finally {
            handleLoading(false);
            setRemoveIndex(-1);
        }
    }

    return (
        <SafeAreaView style={{
            ...mbCommonStyles.container,
            ...{
                paddingBottom: 60
            }
        }}>
            <ScrollView style={mbCommonStyles.scrollView}>
                {
                    isPermitted && accounts.length > 0 && (
                        accounts.map((item: any, index) => (
                            <View key={index}>
                                <List.Item
                                    title={item?.label}
                                    description={item?.description}
                                    titleStyle={{
                                        fontSize: 20,
                                        fontWeight: "bold",
                                        color: '#0771B8',
                                    }}
                                    left={() => <List.Icon icon={() => (
                                        <MaterialCommunityIcons name="bank"
                                                                type="material-community" color="#0771B8" size={36}/>
                                    )}/>}
                                    right={
                                        () => <List.Icon
                                            icon={() => (
                                                <MaterialCommunityIcons
                                                    name="delete" type="material-community"
                                                    onPress={() => {
                                                        setRemoveIndex(index);
                                                        setVisible(true);
                                                    }}
                                                    color="#0771B8" size={24}/>
                                            )}
                                            color={themeDefault.colors.primary}/>
                                    }
                                />
                                <Divider style={{backgroundColor: '#0771B8', height: 2, marginHorizontal: 15}}/>
                            </View>
                        ))
                    )
                }
            </ScrollView>
            <Portal>
                <Dialog visible={visible} onDismiss={hideRemove}>
                    <Dialog.Title>{I18n.get('TITLE_REMOVE_CONFIRM')}</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>{I18n.get('TEXT_REMOVE_CONFIRM')}</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={removeAccount}>{I18n.get('BTN_OK')}</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
