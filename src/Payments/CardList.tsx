import React, {useContext, useState} from "react";
import {SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {Text} from "react-native-paper";
import {I18n} from "aws-amplify";


import {mbCommonStyles} from "../../constants/styles";
import {themeDefault} from "../../constants/Colors";
import MBContext from "../../contexts/MoneyBlinks/MBContext";

export default function CardList() {

    const { handleLoading }: any = useContext(MBContext);
    const [isPermitted, setIsPermitted] = useState(false);
    const [cards, setCards] = useState<any[]>([]);

    if (!isPermitted) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{I18n.get('ERROR_METHOD_UNAVAILABILITY')}</Text>
            </View>
        );
    }

    if (isPermitted && cards.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{I18n.get('CARDS_NOT_FOUND')}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={mbCommonStyles.container}>
            <ScrollView style={mbCommonStyles.scrollView}>
            </ScrollView>
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
