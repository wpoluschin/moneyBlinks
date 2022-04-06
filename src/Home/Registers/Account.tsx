import React, {useContext, useEffect, useState} from "react";
import {SafeAreaView, ScrollView, View} from "react-native";
import {API, graphqlOperation, I18n} from "aws-amplify";
import {Divider, Text} from "react-native-paper";

import {mbCommonStyles} from "../../../constants/styles";
import {themeDefault} from "../../../constants/Colors";
import MBContext from "../../../contexts/MoneyBlinks/MBContext";
import HomeBlinkContext from "../../../contexts/HomeBlink/HomeBlinkContext";
import {rewardsPlans} from "../../graphql/mutations";

export default function Account() {

    const {mbUser}: any = useContext(MBContext);

    const {
        amount
    }: any = useContext(HomeBlinkContext);

    const [charges, setCharges] = useState<number>(0);
    const [taxes, setTaxes] = useState<number>(0);
    const [blinkAmounts, setBlinkAmounts] = useState<number>(0);
    const [blinkReceived, setBlinkReceived] = useState<number>(0);
    const [blinkPays, setBlinkPays] = useState<number>(0);
    const [amounts, setAmounts] = useState<number>(0);

    useEffect(() => {
        async function loadData() {
            const {
                data: {
                    rewardsPlans: result
                }
            }: any = await API.graphql(
                graphqlOperation(rewardsPlans, {
                    values: JSON.stringify({
                        type: "MOVEMENTS",
                        userId: mbUser?.id
                    })
                })
            );
            if (result) {
                const response: any = JSON.parse(result);
                if (response.statusCode === 200) {
                    setAmounts(response.result?.collectionAmount);
                    setBlinkAmounts(response.result?.blinkSendsAmount);
                    setBlinkReceived(response.result?.blinkReceivedAmount);
                    setBlinkPays(response.result?.packagesAmount);
                    setTaxes(response.result?.taxesAmount);
                    setCharges(response.result?.chargesAmount);
                }
            }
        }

        loadData();
    }, []);

    return (
        <SafeAreaView style={mbCommonStyles.container}>
            <ScrollView style={mbCommonStyles.scrollView}>
                <View style={{
                    marginTop: 20
                }}>
                    <Text style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: '#97A19A'
                    }}>
                        {I18n.get('MOVEMENTS')}
                    </Text>
                </View>
                <View style={{
                    flexDirection: "row",
                    marginBottom: 30,
                    marginTop: 40,
                    flex: 1
                }}>
                    <Text style={{
                        color: themeDefault.colors.text,
                        flex: 0.6,
                        textAlign: "left",
                        textAlignVertical: "center"
                    }}>
                        {I18n.get('COLLECTIONS_DOWNS')}
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.text,
                        flex: 0.1,
                        textAlign: "left",
                        textAlignVertical: "center"
                    }}>
                        ( + )
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.warn,
                        flex: 0.3,
                        textAlign: "right",
                        textAlignVertical: "center",
                        fontWeight: "bold"
                    }}>
                        $ {amounts.toFixed(2)} {mbUser?.currency}
                    </Text>
                </View>
                <View style={{
                    flexDirection: "row",
                    marginBottom: 30,
                    flex: 1
                }}>
                    <Text style={{
                        color: themeDefault.colors.text,
                        flex: 0.6,
                        textAlign: "left",
                        textAlignVertical: "center"
                    }}>
                        {I18n.get('SEND_BLINKS')}
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.text,
                        flex: 0.1,
                        textAlign: "left",
                        textAlignVertical: "center"
                    }}>
                        ( - )
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.warn,
                        flex: 0.3,
                        textAlign: "right",
                        textAlignVertical: "center",
                        fontWeight: "bold"
                    }}>
                        $ {blinkAmounts.toFixed(2)} {mbUser?.currency}
                    </Text>
                </View>
                <View style={{
                    flexDirection: "row",
                    marginBottom: 30,
                    flex: 1
                }}>
                    <Text style={{
                        color: themeDefault.colors.text,
                        flex: 0.6,
                        textAlign: "left",
                        textAlignVertical: "center"
                    }}>
                        {I18n.get('RECEIPTED_BLINKS')}
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.text,
                        flex: 0.1,
                        textAlign: "left",
                        textAlignVertical: "center"
                    }}>
                        ( + )
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.warn,
                        flex: 0.3,
                        textAlign: "right",
                        textAlignVertical: "center",
                        fontWeight: "bold"
                    }}>
                        $ {blinkReceived.toFixed(2)} {mbUser?.currency}
                    </Text>
                </View>
                <View style={{
                    flexDirection: "row",
                    marginBottom: 30,
                    flex: 1
                }}>
                    <Text style={{
                        color: themeDefault.colors.text,
                        flex: 0.6,
                        textAlign: "left",
                        textAlignVertical: "center"
                    }}>
                        {I18n.get('PACKAGES_PAYS')}
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.text,
                        flex: 0.1,
                        textAlign: "left",
                        textAlignVertical: "center"
                    }}>
                        ( - )
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.warn,
                        flex: 0.3,
                        textAlign: "right",
                        textAlignVertical: "center",
                        fontWeight: "bold"
                    }}>
                        $ {blinkPays.toFixed(2)} {mbUser?.currency}
                    </Text>
                </View>
                <View style={{
                    flexDirection: "row",
                    marginBottom: 30,
                    flex: 1
                }}>
                    <Text style={{
                        color: themeDefault.colors.text,
                        flex: 0.6,
                        textAlign: "left",
                        textAlignVertical: "center"
                    }}>
                        {I18n.get('CHARGES_PAY')}
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.text,
                        flex: 0.1,
                        textAlign: "left",
                        textAlignVertical: "center"
                    }}>
                        ( - )
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.warn,
                        flex: 0.3,
                        textAlign: "right",
                        textAlignVertical: "center",
                        fontWeight: "bold"
                    }}>
                        $ {charges.toFixed(2)} {mbUser?.currency}
                    </Text>
                </View>
                <View style={{
                    flexDirection: "row",
                    marginBottom: 30,
                    flex: 1
                }}>
                    <Text style={{
                        color: themeDefault.colors.text,
                        flex: 0.6,
                        textAlign: "left",
                        textAlignVertical: "center"
                    }}>
                        {I18n.get('TAXES_PAY')}
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.text,
                        flex: 0.1,
                        textAlign: "left",
                        textAlignVertical: "center"
                    }}>
                        ( - )
                    </Text>
                    <Text style={{
                        color: themeDefault.colors.warn,
                        flex: 0.3,
                        textAlign: "right",
                        textAlignVertical: "center",
                        fontWeight: "bold"
                    }}>
                        $ {taxes.toFixed(2)} {mbUser?.currency}
                    </Text>
                </View>
                <Divider style={{
                    marginVertical: 30,
                    height: 2
                }} />
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between"
                    }}>
                    <Text style={{
                        flex: 0.4,
                        color: '#97A19A',
                        fontWeight: "bold",
                        fontSize: 20,
                        marginRight: 10,
                        textAlign: "right",
                        textTransform: "uppercase",
                        textAlignVertical: "center"
                    }}>
                        {I18n.get('AMOUNT_TOTAL')}
                    </Text>
                    <Text style={{
                        flex: 0.5,
                        color: themeDefault.colors.warn,
                        marginLeft: 10,
                        fontWeight: "bold",
                        fontSize: 24,
                        textAlign: "left",
                        textTransform: "uppercase",
                        textAlignVertical: "center",
                        flexDirection: "row",
                    }}>
                        $ {amount?.toFixed(2)} {mbUser?.currency}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
