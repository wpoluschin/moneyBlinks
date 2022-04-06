import React from "react";
import {SafeAreaView, ScrollView, TouchableOpacity, View} from "react-native";
import {Appbar, Avatar} from "react-native-paper";
import {DrawerNavigationProp} from "@react-navigation/drawer";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {I18n} from "aws-amplify";
import {createStackNavigator} from "@react-navigation/stack";
import {mbCommonStyles} from "../../constants/styles";
import {themeDefault} from "../../constants/Colors";

const HelpNav = createStackNavigator();



const Help = () => {

    return (
        <SafeAreaView style={mbCommonStyles.container}>
            <ScrollView style={mbCommonStyles.scrollView}>

            </ScrollView>
        </SafeAreaView>
    );
}

// @ts-ignore
export default function MBHelpNav(props: any) {

    return (
        <HelpNav.Navigator
            {...props}
            initialRouteName="MBHelp"
            headerMode="screen"
            screenOptions={{
                header: ({navigation}) => {
                    return (
                        <Appbar.Header style={{
                            backgroundColor: '#52C1E0'
                        }}>

                            <TouchableOpacity
                                style={{marginLeft: 10}}
                                onPress={() => {
                                    ((navigation as any) as DrawerNavigationProp<{}>).openDrawer();
                                }}
                            >
                                <Avatar.Icon
                                    size={48}
                                    icon={({size, color}) => <MaterialCommunityIcons name="menu" size={size}
                                                                                     color={color}/>}
                                    style={{
                                        backgroundColor: '#52C1E0',
                                    }}
                                    color="#FFFFFF"
                                />
                            </TouchableOpacity>
                            <Appbar.Content
                                title={I18n.get('D_ITEM_HELP')}
                                titleStyle={{
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    color: '#FFFF'
                                }}
                            />
                            <Avatar.Icon
                                icon={({color, size}) => <MaterialCommunityIcons name="help-box" color={color}
                                                                                 size={size}/>}
                                color="#FFFFFF" style={{
                                backgroundColor: themeDefault.colors.header
                            }} size={48}/>
                        </Appbar.Header>
                    );
                },
            }}>
            <HelpNav.Screen name="MBHelp"
                                component={Help}/>
        </HelpNav.Navigator>
    );
}
