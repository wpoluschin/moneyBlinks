import React, {useContext, useEffect} from "react";
import {Image, View} from "react-native";
import {Camera} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import MBContext from "../../contexts/MoneyBlinks/MBContext";

export default function MBInitialized() {
    const { handleAuthenticatedUser }: any = useContext(MBContext);

    useEffect(() => {
        async function isAuthenticated() {
            await handleAuthenticatedUser();
        }

        isAuthenticated();
    }, []);

    useEffect(() => {
        async function loadPermissions() {
            await Camera.requestPermissionsAsync();
            await MediaLibrary.requestPermissionsAsync();
            await Notifications.requestPermissionsAsync();
            await Location.requestForegroundPermissionsAsync();
        }

        loadPermissions();
    }, []);

    return (
        <View style={{
            flex: 1,
            justifyContent: "center",
            alignContent: "center",
            paddingHorizontal: 10
        }}>
            <Image source={require('../../assets/images/icon.png')} style={{
                resizeMode: "contain",
                width: "100%"
            }}/>
        </View>
    );
}
