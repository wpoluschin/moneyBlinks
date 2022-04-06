import React from "react";
import {createStackNavigator} from "@react-navigation/stack";

import {RootStackUnauthenticated} from '../types';
import SignIn from '../src/Security/SignIn';
import SignUp from '../src/Security/SignUp';
import ConfirmAccount from "../src/Security/ConfirmAccount";
import ForgotPassword from "../src/Security/ForgotPassword";
import ForgotPasswordSubmit from "../src/Security/ForgotPasswordSubmit";

const Stack = createStackNavigator<RootStackUnauthenticated>()

export default function UnauthenticatedNav() {

    return (
        <Stack.Navigator
            initialRouteName="SignIn"
            screenOptions={{
                headerShown: false
            }}>
            <Stack.Screen name="SignIn" component={SignIn}/>
            <Stack.Screen name="SignUp" component={SignUp}/>
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="RecoveryPassword" component={ForgotPasswordSubmit} />
            <Stack.Screen name="ConfirmAccount" component={ConfirmAccount} />
        </Stack.Navigator>
    );
}
