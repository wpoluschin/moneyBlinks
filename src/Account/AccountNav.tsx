import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import {Appbar, Avatar} from "react-native-paper";
import {TouchableOpacity} from "react-native";
import {DrawerNavigationProp} from "@react-navigation/drawer";
import {MaterialCommunityIcons} from "@expo/vector-icons";

import {AccountNavigation} from "../../types";
import Account from "./Account";
import {I18n} from "aws-amplify";

const Stack = createStackNavigator<AccountNavigation>();

export default function AccountNav() {
    return (
        <Stack.Navigator
            screenOptions={{
                header: ({scene, previous, navigation}) => {
                    const {options} = scene.descriptor;
                    const title =
                        options.headerTitle !== undefined
                            ? options.headerTitle
                            : options.title !== undefined
                            ? options.title
                            : scene.route.name;

                    return (
                        <Appbar.Header style={{
                            backgroundColor: '#52C1E0'
                        }}>
                            <TouchableOpacity
                                style={{marginLeft: 10}}
                                onPress={() => {
                                    ((navigation as any) as DrawerNavigationProp<{}>).openDrawer();
                                }}>
                                <Avatar.Icon
                                    size={48}
                                    icon={(props) => <MaterialCommunityIcons
                                        name="menu" {...props}/>}
                                    style={{
                                        backgroundColor: '#52C1E0',
                                    }}
                                    color="#FFFFFF"/>
                            </TouchableOpacity>
                            <Appbar.Content
                                title={title}
                                titleStyle={{
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    color: '#FFFF'
                                }}
                            />
                            <TouchableOpacity>
                                <Avatar.Icon
                                    icon="account-circle"
                                    color="#FFFFFF"
                                    style={{
                                        backgroundColor: 'transparent',
                                        zIndex: 1
                                    }}
                                    size={48}/>
                            </TouchableOpacity>
                        </Appbar.Header>
                    );
                },
            }}
            headerMode="screen"
            initialRouteName="Account">
            <Stack.Screen
                name="Account"
                options={{
                    headerTitle: I18n.get('D_ITEM_ACCOUNT')
                }}
                component={Account}/>
        </Stack.Navigator>
    );
}
