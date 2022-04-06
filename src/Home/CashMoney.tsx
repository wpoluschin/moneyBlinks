import React from "react";
import {StyleSheet, View} from "react-native";
import {List, Text} from "react-native-paper";
import {I18n} from "aws-amplify";
import {useNavigation} from "@react-navigation/native";

import {mbCommonStyles} from "../../constants/styles";
import {themeDefault} from "../../constants/Colors";

export default function CashMoney() {

    const navigation = useNavigation();


    return (
        <View style={mbCommonStyles.container}>
            <View style={{
                padding: 20
            }}>
                <View style={styles.view}>
                    <Text style={styles.textCashMoney}>
                        {I18n.get('TEXT_CASH_MONEY')}
                    </Text>
                </View>
                <View style={styles.view}>
                    <List.Section>
                        <List.Subheader>{I18n.get('CASH_OPTIONS')}</List.Subheader>
                        <List.Item
                            onPress={() => navigation.navigate('Register', { screen: 'RegisterAccount' })}
                            title={I18n.get('CASH_REGISTERS')}
                            titleStyle={styles.textCashMoney}
                            left={() => <List.Icon icon="cash-register"/>}/>
                        <List.Item
                            onPress={() => navigation.navigate('UpCashMoney')}
                            title={I18n.get('UP_CASH_AMOUNT')}
                            titleStyle={styles.textCashMoney}
                            left={() => <List.Icon color="#000" icon="cash-multiple"/>}
                        />
                        <List.Item
                            onPress={() => navigation.navigate('DownCashMoney')}
                            title={I18n.get('DOWN_CASH_AMOUNT')}
                            titleStyle={styles.textCashMoney}
                            left={() => <List.Icon color="#000" icon="account-cash"/>}
                        />
                        {/*<List.Item*/}
                        {/*    onPress={() => navigation.navigate('DownCashMoney')}*/}
                        {/*    title={I18n.get('PAY_CASH_AMOUNT')}*/}
                        {/*    titleStyle={styles.textCashMoney}*/}
                        {/*    left={() => <List.Icon color="#000" icon="cash-100"/>}*/}
                        {/*/>*/}
                    </List.Section>
                </View>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    view: {
        paddingVertical: 10
    },
    textCashMoney: {
        fontSize: 15,
        color: themeDefault.colors.primary,
        textAlign: "justify"
    }
})
