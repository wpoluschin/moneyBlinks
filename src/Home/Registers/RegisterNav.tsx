import React from "react";
import {createMaterialTopTabNavigator} from "@react-navigation/material-top-tabs";
import {I18n} from "aws-amplify";
import {Image} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";

import {themeDefault} from "../../../constants/Colors";
import Register from "./Register";
import Account from "./Account";
import Status from "./Status";

const TabNav = createMaterialTopTabNavigator();

export default function RegisterNav() {

    return (
        <TabNav.Navigator
            tabBarOptions={{
                activeTintColor: '#FFFFFF',
                inactiveTintColor: '#EEEEEE',
                showIcon: true,
                showLabel: true,
                style: {
                    backgroundColor: themeDefault.colors.header
                }
            }}
            initialRouteName="Registers">
            <TabNav.Screen
                name="Registers"
                options={{
                    tabBarLabel: I18n.get('TITLE_HEADER_LIST_TX'),
                    tabBarIcon: ({color}) => (
                        <Image
                            source={require('../../../assets/images/about-us.png')}
                            style={{
                                width: 25,
                                height: 25
                            }}/>
                    )
                }}
                component={Register}/>
            <TabNav.Screen
                name="RegisterAccount"
                options={{
                    tabBarLabel: I18n.get('TITLE_HEADER_LIST_ACCOUNT'),
                    tabBarIcon: ({color}) => (
                        <MaterialCommunityIcons
                            name="file-restore"
                            color={color}
                            size={25}/>
                    )
                }}
                component={Account}/>
            <TabNav.Screen
                name="Status"
                options={{
                    tabBarLabel: I18n.get('TITLE_HEADER_LIST_STATUS'),
                    tabBarIcon: ({color}) => (
                        <MaterialCommunityIcons
                            name="check-underline-circle"
                            color={color}
                            size={25}/>
                    )
                }}
                component={Status}/>
        </TabNav.Navigator>
    );
}
