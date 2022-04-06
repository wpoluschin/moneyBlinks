/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import React, {useContext, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from "@react-navigation/drawer";
import {Dimensions, StyleSheet} from "react-native";

import {RootDrawerNavParams} from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import {StatusLoginType} from "../functions/enums";
import MBContext from "../contexts/MoneyBlinks/MBContext";
import MBInitialized from "../src/mbscreens/MBInitialized";
import UnauthenticatedNav from "./UnauthenticatedNav";
import NotFoundScreen from "../screens/NotFoundScreen";
import HomeNav from "../src/Home/HomeNav";
import MBDrawerNavigation from "./MBDrawerNavigation";
import AccountNav from "../src/Account/AccountNav";
import PaymentNav from "../src/Payments/PaymentNav";
import MBAboutNav from "../src/About/MBAbountNav";
import MBHelpNav from "../src/Help/MBHelpNav";
import MBSettingsNav from "../src/Settings/MBSettingsNav";


export default function Navigation() {
    const { updatedAuthType, handleAuthenticatedUser }: any = useContext(MBContext);

    return (
        <NavigationContainer
            linking={LinkingConfiguration}>
            {
                updatedAuthType === StatusLoginType.INITIALIZED &&
                <MBInitialized/>
            }
            {
                updatedAuthType === StatusLoginType.LOGGED_IN &&
                <RootNavigator/>
            }
            {
                updatedAuthType === StatusLoginType.LOGGED_OUT &&
                <UnauthenticatedNav/>
            }
        </NavigationContainer>
    );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Drawer = createDrawerNavigator<RootDrawerNavParams>();
const { width } = Dimensions.get("window");

// @ts-ignore
function RootNavigator() {
    return (
        <Drawer.Navigator
            drawerStyle={styles.drawerNavigator}
            drawerContent={screenProps => <MBDrawerNavigation {...screenProps}/>}>
            <Drawer.Screen
                name="HomeNav" component={HomeNav}/>
            <Drawer.Screen
                name="AccountNav" component={AccountNav}/>
            <Drawer.Screen
                name="PaymentNav" component={PaymentNav}/>
            <Drawer.Screen
                name="AboutNav" component={MBAboutNav}/>
            <Drawer.Screen
                name="HelpNav" component={MBHelpNav}/>
            <Drawer.Screen
                name="SettingsNav" component={MBSettingsNav}/>
            <Drawer.Screen name="NotFound" component={NotFoundScreen} options={{title: 'Oops!'}}/>
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    drawerNavigator: {
        width: width * 0.85
    }
})
