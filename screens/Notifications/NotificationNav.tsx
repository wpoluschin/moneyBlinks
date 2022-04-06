import React, {useContext, useEffect, useState} from "react";
import {Appbar, Avatar, Badge} from "react-native-paper";
import {TouchableOpacity} from "react-native";
import {DrawerNavigationProp} from "@react-navigation/drawer";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {I18n} from "aws-amplify";
import {createStackNavigator} from "@react-navigation/stack";

import {NotificationNavigation} from "../../types";
import Notification from "./Notification";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import {themeDefault} from "../../constants/Colors";

const Stack = createStackNavigator<NotificationNavigation>();

export default function NotificationNav() {

    const { notifications, updateNotifications, handleUpdateNotifications }: any = useContext(MBContext);

    const [notificationUnread, setNotificationUnread] = useState(0);

    useEffect(() => {
        if (notifications || updateNotifications) {
            handleUpdateNotifications(null);
            setNotificationUnread(notifications.filter((notification: any) => !notification.isRead).length);
        }
    }, [notifications, updateNotifications]);

    return (
        <Stack.Navigator
            screenOptions={{
                header: ({navigation}: any) => {

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
                                title={I18n.get('TITLE_NOTIFICATIONS')}
                                titleStyle={{
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    color: '#FFFF'
                                }}
                            />
                            <TouchableOpacity>
                                {
                                    notificationUnread > 0 && (
                                        <Badge style={{
                                            backgroundColor: themeDefault.colors.error,
                                            position: "absolute",
                                            top: 3,
                                            right: 5,
                                            zIndex: 500
                                        }}>{notificationUnread}</Badge>
                                    )
                                }
                                <Avatar.Icon
                                    icon="bell"
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
            initialRouteName="Notification">
            <Stack.Screen
                name="Notification"
                component={Notification}/>
        </Stack.Navigator>
    );
}
