import React, {useContext, useEffect} from "react";
import {SafeAreaView, ScrollView, TouchableOpacity, View} from "react-native";
import {Text} from "react-native-paper";
import moment from "moment";
import {API} from "@aws-amplify/api";
import {graphqlOperation} from "aws-amplify";
import {useNavigation} from "@react-navigation/native";

import {themeDefault} from "../../constants/Colors";
import {mbCommonStyles} from "../../constants/styles";
import MBContext from "../../contexts/MoneyBlinks/MBContext";

import {updateMBNotification} from "../../src/graphql/mutations";
import {navigateToRouteBlink} from "../../functions/functions";
import HomeBlinkContext from "../../contexts/HomeBlink/HomeBlinkContext";
import {getMBTransaction} from "../../src/graphql/queries";

export default function Notification() {
    const navigation = useNavigation();
    const { handleLoading, mbUser, notifications,handleNotifications, handleUpdateNotifications }: any = useContext(MBContext);
    const { handleMoveTx }: any = useContext(HomeBlinkContext);

    useEffect(() => {
        async function loadNotifications() {
            await handleNotifications(mbUser);
        }

        loadNotifications();
    }, []);

    const onReadNotification = async (notification: any, index: number) => {
        handleLoading(true);
        try {
            if (!notification.isRead) {
                await API.graphql(graphqlOperation(updateMBNotification, {
                    input: {
                        id: notification?.id,
                        isRead: true
                    }
                }));
                notifications[index].isRead = true;
                handleUpdateNotifications(true);
            }
            if (notification.data) {
                const data = JSON.parse(JSON.parse(notification.data));
                if (data && data?.read) {
                    const {
                        data: {
                            getMBTransaction: tx
                        }
                    }: any = await API.graphql(graphqlOperation(getMBTransaction, {
                        id: data?.txId
                    }));
                    handleMoveTx(tx);
                    navigateToRouteBlink(tx, mbUser, navigation);
                }
            }
        } catch (e) {

        } finally {
            handleLoading(false);
        }
    }

    return (
        <SafeAreaView style={mbCommonStyles.container}>
            <ScrollView style={mbCommonStyles.scrollView}>
                {
                    notifications &&
                    notifications.map((notification: any, index: number) => {
                        return (
                            <TouchableOpacity key={index}
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    borderColor: themeDefault.colors.primary,
                                    padding: 5,
                                    marginVertical: 5
                                }}
                                onPress={() => onReadNotification(notification, index)}>
                                <View style={{
                                    flex: 0.7,
                                    alignSelf: "flex-start",
                                    flexDirection: "column"
                                }}>
                                    <Text style={{
                                        fontWeight: !notification?.isRead ? 'bold' : 'normal',
                                        fontFamily: !notification?.isRead ? 'Roboto-Bold' : 'Roboto',
                                        textAlign: "left",
                                        textAlignVertical: "center"
                                    }}>
                                        {notification?.title}
                                    </Text>
                                    <Text style={{
                                        fontWeight: !notification?.isRead ? 'bold' : 'normal',
                                        fontFamily: !notification?.isRead ? 'Roboto-Bold' : 'Roboto',
                                        textAlign: "justify",
                                        textAlignVertical: "center",
                                        fontStyle: "italic"
                                    }}>
                                        {notification?.message}
                                    </Text>
                                </View>
                                <View style={{
                                    flex: 0.3,
                                    alignSelf: "flex-end",
                                    flexDirection: "column"
                                }}>
                                    <Text style={{
                                        textAlign: "right",
                                        textAlignVertical: "center"
                                    }}>
                                        {moment(notification?.createdAt).format('L')}
                                    </Text>
                                    <Text style={{
                                        textAlign: "right",
                                        textAlignVertical: "center"
                                    }}>
                                        {moment(notification?.createdAt).format('LTS')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
            </ScrollView>
        </SafeAreaView>
    );
}
