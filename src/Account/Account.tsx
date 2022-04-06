import React, {Fragment, useContext, useEffect, useState} from "react";
import * as Localization from "expo-localization";
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {I18n, Storage} from "aws-amplify";
import {Formik} from "formik";
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from "expo-image-picker";
import moment from 'moment';
import MapView, {MapEvent, Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {Avatar, Button, Dialog, FAB, HelperText, Paragraph, Portal, Text, TextInput} from "react-native-paper";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
// @ts-ignore
import * as mime from 'react-native-mime-types';

import {
    detectAddress,
    detectLocation,
    getStringAddress,
    getStringFullAddress,
    loadMoneyBlinksCountries,
    nameOfImageFromUri,
    statesOfUSA
} from "../../functions/functions";
import {themeDark, themeDefault} from "../../constants/Colors";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import {mbCommonStyles} from "../../constants/styles";
import {ImageType, MBDevice} from "../../functions/enums";

const {locale} = Localization;

const {width, height} = Dimensions.get("window");

export default function Account() {

    const navigation = useNavigation();
    const {handleLoading, handleUpdateUser, mbUser}: any = useContext(MBContext);

    const actualDate = new Date();
    const [maxDate] = useState<Date>(
        new Date(
            actualDate.getFullYear() - 18,
            actualDate.getMonth(),
            actualDate.getDate() + 1
        )
    );
    let formRef: any = null;
    const [platform] = useState(Platform.OS);
    const [version] = useState(Platform.Version);
    const [visibleDate, setVisibleDate] = useState(false);
    const [visible, setVisible] = useState(false);
    const [imageProfile, setImageProfile] = useState<any>(null);
    const [imageCard, setImageCard] = useState<any>(null);

    const [usedMap, setUsedMap] = useState(false);
    const [region, setRegion] = useState<any>(null);
    const [marker, setMarker] = useState<any>(null);
    const [myAddress, setMyAddress] = useState<any>(null);
    const [countries, setCountries] = useState<any[]>([]);
    const [usaRegions] = useState(statesOfUSA);

    const [isCamera, setIsCamera] = useState(false);
    const [isLibrary, setIsLibrary] = useState(false);
    const [visibleCapture, setVisibleCapture] = useState(false);

    const [openCountry, setOpenCountry] = useState(false);
    const [openState, setOpenState] = useState(false);

    const [countrySelected, setCountrySelected] = useState<string | null>(null);
    const [stateSelected, setStateSelected] = useState<string | null>(null);
    const [mapAddress, setMapAddress] = useState<any>(null);
    const [identificationTypes] = useState([
        {
            value: 'C',
            label: 'Identity Card / Cédula de Identidad'
        },
        {
            value: 'L',
            label: 'Driver License / Licencia de Conduccion'
        },
        {
            value: 'P',
            label: 'Passport / Pasaporte'
        },
        {
            value: 'SSN',
            label: 'Social Security Number/ Número de Seguro Social'
        },
        {
            value: 'R',
            label: 'N.I.F / R.U.C'
        }
    ]);

    const [imageType, setImageType] = useState(ImageType.PROFILE);
    const [identificationType, setIdentificationType] = useState<string | null>(null);
    const [openIdentification, setOpenIdentification] = useState(false);

    useEffect(() => {
        async function checkPermissionsCamera() {
            const imagesLibrary = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setIsLibrary(imagesLibrary.status === 'granted');
            const mediaCamera = await ImagePicker.requestCameraPermissionsAsync();
            setIsCamera(mediaCamera.status === 'granted');
        }

        checkPermissionsCamera();
    }, []);

    useEffect(() => {
        async function loadCountries() {
            const {
                data: countriesList
            }: any = await loadMoneyBlinksCountries();
            if (countriesList && countriesList.length > 0) {
                const countriesCtrl: any[] = [];
                countriesList.map((item: any) => {
                    let label: string = item?.name;
                    if (item?.translations) {
                        label = item?.translations[mbUser.locale || locale];
                    }
                    countriesCtrl.push({
                        label,
                        value: item.alpha3Code,
                        countryIsoCode: item.alpha2Code,
                        alpha3Code: item.alpha3Code,
                        currencies: item.currencies
                    });
                });
                setCountries(countriesCtrl);
            }
        }

        loadCountries();
    }, []);

    useEffect(() => {
        async function loadImages(user: any) {
            try {
                if (user?.avatarUrl) {
                    const avImg: any = await loadImageKey(user?.avatarUrl);
                    setImageProfile(avImg);
                }
                if (user?.identificationUrl) {
                    const cardIdImg: any = await loadImageKey(user?.identificationUrl);
                    setImageCard(cardIdImg);
                }
            } catch (e) {

            } finally {

            }
        }

        if (mbUser) {
            setCountrySelected(mbUser.alpha3Code);
            setStateSelected(mbUser.alpha2Code);
            setIdentificationType(mbUser?.identificationType);
            loadImages(mbUser);
        }
    }, [
        mbUser
    ]);

    useEffect(() => {
        if (formRef) {
            if (countrySelected) {
                formRef.setFieldValue('alpha3Code', countrySelected, true);
                const items: any[] = countries.filter(
                    (country: any) => country.value
                        .toUpperCase().indexOf(countrySelected.toUpperCase()) === 0
                );
                if (items.length > 0) {
                    if (countrySelected !== 'USA') {
                        formRef.setFieldValue('alpha2Code', items[0].countryIsoCode, true);
                        formRef.setFieldValue('country', items[0].label, true);
                    } else {
                        formRef.setFieldValue('country', 'United States', true);
                    }
                    formRef?.setFieldValue('currency', items[0]?.currencies[0]?.code || 'USD', true);
                }
            }
        }
    }, [
        countrySelected
    ]);

    useEffect(() => {
        if (formRef) {
            formRef.setFieldValue('identificationType', identificationType, true);
        }
    }, [
        identificationType
    ]);

    useEffect(() => {
        if (stateSelected) {
            formRef?.setFieldValue('alpha2Code', stateSelected, true);
            const states = usaRegions.filter((it: any) => it.value.toUpperCase().indexOf(stateSelected.toUpperCase()) === 0);
            if (states.length > 0) {
                formRef?.setFieldValue('state', states[0].label);
            }
        }
    }, [
        stateSelected
    ]);

    const onChangeDate = (event: any, value: Date | undefined) => {
        if (Platform.OS === 'android') {
            setVisibleDate(false);
        }
        if (event?.type === 'set' && value) {
            setVisibleDate(false);
            formRef?.setFieldValue('birthDate', value.toISOString(), true);
        }
    }

    const navigateToHome = () => {
        setVisible(false);
        navigation.navigate('Home');
    }

    const navigationToAccounts = () => {
        setVisible(false);
        navigation.navigate('PaymentsNav');
    }

    const getAddress = async () => {
        handleLoading(true);
        try {
            const location = await detectLocation();
            setRegion(getRegion(location.coords));
            setMarker(location.coords);
            const addressItems = await detectAddress(location.coords);
            if (addressItems && addressItems[0]) {
                setMyAddress(getStringFullAddress(addressItems[0]));
                setMapAddress(addressItems[0]);
            }
            setTimeout(() => setUsedMap(true), 1000);
            handleLoading(false);
        } catch (e) {
            handleLoading(false);
        }
    }

    async function dragEnd(event: MapEvent) {
        handleLoading(true);
        try {
            if (event.nativeEvent && event.nativeEvent.coordinate) {
                setRegion(getRegion(event.nativeEvent.coordinate));
                const addressItems = await detectAddress(event.nativeEvent.coordinate);
                if (addressItems && addressItems[0]) {
                    setMyAddress(getStringFullAddress(addressItems[0]));
                    setMapAddress(addressItems[0]);
                }
            }
            handleLoading(false);
        } catch (e) {
            handleLoading(false);
        }
    }

    function useAddress() {
        formRef?.setFieldValue('address', getStringAddress(mapAddress), true);
        formRef?.setFieldValue('city', mapAddress.city, true);
        formRef?.setFieldValue('state', mapAddress.region, true);
        formRef?.setFieldValue('country', mapAddress.country, true);
        formRef?.setFieldValue('zipCode', mapAddress.postalCode, true);
        if (mapAddress.isoCountryCode === 'US') {
            const regionFilter = usaRegions.filter((it: any) => it.label.indexOf(mapAddress.region) === 0);
            if (regionFilter.length > 0) {
                formRef?.setFieldValue('alpha2Code', regionFilter[0].value, true);
                setCountrySelected('USA');
                formRef?.setFieldValue('alpha3Code', 'USA', true);
            }
        } else {
            const countyList = countries.filter(
                (country: any) => country?.countryIsoCode?.toUpperCase()
                    .indexOf(mapAddress.isoCountryCode.toUpperCase()) === 0
            );
            if (countyList.length > 0) {
                formRef?.setFieldValue('alpha3Code', countyList[0].alpha3Code, true);
                setCountrySelected(countyList[0].alpha3Code);
                formRef?.setFieldValue('alpha2Code', mapAddress.isoCountryCode, true);
            }
        }
        setUsedMap(false);
    }

    function getRegion(coordinates: any) {
        return {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            latitudeDelta: 0.009668,
            longitudeDelta: 0.007006
        }
    }

    const loadImageKey = async (imageToLoad: string): Promise<any> => {
        try {
            return await Storage.get(imageToLoad, {
                level: 'public'
            });
        } catch (e: any) {
            console.log(e?.message || e);
        }
    }

    const uploadImage = async (pathToImage: string): Promise<any> => {
        try {
            const response = await fetch(pathToImage);
            if (response) {
                const blob = await response.blob();
                const name = nameOfImageFromUri(pathToImage);
                const contentType = mime.lookup(pathToImage);
                if (blob && name && contentType) {
                    return await Storage.put(`${name}`,
                        blob,
                        {
                            contentType,
                            level: 'public'
                        });
                }
            }
            return {key: null};
        } catch (e) {
            throw e;
        }
    }

    const takeImage = async (deviceType: MBDevice) => {
        let result: any;
        let image: any;
        setVisibleCapture(false);
        handleLoading(true);
        try {
            const options = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                ratio: [1, 1],
                quality: 1,
                base64: true
            };
            if (deviceType === MBDevice.CAMERA) {
                result = await ImagePicker.launchCameraAsync(options);
            } else if (deviceType === MBDevice.LIBRARY) {
                result = await ImagePicker.launchImageLibraryAsync(options);
            }
            if (!result && Platform.OS === 'android') {
                const results = await ImagePicker.getPendingResultAsync();
                if (results.length > 0) {
                    result = results[0];
                }
            }
            if (!result?.cancelled) {
                image = await uploadImage(result.uri);
                if (image?.key) {
                    switch (imageType) {
                        case ImageType.ID_CARD:
                            setImageCard(result.uri);
                            formRef?.setFieldValue('oldIdentificationUrl', formRef?.values?.identificationUrl);
                            formRef?.setFieldValue('identificationUrl', image.key, true);
                            break;
                        case ImageType.PROFILE:
                            setImageProfile(result.uri);
                            formRef?.setFieldValue('oldAvatarUrl', formRef?.values?.avatarUrl);
                            formRef?.setFieldValue('avatarUrl', image.key, true);
                            break;
                        default:
                            setImageProfile(result.uri);
                            formRef?.setFieldValue('oldAvatarUrl', formRef?.values?.avatarUrl);
                            formRef?.setFieldValue('avatarUrl', image.key, true);
                            break;
                    }
                }
            }
            handleLoading(false);
        } catch (e) {
            handleLoading(false);
        }
    }

    async function onUpdateMbUser(values: any) {
        handleLoading(true);
        delete values.paymentMethod;
        delete values.myBlinks;
        delete values.myPayments;
        const dataIn: any = values;
        try {
            if (dataIn?.oldAvatarUrl && dataIn.oldAvatarUrl !== dataIn?.avatarUrl) {
                await Storage.remove(dataIn.oldAvatarUrl);
                dataIn.oldAvatarUrl = dataIn.avatarUrl;
            }
            if (dataIn?.oldIdentificationUrl && dataIn?.identificationUrl !== dataIn.oldIdentificationUrl) {
                await Storage.remove(dataIn.oldIdentificationUrl);
                dataIn.oldIdentificationUrl = dataIn.identificationUrl;
            }
            await handleUpdateUser(dataIn);
        } catch (e) {
            handleLoading(true);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView style={styles.scrollView}>
                    <Formik
                        innerRef={ref => {
                            if (!formRef) {
                                formRef = ref;
                            }
                        }}
                        initialValues={mbUser}
                        enableReinitialize={mbUser}
                        validationSchema={
                            Yup.object().shape({
                                avatarUrl: Yup.string()
                                    .nullable().required('AVATAR_IS_REQUIRED'),
                                identificationUrl: Yup.string()
                                    .nullable().required('IDENTIFICATION_IMAGE_IS_REQUIRED'),
                                birthDate: Yup.date()
                                    .nullable()
                                    .max(maxDate, 'BIRTH_DATE_IS_INVALID')
                                    .required('BIRTH_DATE_IS_REQUIRED'),
                                identificationType: Yup.string()
                                    .nullable().required(),
                                identificationNumber: Yup.string()
                                    .nullable().required('IDENTIFICATION_NUMBER_INVALID'),
                                alpha3Code: Yup.string().nullable()
                                    .min(3, 'COUNTRY_CODE_INVALID')
                                    .max(3, 'COUNTRY_CODE_INVALID')
                                    .required('COUNTRY_IS_REQUIRED'),
                                alpha2Code: Yup.string().nullable()
                                    .min(2, 'STATE_CODE_INVALID')
                                    .max(2, 'STATE_CODE_INVALID')
                                    .required('STATE_IS_REQUIRED'),
                                address: Yup.string()
                                    .nullable().required('ADDRESS_IS_REQUIRED'),
                                city: Yup.string().nullable()
                                    .required('CITY_IS_REQUIRED'),
                                state: Yup.string().nullable()
                                    .required('STATE_IS_REQUIRED'),
                                zipCode: Yup.string().nullable()
                                    .required('ZIP_CODE_IS_REQUIRED'),
                                country: Yup.string()
                                    .nullable().required('COUNTRY_IS_REQUIRED')
                            })
                        }
                        onSubmit={onUpdateMbUser}>
                        {({
                              handleChange,
                              handleBlur,
                              setFieldValue,
                              handleSubmit,
                              errors,
                              touched,
                              values
                          }) => (
                            <Fragment>
                                <TouchableOpacity
                                    onPress={() => {
                                        setImageType(ImageType.PROFILE);
                                        setVisibleCapture(true);
                                    }}
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        position: "relative",
                                        marginVertical: 5
                                    }}>
                                    {
                                        imageProfile ?
                                            <Avatar.Image
                                                size={200}
                                                style={{
                                                    backgroundColor: 'transparent'
                                                }}
                                                source={{uri: imageProfile}}/> :
                                            <Avatar.Image
                                                source={require('../../assets/images/profile.png')}
                                                size={200}
                                                style={{
                                                    backgroundColor: 'transparent'
                                                }}/>
                                    }
                                    <Avatar.Icon
                                        onTouchEnd={() => {
                                            setImageType(ImageType.PROFILE);
                                            setVisibleCapture(true);
                                        }}
                                        style={{
                                            bottom: 40,
                                            position: "absolute",
                                            right: 70,
                                            backgroundColor: themeDefault.colors.error
                                        }}
                                        color="#FFFFFF"
                                        icon="camera" size={60}/>
                                </TouchableOpacity>
                                {
                                    errors?.avatarUrl && (
                                        <HelperText type="error" style={{textAlign: 'center'}}>
                                            {I18n.get(errors?.avatarUrl)}
                                        </HelperText>
                                    )
                                }
                                <View style={{marginBottom: 5}}>
                                    <TextInput mode='outlined'
                                               label={I18n.get('USERNAME_INPUT')}
                                               placeholder={I18n.get('USERNAME_INPUT')}
                                               left={
                                                   <TextInput.Icon
                                                       color="#97A19A"
                                                       name="account"/>
                                               }
                                               selectionColor="#97A19A"
                                               underlineColor="#97A19A"
                                               value={values?.nickname}
                                               editable={false}
                                               style={{
                                                   backgroundColor: '#EEEEEE',
                                                   borderColor: '#97A19A'
                                               }}/>
                                </View>
                                <View style={{marginBottom: 5}}>
                                    <TextInput mode='outlined'
                                               label={I18n.get('FULL_NAME')}
                                               placeholder={I18n.get('FULL_NAME')}
                                               left={
                                                   <TextInput.Icon
                                                       color="#97A19A"
                                                       name="account-circle"/>
                                               }
                                               selectionColor="#97A19A"
                                               underlineColor="#97A19A"
                                               value={values?.fullName}
                                               editable={false}
                                               style={{
                                                   backgroundColor: '#EEEEEE',
                                                   borderColor: '#97A19A'
                                               }}/>
                                </View>
                                <View style={{marginBottom: 5}}>
                                    <TextInput mode='outlined'
                                               label={I18n.get('EMAIL')}
                                               placeholder={I18n.get('EMAIL')}
                                               left={
                                                   <TextInput.Icon
                                                       color="#97A19A"
                                                       name="email"/>
                                               }
                                               selectionColor="#97A19A"
                                               underlineColor="#97A19A"
                                               value={values?.email}
                                               editable={false}
                                               style={{
                                                   backgroundColor: '#EEEEEE',
                                                   borderColor: '#97A19A'
                                               }}/>
                                </View>
                                <View style={{marginBottom: 5}}>
                                    <TextInput mode='outlined'
                                               label={I18n.get('PHONE_NUMBER')}
                                               placeholder={I18n.get('PHONE_NUMBER')}
                                               left={
                                                   <TextInput.Icon
                                                       color="#97A19A"
                                                       name="cellphone"/>
                                               }
                                               selectionColor="#97A19A"
                                               underlineColor="#97A19A"
                                               value={values?.phoneNumber}
                                               editable={false}
                                               style={{
                                                   backgroundColor: '#EEEEEE',
                                                   borderColor: '#97A19A'
                                               }}/>
                                </View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        position: "relative"
                                    }}>
                                    <View style={{marginBottom: 10}}>
                                        {
                                            !imageCard && (
                                                <Text style={{
                                                    color: themeDefault.colors.text,
                                                    textAlign: "center",
                                                    textAlignVertical: "center",
                                                    marginVertical: 5
                                                }}>{I18n.get('UPLOAD_IMAGE_ID_FRONT')}</Text>
                                            )
                                        }
                                        {
                                            imageCard ?
                                                <Image
                                                    source={{
                                                        uri: imageCard
                                                    }}
                                                    style={{
                                                        resizeMode: "contain",
                                                        width: (width - 130),
                                                        height: 190,
                                                        borderRadius: 15
                                                    }}/> :
                                                <Image
                                                    source={require('../../assets/images/number-id.png')}
                                                    style={{
                                                        resizeMode: "contain",
                                                        height: 190
                                                    }}/>
                                        }
                                    </View>
                                    {
                                        imageCard &&
                                        <View style={{
                                            position: "absolute",
                                            right: 3,
                                            bottom: 10
                                        }}>

                                            <FAB
                                                small
                                                style={{
                                                    marginBottom: 10,
                                                    backgroundColor: themeDefault.colors.notification
                                                }}
                                                icon="check"
                                                color={'#FFF'}
                                            />
                                            <FAB
                                                small
                                                icon="delete"
                                                color={'#FFF'}
                                                onPress={() => setImageCard(null)}
                                            />
                                        </View>
                                    }
                                </View>
                                <Button
                                    icon="paperclip"
                                    style={{
                                        ...mbCommonStyles.submitBtn,
                                        ...{
                                            backgroundColor: themeDefault.colors.btnColor,
                                            marginTop: 10
                                        }
                                    }}
                                    mode="contained" onPress={() => {
                                    setImageType(ImageType.ID_CARD);
                                    setVisibleCapture(true);
                                }}>
                                    {I18n.get('BTN_ATTACH')}
                                </Button>
                                {
                                    errors?.identificationUrl && (
                                        <HelperText type="error" style={{textAlign: 'center'}}>
                                            {I18n.get(errors?.identificationUrl)}
                                        </HelperText>
                                    )
                                }
                                <View style={{
                                    zIndex: 100,
                                    marginBottom: 10
                                }}>
                                        <DropDownPicker
                                            open={openIdentification}
                                            setOpen={setOpenIdentification}
                                            itemKey="value"
                                            closeAfterSelecting={true}
                                            searchable={true}
                                            listMode="MODAL"
                                            mode="BADGE"
                                            multiple={false}
                                            placeholder={I18n.get('IDENTIFICATION_TYPE')}
                                            searchPlaceholder={I18n.get('SEARCH_ITEM')}
                                            items={identificationTypes}
                                            value={identificationType}
                                            setValue={setIdentificationType}
                                        />
                                    {
                                        errors?.identificationType && touched?.identificationType &&
                                        (
                                            <HelperText type="error">
                                                {I18n.get('IDENTIFICATION_TYPE_REQUIRED')}
                                            </HelperText>
                                        )
                                    }
                                </View>
                                <View style={{marginBottom: 5}}>
                                    <TextInput mode='outlined'
                                               label={I18n.get('IDENTIFICATION_NUMBER')}
                                               left={
                                                   <TextInput.Icon
                                                       color="#97A19A"
                                                       name="card-account-details"/>
                                               }
                                               error={!!errors?.identificationNumber}
                                               selectionColor="#97A19A"
                                               underlineColor="#97A19A"
                                               value={values?.identificationNumber}
                                               onBlur={handleBlur('identificationNumber')}
                                               onChangeText={handleChange('identificationNumber')}
                                               style={{
                                                   backgroundColor: '#EEEEEE',
                                                   borderColor: '#97A19A'
                                               }}/>
                                    {
                                        errors?.identificationNumber && touched?.identificationNumber && (
                                            <HelperText type="error">
                                                {I18n.get(errors?.identificationNumber)}
                                            </HelperText>
                                        )
                                    }
                                </View>
                                <View style={{marginBottom: 5}}>
                                    {
                                        visibleDate && platform === 'android' && (
                                            <DateTimePicker
                                                testID="birthDate"
                                                textColor="#000000"
                                                onChange={onChangeDate}
                                                value={
                                                    values?.birthDate ?
                                                        new Date(
                                                            Number(values.birthDate.substr(0, 4)),
                                                            Number(values.birthDate.substr(5, 2)) - 1,
                                                            Number(values.birthDate.substr(8, 2)),
                                                            0, 0, 0, 0
                                                        ) :
                                                        new Date(
                                                            actualDate.getFullYear() - 18,
                                                            actualDate.getMonth(),
                                                            actualDate.getDate(),
                                                            0, 0, 0, 0
                                                        )
                                                }
                                                display={"spinner"}
                                                mode="date"/>
                                        )
                                    }
                                    {
                                        visibleDate && platform === 'ios' && (
                                            <DateTimePickerModal
                                                isVisible={visibleDate}
                                                mode="date"
                                                onConfirm={date => {
                                                    setVisibleDate(false);
                                                    setFieldValue('birthDate', date?.toISOString(), true);
                                                }}
                                                onCancel={() => setVisibleDate(false)}
                                            />
                                        )
                                    }
                                    <TextInput mode='outlined'
                                               label={I18n.get('BIRTH_DATE')}
                                               placeholder={I18n.get('BIRTH_DATE')}
                                               right={
                                                   <TextInput.Icon
                                                       color="#97A19A"
                                                       name="calendar"
                                                       onPress={() => setVisibleDate(!visibleDate)}/>
                                               }
                                               left={
                                                   <TextInput.Icon
                                                       color="#97A19A"
                                                       name="cake-variant"/>
                                               }
                                               selectionColor="#97A19A"
                                               underlineColor="#97A19A"
                                               error={!!errors?.birthDate}
                                               value={
                                                   moment(
                                                       values.birthDate ? new Date(
                                                               Number(values.birthDate.substr(0, 4)),
                                                               Number(values.birthDate.substr(5, 2)) - 1,
                                                               Number(values.birthDate.substr(8, 2)),
                                                               0, 0, 0, 0
                                                           ) :
                                                           new Date(
                                                               actualDate.getFullYear() - 18,
                                                               actualDate.getMonth(),
                                                               actualDate.getDate()
                                                           )
                                                   ).format('L')
                                               }
                                               editable={false}
                                               style={{
                                                   backgroundColor: '#EEEEEE',
                                                   borderColor: '#97A19A'
                                               }}/>
                                </View>
                                <View style={{
                                    marginVertical: 5
                                }}>
                                    <TouchableOpacity
                                        onPress={() => getAddress()}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "space-around",
                                            flex: 1,
                                            shadowOpacity: 0
                                        }}>
                                        <Text style={{
                                            fontFamily: 'Roboto-Black',
                                            fontSize: 18,
                                            textAlignVertical: "center",
                                            textAlign: "center",
                                            flex: 0.7
                                        }}>{I18n.get('PREFER_SUGGEST_ADDRESS')}</Text>
                                        <FAB
                                            style={{
                                                backgroundColor: themeDefault.colors.primary,
                                                width: 58
                                            }}
                                            icon="map-marker"
                                            onPress={() => getAddress()}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={{
                                    zIndex: 100,
                                    marginBottom: 10
                                }}>
                                    {
                                        countries && countries.length > 0 &&
                                        <DropDownPicker
                                            open={openCountry}
                                            setOpen={setOpenCountry}
                                            itemKey="value"
                                            closeAfterSelecting={true}
                                            searchable={true}
                                            listMode="MODAL"
                                            mode="BADGE"
                                            multiple={false}
                                            placeholder={I18n.get('COUNTRY')}
                                            searchPlaceholder={I18n.get('SEARCH_ITEM')}
                                            items={countries}
                                            value={countrySelected}
                                            setValue={setCountrySelected}
                                        />
                                    }
                                    {
                                        errors?.country && touched?.country &&
                                        (
                                            <HelperText type="error">
                                                {I18n.get(errors?.country)}
                                            </HelperText>
                                        )
                                    }
                                </View>
                                <View style={{
                                    zIndex: 10,
                                    marginBottom: 5
                                }}>
                                    {usaRegions.length > 0 && values?.alpha3Code === 'USA' ?
                                        (
                                            <DropDownPicker
                                                open={openState}
                                                setOpen={setOpenState}
                                                itemKey="value"
                                                closeAfterSelecting={true}
                                                searchable={true}
                                                listMode="MODAL"
                                                mode="BADGE"
                                                multiple={false}
                                                placeholder={I18n.get('STATE')}
                                                searchPlaceholder={I18n.get('SEARCH_ITEM')}
                                                items={usaRegions}
                                                value={stateSelected}
                                                setValue={setStateSelected}
                                            />
                                        ) : (
                                            <TextInput mode='outlined'
                                                       label={I18n.get('STATE')}
                                                       left={
                                                           <TextInput.Icon
                                                               color="#97A19A"
                                                               name="map-marker"/>
                                                       }
                                                       error={!!errors?.state}
                                                       selectionColor="#97A19A"
                                                       underlineColor="#97A19A"
                                                       value={values?.state}
                                                       onBlur={handleBlur('state')}
                                                       onChangeText={text => {
                                                           handleChange('state');
                                                           setFieldValue('state', text, true);
                                                       }}
                                                       style={{
                                                           backgroundColor: '#EEEEEE',
                                                           borderColor: '#97A19A'
                                                       }}/>
                                        )
                                    }
                                    {
                                        touched?.state && errors?.state && (
                                            <HelperText type="error">
                                                {I18n.get(errors.state)}
                                            </HelperText>
                                        )
                                    }
                                    {
                                        touched?.alpha2Code && errors?.alpha2Code && (
                                            <HelperText type="error">
                                                {I18n.get(errors.alpha2Code)}
                                            </HelperText>
                                        )
                                    }
                                </View>
                                <View style={{
                                    marginBottom: 5
                                }}>
                                    <TextInput mode='outlined'
                                               label={I18n.get('CITY')}
                                               left={
                                                   <TextInput.Icon
                                                       color="#97A19A"
                                                       name="city"/>
                                               }
                                               error={!!errors?.city}
                                               selectionColor="#97A19A"
                                               underlineColor="#97A19A"
                                               value={values?.city}
                                               onBlur={handleBlur('city')}
                                               onChangeText={handleChange('city')}
                                               style={{
                                                   backgroundColor: '#EEEEEE',
                                                   borderColor: '#97A19A'
                                               }}/>
                                    {
                                        errors?.city && touched?.city && (
                                            <HelperText type="error">
                                                {I18n.get(errors.city)}
                                            </HelperText>
                                        )
                                    }
                                </View>
                                <View style={{
                                    marginBottom: 5
                                }}>
                                    <TextInput mode='outlined'
                                               label={I18n.get('ADDRESS')}
                                               left={
                                                   <TextInput.Icon
                                                       color="#97A19A"
                                                       name="map-marker"/>
                                               }
                                               error={!!errors?.address}
                                               selectionColor="#97A19A"
                                               underlineColor="#97A19A"
                                               value={values?.address}
                                               numberOfLines={4}
                                               multiline={true}
                                               onBlur={handleBlur('address')}
                                               onChangeText={handleChange('address')}
                                               style={{
                                                   backgroundColor: '#EEEEEE',
                                                   borderColor: '#97A19A'
                                               }}/>
                                    {
                                        errors?.address && touched?.address && (
                                            <HelperText type="error">
                                                {I18n.get(errors.address)}
                                            </HelperText>
                                        )
                                    }
                                </View>
                                <View style={{
                                    marginBottom: 5
                                }}>
                                    <TextInput mode='outlined'
                                               label={I18n.get('ZIP_CODE')}
                                               left={
                                                   <TextInput.Icon
                                                       color="#97A19A"
                                                       name="map-marker"/>
                                               }
                                               error={!!errors?.zipCode}
                                               selectionColor="#97A19A"
                                               underlineColor="#97A19A"
                                               value={values?.zipCode}
                                               keyboardType="number-pad"
                                               onBlur={handleBlur('zipCode')}
                                               onChangeText={handleChange('zipCode')}
                                               style={{
                                                   backgroundColor: '#EEEEEE',
                                                   borderColor: '#97A19A'
                                               }}/>
                                    {
                                        errors?.zipCode && touched?.zipCode && (
                                            <HelperText type="error">
                                                {I18n.get(errors.zipCode)}
                                            </HelperText>
                                        )
                                    }
                                </View>

                                <Button
                                    icon="content-save-all"
                                    style={mbCommonStyles.submitBtn}
                                    mode="contained" onPress={handleSubmit}>
                                    {I18n.get('BTN_OK')}
                                </Button>
                                {/*<Text>*/}
                                {/*    {errors}*/}
                                {/*</Text>*/}
                            </Fragment>
                        )}
                    </Formik>
                </ScrollView>
                <Portal>
                    <Dialog visible={visible}>
                        <Dialog.Title>{I18n.get('TITLE_INFO')}</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>{I18n.get('TEXT_ACCOUNT_UPDATE')}</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={navigationToAccounts}>{I18n.get('PAYMENT_METHODS')}</Button>
                            <Button onPress={navigateToHome}>{I18n.get('HOME')}</Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Dialog visible={usedMap} style={{
                        width: width - 20,
                        height: height - 60,
                        alignSelf: "center"
                    }}>
                        <Dialog.Content style={{
                            padding: 0
                        }}>
                            {
                                usedMap &&
                                <MapView style={styles.map}
                                         showsUserLocation={true}
                                         zoomControlEnabled={true}
                                         toolbarEnabled={true}
                                         loadingEnabled={true}
                                         loadingIndicatorColor={themeDefault.colors.primary}
                                         moveOnMarkerPress={true}
                                         followsUserLocation={true}
                                         initialRegion={region}
                                         onRegionChangeComplete={(regionChanged) => {
                                             setRegion(regionChanged);
                                         }}
                                         provider={PROVIDER_GOOGLE}>
                                    <Marker
                                        draggable={true}
                                        coordinate={marker}
                                        title={formRef?.values?.fullName}
                                        description={myAddress}
                                        style={{
                                            zIndex: 10000
                                        }}
                                        onDragEnd={(event) => dragEnd(event)}
                                    />
                                </MapView>
                            }
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button
                                style={{alignSelf: "center"}}
                                onPress={() => setUsedMap(false)}>
                                {I18n.get('CANCEL')}
                            </Button>
                            <Button
                                style={{alignSelf: "center"}}
                                onPress={() => useAddress()}>
                                {I18n.get('USE_ADDRESS')}
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Dialog
                        theme={themeDark}
                        style={{
                            backgroundColor: themeDark.colors.backdrop
                        }}
                        visible={visibleCapture}
                        onDismiss={() => setVisibleCapture(false)}>
                        <Dialog.Title
                            style={{color: themeDark.colors.text}}>{I18n.get('CAPTURE_IMG_TITLE')}</Dialog.Title>
                        <Dialog.Content
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-around"
                            }}>
                            {
                                isCamera && (
                                    <TouchableOpacity
                                        onPress={() => takeImage(MBDevice.CAMERA)}
                                        style={{
                                            alignSelf: "auto"
                                        }}>
                                        <MaterialCommunityIcons name="camera" size={80} color='#7CD'/>
                                        <Text
                                            style={{
                                                textAlign: "center",
                                                color: '#FFFFFF'
                                            }}>{I18n.get('CAMERA')}</Text>
                                    </TouchableOpacity>
                                )
                            }
                            {
                                isLibrary && (
                                    <TouchableOpacity
                                        onPress={() => takeImage(MBDevice.LIBRARY)}
                                        style={{
                                            alignSelf: "auto"
                                        }}>
                                        <MaterialCommunityIcons name="image-multiple" size={80} color='#7CD'/>
                                        <Text
                                            style={{
                                                textAlign: "center",
                                                color: '#FFFFFF'
                                            }}>{I18n.get('GALLERY')}</Text>
                                    </TouchableOpacity>
                                )
                            }
                        </Dialog.Content>
                    </Dialog>
                </Portal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollView: {
        marginHorizontal: 20
    },
    camera: {
        flex: 1,
        backgroundColor: 'transparent',
        position: 'absolute',
        flexDirection: "column",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        margin: 20,
    },
    button: {
        flex: 0.1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    galleryCamera: {
        paddingVertical: 5,
        fontWeight: "normal",
        fontSize: 18
    },
    text: {
        fontSize: 18,
        color: 'white',
    },
    viewRepeat: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: 'transparent',
        margin: 20
    },
    label: {
        color: themeDefault.colors.placeholder,
        paddingLeft: 10,
        fontSize: 12,
        marginBottom: -8,
        zIndex: 12000
    },
    imageProfileView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 0
    },
    map: {
        width: width - 40,
        height: height - 160,
        alignSelf: "center"
    },
});
