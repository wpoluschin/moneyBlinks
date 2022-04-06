import React, {Fragment} from "react";
import {TouchableOpacity} from "react-native";
import {I18n} from "aws-amplify";
import {Appbar, Avatar, FAB, Portal} from "react-native-paper";
import {DrawerNavigationProp} from "@react-navigation/drawer";
import {getFocusedRouteNameFromRoute, useIsFocused} from "@react-navigation/native";
import {createMaterialBottomTabNavigator} from "@react-navigation/material-bottom-tabs";
import {createStackNavigator} from "@react-navigation/stack";

import {themeDefault} from "../../constants/Colors";
import PaymentMethodStates from "../../contexts/PaymentMethod/PaymentMethodStates";
import PaymentForm from "./PaymentForm";
import CardList from "./CardList";
import AccountList from "./AccountList";

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

function getHeaderTitle(route: any) {
    let title: string;
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'CardList';
    switch (routeName) {
        case 'CardList':
            title = `${I18n.get('HEADER_CARD_TITLE')}`;
            break;
        case 'AccountList':
            title = `${I18n.get('HEADER_ACCOUNTS_TITLE')}`;
            break;
        case 'PaymentCardAdd':
            title = `${I18n.get('HEADER_ADD_CARD_TITLE')}`;
            break;
        default:
            title = `${I18n.get('HEADER_CARD_TITLE')}`;
            break
    }
    return title;
}

function getIconRight(route: any) {
    let icon: string;
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'CardList';
    switch (routeName) {
        case 'AccountList':
            icon = 'bank'
            break;
        case 'PaymentCardAdd':
            icon = 'credit-card-plus';
            break;
        default:
            icon = 'credit-card-multiple';
            break;
    }
    return <Avatar.Icon icon={icon} color="#FFFFFF" size={36} style={{
        backgroundColor: themeDefault.colors.header
    }}/>
}

function getIconPlus(route: any): string {
    let icon: string;
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'CardList';
    switch (routeName) {
        case 'AccountList':
            icon = 'bank-plus';
            break;
        default:
            icon = 'credit-card-plus';
            break;
    }
    return icon;
}

function getRouteAdd(route: any): string {
    let routeAdd: string;
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'CardList';
    switch (routeName) {
        case 'AccountList':
            routeAdd = 'PaymentAccountAdd';
            break;
        default:
            routeAdd = 'PaymentCardAdd';
            break;
    }
    return routeAdd;
}

// @ts-ignore
const PaymentMethodNav = ({route, navigation}) => {
    const isFocused = useIsFocused();

    return (
        <Fragment>
            <Tab.Navigator
                sceneAnimationEnabled={false}
                inactiveColor={themeDefault.colors.btnDisabled}
                activeColor="#FFFFFF">
                <Tab.Screen name="CardList"
                            options={{
                                tabBarIcon: 'credit-card-multiple',
                                tabBarLabel: I18n.get('HEADER_CARD_TITLE')
                            }}
                            component={CardList}/>
                <Tab.Screen name="AccountList"
                            options={{
                                tabBarIcon: 'bank',
                                tabBarLabel: I18n.get('HEADER_ACCOUNTS_TITLE')
                            }}
                            component={AccountList}/>
            </Tab.Navigator>
            <Portal>
                <FAB visible={isFocused}
                     icon={getIconPlus(route)}
                     style={{
                         position: 'absolute',
                         backgroundColor: themeDefault.colors.primary,
                         bottom: 65,
                         right: 16,
                     }}
                     color="#FFFFFF"
                     onPress={() => {
                         const routeName: string = getRouteAdd(route);
                         navigation.navigate(routeName);
                     }}/>
            </Portal>
        </Fragment>
    );
}

export default function PaymentNav() {

    return (
        <PaymentMethodStates>
            <Stack.Navigator
                headerMode="screen"
                screenOptions={{
                    header: ({scene, previous, navigation}) => {
                        const {options} = scene?.descriptor;
                        const title = options?.headerTitle ?
                            options.headerTitle : options?.title ?
                                options.title : scene?.route?.name;

                        const iconRight: any = options.headerRight || null;
                        // @ts-ignore
                        return (
                            <Appbar.Header
                                theme={{colors: {primary: themeDefault.colors.header}}}>
                                {previous ? (
                                    <Appbar.BackAction
                                        onPress={navigation.goBack}
                                        color={themeDefault.colors.surface}
                                    />
                                ) : (
                                    <TouchableOpacity
                                        style={{marginLeft: 10}}
                                        onPress={() => {
                                            ((navigation as any) as DrawerNavigationProp<{}>).openDrawer();
                                        }}
                                    >
                                        <Avatar.Icon icon="menu" size={48} style={{
                                            backgroundColor: 'transparent'
                                        }}/>
                                    </TouchableOpacity>
                                )}
                                <Appbar.Content
                                    titleStyle={{
                                        fontSize: 22,
                                        color: themeDefault.colors.surface,
                                    }}
                                    title={title}/>
                                {
                                    iconRight ? iconRight()
                                        : (
                                            <Avatar.Icon icon="credit-card-multiple"
                                                         color="#FFFFFF"
                                                         style={{
                                                             backgroundColor: themeDefault.colors.header
                                                         }}
                                                         size={36}/>
                                        )
                                }
                            </Appbar.Header>
                        )
                    }
                }}>
                <Stack.Screen name="PaymentsList"
                              options={({route}) => ({
                                  headerTitle: getHeaderTitle(route),
                                  headerRight: () => getIconRight(route),
                              })}
                              component={PaymentMethodNav}/>
                <Stack.Screen name="PaymentCardAdd"
                              options={() => ({
                                  headerTitle: I18n.get('HEADER_ADD_CARD_TITLE'),
                                  headerRight: () =>
                                      <Avatar.Icon
                                          icon='credit-card-plus'
                                          color="#FFFFFF"
                                          size={36}
                                          style={{
                                              backgroundColor: themeDefault.colors.header
                                          }}/>,
                              })}
                              component={PaymentForm}/>
                <Stack.Screen name="PaymentAccountAdd"
                              options={() => ({
                                  headerTitle: I18n.get('HEADER_ADD_ACCOUNT_TITLE'),
                                  headerRight: () =>
                                      <Avatar.Icon
                                          icon='bank-plus'
                                          color="#FFFFFF"
                                          size={36}
                                          style={{
                                              backgroundColor: themeDefault.colors.header
                                          }}/>,
                              })}
                              component={PaymentForm}/>
            </Stack.Navigator>
        </PaymentMethodStates>
    );
}
