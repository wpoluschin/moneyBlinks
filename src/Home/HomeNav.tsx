import React, {useContext, useEffect, useState} from "react";
import {createStackNavigator} from "@react-navigation/stack";
import {Appbar, Avatar, Badge} from "react-native-paper";
import {Dimensions, Image, TouchableOpacity, View} from "react-native";
import {DrawerNavigationProp} from "@react-navigation/drawer";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {I18n} from "aws-amplify";

import {HomeNavigation} from "../../types";
import Home from "./Home";
import HomeBlinkStates from "../../contexts/HomeBlink/HomeBlinkStates";
import SendBlink from "./SendBlink";
import Packages from "./Packages";
import RequestBlink from "./RequestBlink";
import {themeDefault} from "../../constants/Colors";
import RegisterNav from "./Registers/RegisterNav";
import DownloadBlink from "./DownloadBlink";
import CompletedRequestBlink from "./CompletedRequestBlink";
import ConfirmBlink from "./ConfirmBlink";
import NotificationNav from "../../screens/Notifications/NotificationNav";
import HaveCode from "./HaveCode";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import ConfirmStandBy from "./ConfirmStandBy";
import CashMoney from "./CashMoney";
import UpCashMoney from "./UpCashMoney";
import DownCashMoney from "./DownCashMoney";

const {width} = Dimensions.get('window');

const Stack = createStackNavigator<HomeNavigation>();

// @ts-ignore
export default function HomeNav({navigation}) {
    const { notifications, updateNotifications, handleUpdateNotifications }: any = useContext(MBContext);
    const [notificationInt, setNotificationInt] = useState<number>(0);

    useEffect(() => {
        if (notifications || updateNotifications) {
            handleUpdateNotifications(null);
            setNotificationInt(notifications.filter((notification: any) => !notification.isRead).length);
        }
    }, [notifications, updateNotifications]);

    return (
        <HomeBlinkStates>
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
                        const iconRight: string = options.headerBackAccessibilityLabel ?
                            options.headerBackAccessibilityLabel : 'bell';

                        return (
                            <Appbar.Header style={{
                                backgroundColor: '#52C1E0'
                            }}>
                                {previous ? (
                                    <Appbar.BackAction color="#FFFFFF"
                                                       onPress={navigation.goBack}
                                    />
                                ) : (
                                    <TouchableOpacity
                                        style={{marginLeft: 10}}
                                        onPress={() => {
                                            ((navigation as any) as DrawerNavigationProp<{}>).openDrawer();
                                        }}
                                    >
                                        <Avatar.Icon
                                            size={48}
                                            icon={(props) => <MaterialCommunityIcons
                                                name="menu" {...props}/>}
                                            style={{
                                                backgroundColor: '#52C1E0',
                                            }}
                                            color="#FFFFFF"
                                        />
                                    </TouchableOpacity>
                                )}
                                {
                                    scene.route.name === 'Home' && (
                                        <Image source={require('../../assets/images/home-text-mb.png')}
                                               style={{
                                                   width: (width - 120),
                                                   resizeMode: "contain"
                                               }}/>
                                    )
                                }
                                {
                                    scene.route.name !== 'Home' && (
                                        <Appbar.Content
                                            title={title}
                                            titleStyle={{
                                                fontSize: 18,
                                                fontWeight: 'bold',
                                                color: '#FFFFFF'
                                            }}
                                        />
                                    )
                                }
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('NotificationNav')}>
                                    <Avatar.Icon
                                        icon={iconRight}
                                        color="#FFFFFF"
                                        style={{
                                            backgroundColor: 'transparent',
                                            zIndex: 1
                                        }}
                                        size={48}/>
                                    {
                                        notificationInt > 0 && (
                                            <Badge style={{
                                                position: 'absolute',
                                                marginTop: 5,
                                                right: 5,
                                                zIndex: 5,
                                                backgroundColor: themeDefault.colors.error
                                            }}>
                                                {notificationInt}
                                            </Badge>
                                        )
                                    }
                                </TouchableOpacity>
                            </Appbar.Header>
                        );
                    },
                }}
                headerMode="screen"
                initialRouteName="Home">
                <Stack.Screen
                    name="Home"
                    component={Home}/>
                <Stack.Screen
                    name="SendBlink"
                    options={{
                        title: I18n.get('TITLE_SEND_BLINK'),
                        headerBackAccessibilityLabel: 'account-cash'
                    }}
                    component={SendBlink}/>
                <Stack.Screen
                    name="RequestBlink"
                    options={{
                        title: I18n.get('RECEIVED_BLINK_END_TITLE'),
                        headerBackAccessibilityLabel: 'cash'
                    }}
                    component={RequestBlink}/>
                <Stack.Screen
                    name="Packages"
                    options={{
                        title: I18n.get('TITLE_PACKAGES'),
                        headerBackAccessibilityLabel: 'gift'
                    }}
                    component={Packages}/>
                <Stack.Screen name="DownloadBlink"
                              options={{
                                  title: I18n.get('TITLE_DOWNLOAD_BLINK'),
                                  headerBackAccessibilityLabel: 'cash-marker'
                              }}
                              component={DownloadBlink}/>
                <Stack.Screen name="CompletedRequestBlink"
                              options={{
                                  title: I18n.get('TITLE_SEND_REQUEST_BLINK'),
                                  headerBackAccessibilityLabel: 'cash-marker'
                              }}
                              component={CompletedRequestBlink}/>
                <Stack.Screen name="ConfirmStandBy"
                              options={{
                                  title: I18n.get('CONFIRM_ID_TX'),
                                  headerBackAccessibilityLabel: 'cash-marker'
                              }}
                              component={ConfirmStandBy}/>
                <Stack.Screen name="ConfirmBlink"
                              options={{
                                  title: I18n.get('TITLE_SEND_BLINK_CONFIRM'),
                                  headerBackAccessibilityLabel: 'account-cash'
                              }}
                              component={ConfirmBlink}/>
                <Stack.Screen
                    name="NotificationNav"
                    options={{
                        headerShown: false
                    }}
                    component={NotificationNav}/>
                <Stack.Screen
                    name="HaveCode"
                    options={{
                        title: I18n.get('HAVE_CODE'),
                        headerBackAccessibilityLabel: 'code-brackets'
                    }}
                    component={HaveCode}/>
                <Stack.Screen
                    options={{
                        title: I18n.get('CASH_MONEY'),
                        headerBackAccessibilityLabel: 'cash-multiple'
                    }}
                    component={CashMoney}
                    name="CashMoney" />
                <Stack.Screen
                    options={{
                        title: I18n.get('UP_CASH_MONEY'),
                        headerBackAccessibilityLabel: 'cash-multiple'
                    }}
                    component={UpCashMoney}
                    name="UpCashMoney" />
                <Stack.Screen
                    options={{
                        title: I18n.get('DOWN_CASH_MONEY'),
                        headerBackAccessibilityLabel: 'account-cash'
                    }}
                    component={DownCashMoney}
                    name="DownCashMoney" />
                <Stack.Screen
                    name="Register"
                    options={{
                        header: () => (
                            <View style={{
                                paddingVertical: 5,
                                paddingTop: 25,
                                backgroundColor: themeDefault.colors.header,
                                paddingHorizontal: 10
                            }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: themeDefault.colors.header,
                                    paddingTop: 10,
                                }}>
                                    <MaterialCommunityIcons
                                        name='arrow-left' size={28} color='white'
                                        onPress={() => navigation.navigate('Home')}/>
                                    <MaterialCommunityIcons
                                        name='format-list-checks'
                                        size={24} color='white'/>
                                </View>
                            </View>
                        )
                    }}
                    component={RegisterNav}/>
            </Stack.Navigator>
        </HomeBlinkStates>
    );
}
