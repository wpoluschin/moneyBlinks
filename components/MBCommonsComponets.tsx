import React from "react";
import {View} from "react-native";
import {Divider, Text} from "react-native-paper";


// @ts-ignore
export function MBDividerText({text, textColor}) {
    return (
        <View style={{
            width: '100%',
            flexDirection: "row",
            alignItems: 'center',
            justifyContent: "space-between",
            padding: 10
        }}>
            <Divider style={{width: '40%'}}/>
            <Text style={{
                width: '20%',
                textAlign: "center",
                color: textColor ? textColor : '#97A19A'
            }}>{text}</Text>
            <Divider style={{width: '40%'}}/>
        </View>
    );
}
