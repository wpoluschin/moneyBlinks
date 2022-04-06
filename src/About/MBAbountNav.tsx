import React from "react";
import {Dimensions, Image, Linking, TouchableOpacity, View} from "react-native";
import {createStackNavigator} from "@react-navigation/stack";
import {Appbar, Avatar, Text} from "react-native-paper";
import {DrawerNavigationProp} from "@react-navigation/drawer";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {I18n} from "aws-amplify";
import Constants from 'expo-constants';

import {mbCommonStyles} from "../../constants/styles";
import {themeDefault} from "../../constants/Colors";

const {height} = Dimensions.get('window');

const AboutNav = createStackNavigator();

const About = () => {

    const openTermConditions = async () => {
        await Linking.openURL('https://www.moneyblinks.com/terms-condition');
    }

    const openPolitics = async () => {
        await Linking.openURL('https://www.moneyblinks.com/politics');
    }

    return (
        <View style={{
            ...mbCommonStyles.container,
            ...{
                paddingHorizontal: 10,
                paddingTop: 20
            }
        }}>
            <Image
                source={require('../../assets/images/about-us.png')}
                style={{
                    resizeMode: "contain",
                    width: '100%',
                    flex: 0.5
                }}/>
            <View style={{
                alignContent: "center",
                marginTop: 20,
            }}>
                <Text style={{
                    color: themeDefault.colors.primary,
                    textTransform: 'uppercase',
                    fontWeight: "bold",
                    fontSize: 20,
                    textAlign: "center",
                }}>
                    {`${I18n.get('TEXT_VERSION')} ${Constants?.manifest?.version}`}
                </Text>
            </View>
            <View style={{
                alignContent: "center"
            }}>
                <Text style={{
                    color: themeDefault.colors.primary,
                    fontWeight: "bold",
                    fontSize: 20,
                    textAlign: "center",
                }}>
                    {I18n.get('ALL_RIGHT')}
                </Text>
            </View>
            <View style={{
                justifyContent: "center",
                marginTop: 0,
                flexDirection: "column"
            }}>
                <TouchableOpacity onPress={() => openTermConditions()}>
                    <Text style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        marginTop: 40,
                        fontSize: 24,
                        color: themeDefault.colors.primary
                    }}>{I18n.get('TERMS_CONDITIONS')}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => openPolitics()}>
                    <Text style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        marginTop: 40,
                        fontSize: 24,
                        color: themeDefault.colors.primary
                    }}>{I18n.get('POLITICS_TERMS')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// @ts-ignore
export default function MBAboutNav(props: any) {

    return (
        <AboutNav.Navigator
            {...props}
            initialRouteName="MBAbout"
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
                                title={I18n.get('D_ITEM_ABOUT_US')}
                                titleStyle={{
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    color: '#FFFF'
                                }}
                            />
                            <Avatar.Image {...props}
                                          size={32}
                                          style={{
                                              backgroundColor: 'transparent',
                                              margin: 6
                                          }}
                                          source={require('../../assets/images/about-us.png')}/>
                        </Appbar.Header>
                    );
                },
            }}>
            <AboutNav.Screen name="MBAbout"
                             component={About}/>
        </AboutNav.Navigator>
    );
}
