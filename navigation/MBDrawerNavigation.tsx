import React, {useContext, useEffect, useState} from "react";
import {DrawerContentScrollView, DrawerItem} from "@react-navigation/drawer";
import {Avatar, Card, Drawer, Text} from "react-native-paper";
import Animated from 'react-native-reanimated';
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {I18n, Storage} from "aws-amplify";
import * as MailComposer from 'expo-mail-composer';
import {Dimensions, StyleSheet, View} from "react-native";

const { height } = Dimensions.get("window");

import MBContext from "../contexts/MoneyBlinks/MBContext";
import {themeDefault} from "../constants/Colors";

// @ts-ignore
export default function MBDrawerNavigation(props) {

    const { navigation } = props;

    const { handleLogout, mbUser }: any = useContext(MBContext);
    const [imageProfile, setImageProfile] = useState<any>(null);

    useEffect(() => {
        async function loadImage(imageLoad: string) {
            const image: any = await Storage.get(imageLoad, {
                level: 'public'
            });

            setImageProfile(image);
        }
        if (mbUser?.avatarUrl) {
            loadImage(mbUser.avatarUrl);
        }
    }, [mbUser]);

    const onLogout = async () => {
        try {
            await handleLogout();
        } catch (e) {
            console.log('Logout Error', e);
        }
    }

    return (
        <DrawerContentScrollView {...props} style={{
            height,
            flexDirection: "column",
            alignContent: "space-between"
        }}>
            <Animated.View style={[
                styles.drawerContent,
                {
                    backgroundColor: '#FFFFFF',
                    // transform: [{translateX}]
                }
            ]}>
                <View style={styles.userInfoSection}>
                    {
                        !imageProfile ? (
                            <Avatar.Image
                                style={{
                                    backgroundColor: 'transparent'
                                }}
                                source={require('../assets/images/profile.png')} size={100}/>
                        ) : (
                            <Avatar.Image source={{uri: imageProfile}} size={100}/>
                        )
                    }
                    <Card
                        style={{
                            backgroundColor: 'transparent',
                            borderWidth: 0,
                            elevation: 0,
                        }}>
                        <Card.Title
                            title={`@${mbUser?.nickname}`}
                            subtitle={mbUser?.fullName}
                            titleStyle={styles.email}
                            subtitleStyle={styles.name}
                            style={{
                                marginVertical: 0,
                                paddingVertical: 0
                            }}
                        />
                        <Card.Content style={{marginVertical: 0, paddingVertical: 0}}>
                            <Text style={{
                                ...styles.email,
                                ...{
                                    paddingVertical: 0,
                                    marginVertical: 0,
                                    lineHeight: 15
                                }
                            }}>{mbUser?.email}</Text>
                        </Card.Content>
                    </Card>
                </View>
                <Drawer.Section style={styles.drawerSection}>
                    <DrawerItem
                        icon={(props) => (
                            <Avatar.Icon icon={({color, size}) => <MaterialCommunityIcons name="home" color={color}
                                                                                          size={size}/>}
                                         {...props}
                                         color={themeDefault.colors.primary}
                                         size={44}
                                         style={{
                                             backgroundColor: '#FFFFFF',
                                         }}/>
                        )}
                        activeBackgroundColor="#FFFFFF"
                        activeTintColor={themeDefault.colors.disabled}
                        labelStyle={styles.labelStyle}
                        label={I18n.get('D_ITEM_HOME')}
                        onPress={() => navigation?.navigate('Home')}
                    />
                    <DrawerItem
                        icon={(props) => (
                            <Avatar.Icon
                                icon={({color, size}) => <MaterialCommunityIcons name="account-circle" color={color}
                                                                                 size={size}/>}
                                {...props}
                                color={themeDefault.colors.primary}
                                size={44}
                                style={{
                                    backgroundColor: '#FFFFFF'
                                }}/>
                        )}
                        activeBackgroundColor="#FFFFFF"
                        activeTintColor={themeDefault.colors.disabled}
                        labelStyle={styles.labelStyle}
                        label={I18n.get('D_ITEM_ACCOUNT')}
                        onPress={() => navigation?.navigate('AccountNav')}
                    />
                    <DrawerItem
                        icon={(props) => (
                            <Avatar.Icon icon={({color, size}) => <MaterialCommunityIcons name="cash-multiple" color={color}
                                                                                          size={size}/>}
                                         {...props}
                                         color={themeDefault.colors.primary}
                                         size={44}
                                         style={{
                                             backgroundColor: '#FFFFFF'
                                         }}/>
                        )}
                        activeBackgroundColor="#FFFFFF"
                        activeTintColor={themeDefault.colors.disabled}
                        labelStyle={styles.labelStyle}
                        label={I18n.get('D_ITEM_PAYMENT_METHOD')}
                        onPress={() => navigation?.navigate('PaymentNav')}
                    />
                    <DrawerItem
                        icon={(props) => (
                            <Avatar.Icon icon={({color, size}) => <MaterialCommunityIcons name="cogs" color={color}
                                                                                          size={size}/>}
                                         {...props}
                                         color={themeDefault.colors.primary}
                                         size={44}
                                         style={{
                                             backgroundColor: '#FFFFFF'
                                         }}/>
                        )}
                        activeBackgroundColor="#FFFFFF"
                        activeTintColor={themeDefault.colors.disabled}
                        labelStyle={styles.labelStyle}
                        label={I18n.get('D_ITEM_SETTINGS')}
                        onPress={() => navigation?.navigate('SettingsNav')}
                    />
                    <DrawerItem
                        icon={(props) => (
                            <Avatar.Icon icon={({color, size}) => <MaterialCommunityIcons name="forum" color={color}
                                                                                          size={size}/>}
                                         {...props}
                                         color={themeDefault.colors.primary}
                                         size={44}
                                         style={{
                                             backgroundColor: '#FFFFFF'
                                         }}/>
                        )}
                        activeBackgroundColor="#FFFFFF"
                        activeTintColor={themeDefault.colors.disabled}
                        labelStyle={styles.labelStyle}
                        label={I18n.get('D_ITEM_CONTACT_US')}
                        onPress={() => {
                            (async () => {
                                const isMailComposer = await MailComposer.isAvailableAsync();
                                if (isMailComposer) {
                                    await MailComposer.composeAsync({
                                        recipients: [
                                            'soporte@moneyblinks.com',
                                        ],
                                        bccRecipients: [
                                            'ti.support@moneyblinks.com'
                                        ],
                                        subject: I18n.get('SUPPORT_SUBJECT_CONTACT')
                                    });
                                }
                            })();
                        }}
                    />
                    {/*<DrawerItem*/}
                    {/*    icon={(props) => (*/}
                    {/*        <Avatar.Icon icon={({color, size}) => <MaterialCommunityIcons name="help-box" color={color}*/}
                    {/*                                                                      size={size}/>}*/}
                    {/*                     {...props}*/}
                    {/*                     color={themeDefault.colors.primary}*/}
                    {/*                     size={44}*/}
                    {/*                     style={{*/}
                    {/*                         backgroundColor: '#FFFFFF'*/}
                    {/*                     }}/>*/}
                    {/*    )}*/}
                    {/*    activeBackgroundColor="#FFFFFF"*/}
                    {/*    activeTintColor={themeDefault.colors.disabled}*/}
                    {/*    labelStyle={styles.labelStyle}*/}
                    {/*    label={I18n.get('D_ITEM_HELP')}*/}
                    {/*    onPress={() => navigation?.navigate('HelpNav')}*/}
                    {/*/>*/}
                    <DrawerItem
                        icon={(props) => (
                            <Avatar.Image {...props}
                                          size={32}
                                          style={{
                                              backgroundColor: 'transparent',
                                              margin: 6
                                          }}
                                          source={require('../assets/images/about-us.png')}/>
                        )}
                        activeBackgroundColor="#FFFFFF"
                        activeTintColor={themeDefault.colors.disabled}
                        labelStyle={styles.labelStyle}
                        label={I18n.get('D_ITEM_ABOUT_US')}
                        onPress={() => navigation?.navigate('AboutNav')}
                    />
                </Drawer.Section>
            </Animated.View>
            <Drawer.Section style={styles.bottomDrawerSection}>
                <DrawerItem
                    icon={(props) => (
                        <Avatar.Icon icon={({color, size}) => <MaterialCommunityIcons name="exit-to-app" color={color}
                                                                                      size={size}/>}
                                     {...props}
                                     color={themeDefault.colors.primary}
                                     size={44}
                                     style={{
                                         backgroundColor: '#FFFFFF'
                                     }}/>
                    )}
                    activeBackgroundColor="#FFFFFF"
                    activeTintColor={themeDefault.colors.disabled}
                    labelStyle={styles.labelStyle}
                    label={I18n.get('LOGOUT')}
                    onPress={onLogout}/>
            </Drawer.Section>
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1
    },
    userInfoSection: {
        padding: 20,
        paddingBottom: 0,
        paddingRight: 5,
        paddingTop: 60,
        marginTop: -40,
        color: '#FFFFFF',
        backgroundColor: '#52C1E0',

    },
    drawerSection: {
        padding: 0,
        margin: 0
    },
    bottomDrawerSection: {
        borderTopColor: '#f4f4f4'
    },
    labelStyle: {
        fontSize: 18,
        fontWeight: "bold",
        color: '#0771B8',
        paddingLeft: 0,
        marginLeft: 0
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: '#FFFFFF'
    },
    email: {
        fontSize: 16,
        color: '#FFFFFF'
    },
})
