import React, {Fragment, useContext, useEffect, useState} from "react";
import {Image, Linking, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {CountryCodeList} from "react-native-country-picker-modal";
import * as  Localization from "expo-localization";
import {Button, Checkbox, HelperText, Text, TextInput} from "react-native-paper";
import {Formik} from "formik";
import * as Yup from 'yup';
import {API, graphqlOperation, I18n} from 'aws-amplify';
import Constants from "expo-constants";
import axios from "axios";
import PhoneInput from "react-native-phone-number-input";
import {useNavigation} from "@react-navigation/native";

import {detectAddress, detectLocation, emailMatch, emailValidator, pwdMatch, usrMatch} from "../../functions/functions";
import {themeDefault} from "../../constants/Colors";
import {mbCommonStyles} from "../../constants/styles";
import {MBDividerText} from "../../components/MBCommonsComponets";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import {byEmail, byNickname, byPhoneNumber} from "../graphql/queries";


export default function SignUp() {
    const navigation = useNavigation();
    const {handleLoading, handleRegister, regAws}: any = useContext(MBContext);

    const [visiblePwd, setVisiblePwd] = useState<boolean>(false);
    const [defaultCountryCode, setDefaultCountryCode] = useState<any>(CountryCodeList[CountryCodeList.indexOf("US")]);
    const [detectedLocation, setDetectedLocation] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isValidPhoneNumber, setIsValidPhoneNumber] = useState(true);

    useEffect(() => {
        async function loadCountry() {
            try {
                handleLoading(true);
                const result: any = await axios.get('https://ipapi.co/json/');
                handleLoading(false);
                if (result?.country) {
                    setDefaultCountryCode(result.country);
                    setDetectedLocation(true);
                } else {
                    await getLocation();
                }
            } catch (e) {
                handleLoading(false);
                await getLocation();
            }
        }

        loadCountry();
    }, []);

    useEffect(() => {
        if (regAws) {
            navigation.navigate('ConfirmAccount', {username: regAws?.username})
        }
    }, [regAws]);

    async function getLocation() {
        handleLoading(false);
        try {
            const location = await detectLocation();
            if (location && location.coords) {
                const addressItems = await detectAddress(location.coords);
                if (addressItems &&
                    Array.isArray(addressItems) &&
                    addressItems.length > 0) {
                    setDefaultCountryCode(addressItems[0]?.isoCountryCode);
                    setDetectedLocation(true);
                }
            }
            handleLoading(false);
        } catch (e) {
            handleLoading(false);
        }
    }

    async function onRegister(values: any) {
        await handleRegister(values);
    }

    async function onValidate(values: any) {
        const errors: any = {};
        try {
            if (values?.username && values.username.test(usrMatch)) {
                const {
                    data: {
                        byNickname: {
                            items: existUser
                        }
                    }
                }: any = await API.graphql(graphqlOperation(byNickname, {
                    nickname: values.username
                }));
                if (existUser.length > 0) {
                    errors.username = 'NICKNAME_IN_USE';
                    return errors;
                }
            }
            if (values?.email && emailValidator(values.email)) {
                const {
                    data: {
                        byEmail: {
                            items: existEmail
                        }
                    }
                }: any = await API.graphql(graphqlOperation(byEmail, {
                    email: values?.email
                }));
                if (existEmail.length > 0) {
                    errors.email = 'EMAIL_IN_USE';
                    return errors;
                }
            }

            if (values?.phoneNumber && isValidPhoneNumber) {
                const {
                    data: {
                        byPhoneNumber: {
                            items: existPhone
                        }
                    }
                }: any = await API.graphql(graphqlOperation(byPhoneNumber, {
                    phoneNumber
                }));
                if (existPhone.length > 0) {
                    errors.phoneNumber = 'PHONE_IN_USE';
                    return errors;
                }
            }

            return errors;
        } catch (e) {
            return errors;
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <Image source={require('../../assets/images/logo-mb.png')}
                       style={{
                           resizeMode: "contain",
                           width: '100%',
                           marginTop: -220,
                           marginBottom: -250
                       }}/>
                <Formik
                    initialValues={{
                        username: '',
                        password: '',
                        firstName: '',
                        lastName: '',
                        phoneNumber: '',
                        email: '',
                        locale: (Localization.locale).substr(0, 2),
                        isTerms: true
                    }}
                    validationSchema={
                        Yup.object().shape({
                            username: Yup.string().nullable()
                                .matches(usrMatch, 'USERNAME_INVALID')
                                .min(4, 'USERNAME_INVALID')
                                .required('USERNAME_IS_REQUIRED'),
                            password: Yup.string().nullable()
                                .matches(pwdMatch, 'PASSWORD_INVALID')
                                .min(8, 'PASSWORD_INVALID')
                                .required('PASSWORD_IS_REQUIRED'),
                            email: Yup.string().nullable()
                                .matches(emailMatch, 'EMAIL_INVALID')
                                .required('EMAIL_IS_REQUIRED'),
                            phoneNumber: Yup.string()
                                .nullable()
                                .required('PHONE_INVALID'),
                            firstName: Yup.string().nullable().required(),
                            lastName: Yup.string().nullable().required(),
                            isTerms: Yup.boolean()
                                .required("Terms and conditions must be accepted.")
                                .oneOf([true], "Terms and conditions must be accepted."),
                        })
                    }
                    validate={values => onValidate(values).then(errors => errors)}
                    onSubmit={values => onRegister(values)}>
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
                            {
                                detectedLocation && (
                                    <View style={{
                                        marginBottom: 10
                                    }}>
                                        <PhoneInput
                                            ref={ref => {
                                                if (ref) {
                                                    const {
                                                        number,
                                                        formattedNumber
                                                    } = ref.getNumberAfterPossiblyEliminatingZero();
                                                    if (number && number.length > 0) {
                                                        const isValid = ref.isValidNumber(number);
                                                        setIsValidPhoneNumber(isValid);
                                                        if (isValid) {
                                                            setPhoneNumber(formattedNumber);
                                                            handleBlur('phoneNumber');
                                                        }
                                                    }
                                                }
                                            }}
                                            defaultCode={defaultCountryCode}
                                            value={values?.phoneNumber}
                                            onChangeFormattedText={text => {
                                                handleChange('phoneNumber');
                                                setFieldValue('phoneNumber', text);
                                            }}
                                            placeholder={I18n.get('PHONE_NUMBER')}
                                            withShadow={false}
                                            containerStyle={{
                                                width: '100%',
                                                padding: 0,
                                                margin: 0,
                                                borderRadius: 5,
                                                borderWidth: 1,
                                                borderColor: !isValidPhoneNumber ? themeDefault.colors.error : themeDefault.colors.placeholder
                                            }}/>
                                        {
                                            ((touched?.phoneNumber && errors?.phoneNumber) || !isValidPhoneNumber) && (
                                                <HelperText type="error">
                                                    {I18n.get(isValidPhoneNumber ? errors?.phoneNumber : 'PHONE_INVALID')}
                                                </HelperText>
                                            )
                                        }
                                    </View>
                                )
                            }
                            <View style={{marginBottom: 10}}>
                                <TextInput mode='outlined'
                                           label={I18n.get('EMAIL')}
                                           placeholder={I18n.get('EMAIL')}
                                           autoCapitalize="none"
                                           autoCompleteType="email"
                                           left={
                                               <TextInput.Icon
                                                   color="#97A19A"
                                                   name="email"/>
                                           }
                                           keyboardType="email-address"
                                           textContentType="emailAddress"
                                           selectionColor="#97A19A"
                                           underlineColor="#97A19A"
                                           value={values.email}
                                           onChangeText={handleChange('email')}
                                           onBlur={handleBlur('email')}
                                           error={!!errors.email}
                                           style={{
                                               backgroundColor: '#EEEEEE',
                                               borderColor: '#97A19A'
                                           }}/>
                                {
                                    touched?.email && errors?.email && (
                                        <HelperText type="error">
                                            {I18n.get(errors?.email ? errors?.email : '')}
                                        </HelperText>
                                    )
                                }
                            </View>
                            <View style={{marginBottom: 10}}>
                                <TextInput mode='outlined'
                                           label={I18n.get('USERNAME_INPUT')}
                                           placeholder={I18n.get('USERNAME_PLACEHOLDER')}
                                           left={
                                               <TextInput.Icon
                                                   color="#97A19A"
                                                   name="account"/>
                                           }
                                           selectionColor="#97A19A"
                                           underlineColor="#97A19A"
                                           autoCapitalize="none"
                                           value={values?.username}
                                           onChangeText={handleChange('username')}
                                           onBlur={handleBlur('username')}
                                           style={{
                                               backgroundColor: '#EEEEEE',
                                               borderColor: '#97A19A'
                                           }}
                                           error={!!errors?.username}/>
                                {
                                    touched?.username && errors?.username && (
                                        <HelperText type="error">
                                            {I18n.get(errors?.username)}
                                        </HelperText>
                                    )
                                }
                            </View>
                            <View style={{marginBottom: 10}}>
                                {
                                    visiblePwd &&
                                    <TextInput mode='outlined'
                                               label={I18n.get('PASSWORD_INPUT')}
                                               placeholder={I18n.get('PASSWORD_PLACEHOLDER')}
                                               left={
                                                   <TextInput.Icon
                                                       color="#97A19A"
                                                       name="lock"/>
                                               }
                                               style={{
                                                   backgroundColor: '#EEEEEE',
                                                   borderColor: '#97A19A'
                                               }}
                                               selectionColor="#97A19A"
                                               underlineColor="#97A19A"
                                               autoCapitalize="none"
                                               value={values?.password}
                                               onChangeText={handleChange('password')}
                                               onBlur={handleBlur('password')}
                                               error={!!errors?.password}
                                               right={
                                                   <TextInput.Icon
                                                       name="eye"
                                                       color="#97A19A"
                                                       onPress={() => setVisiblePwd(false)}
                                                   />
                                               }/>
                                }
                                {!visiblePwd &&
                                <TextInput mode='outlined'
                                           label={I18n.get('PASSWORD_INPUT')}
                                           placeholder={I18n.get('PASSWORD_PLACEHOLDER')}
                                           left={
                                               <TextInput.Icon
                                                   color="#97A19A"
                                                   name="lock"/>
                                           }
                                           textContentType="password"
                                           selectionColor="#97A19A"
                                           underlineColor="#97A19A"
                                           secureTextEntry
                                           autoCapitalize="none"
                                           value={values?.password}
                                           onChangeText={handleChange('password')}
                                           onBlur={handleBlur('password')}
                                           style={{
                                               backgroundColor: '#EEEEEE',
                                               borderColor: '#97A19A'
                                           }}
                                           error={!!errors?.password}
                                           right={
                                               <TextInput.Icon
                                                   name="eye-off"
                                                   color="#97A19A"
                                                   onPress={() => setVisiblePwd(true)}
                                               />
                                           }/>
                                }
                                {
                                    touched?.password && errors?.password && (
                                        <HelperText type="error">
                                            {I18n.get('PASSWORD_INVALID')}
                                        </HelperText>
                                    )
                                }
                            </View>

                            <View style={{marginBottom: 10}}>
                                <TextInput mode='outlined'
                                           label={I18n.get('FIRST_NAME')}
                                           placeholder={I18n.get('FIRST_NAME')}
                                           textContentType="name"
                                           left={
                                               <TextInput.Icon
                                                   color="#97A19A"
                                                   name="account-circle"/>
                                           }
                                           selectionColor="#97A19A"
                                           underlineColor="#97A19A"
                                           value={values.firstName}
                                           onChangeText={handleChange('firstName')}
                                           onBlur={handleBlur('firstName')}
                                           error={!!errors.firstName}
                                           style={{
                                               backgroundColor: '#EEEEEE',
                                               borderColor: '#97A19A'
                                           }}/>
                                {
                                    touched?.firstName && errors?.firstName && (
                                        <HelperText type="error">
                                            {I18n.get('NAME_IS_REQUIRED')}
                                        </HelperText>
                                    )
                                }
                            </View>

                            <View style={{marginBottom: 10}}>
                                <TextInput mode='outlined'
                                           label={I18n.get('LAST_NAME')}
                                           placeholder={I18n.get('LAST_NAME')}
                                           textContentType="name"
                                           left={
                                               <TextInput.Icon
                                                   color="#97A19A"
                                                   name="account-circle"/>
                                           }
                                           selectionColor="#97A19A"
                                           underlineColor="#97A19A"
                                           value={values.lastName}
                                           onChangeText={handleChange('lastName')}
                                           onBlur={handleBlur('lastName')}
                                           error={!!errors?.lastName}
                                           style={{
                                               backgroundColor: '#EEEEEE',
                                               borderColor: '#97A19A'
                                           }}/>
                                {
                                    touched?.lastName && errors?.lastName && (
                                        <HelperText type="error">
                                            {I18n.get('LAST_NAME_IS_REQUIRED')}
                                        </HelperText>
                                    )
                                }
                            </View>
                            <View style={{marginBottom: 10}}>
                                <View style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "flex-start",
                                    alignContent: "center"
                                }}>
                                    <Checkbox
                                        status={values?.isTerms ? 'checked' : 'unchecked'}
                                        color={themeDefault.colors.primary}
                                        onPress={() => {
                                            handleBlur('isTerms');
                                            handleChange('isTerms');
                                            setFieldValue('isTerms', !values?.isTerms, true);
                                        }}
                                    />
                                    <Text style={{
                                        color: themeDefault.colors.text,
                                        fontSize: 16,
                                        flex: 1
                                    }}>
                                        {I18n.get('TERM_AND_CONDITIONS')}
                                        <Text
                                            onPress={() => {
                                                Linking.canOpenURL(`https://moneyblinks.com/terms-condition`).then(supported => {
                                                    if (supported) {
                                                        Linking.openURL(`https://moneyblinks.com/terms-condition`);
                                                    } else {
                                                        console.log("Don't know how to open URI: https://moneyblinks.com/terms-condition");
                                                    }
                                                });
                                            }}
                                            style={{
                                                color: themeDefault.colors.primary,
                                                fontWeight: "bold"
                                            }}>{I18n.get('TERM_AND_CONDITIONS1')}
                                            <Text>{I18n.get('TERM_AND_CONDITIONS2')}</Text>
                                        </Text>
                                    </Text>
                                </View>
                                {
                                    touched?.isTerms && errors?.isTerms && (
                                        <HelperText type="error">
                                            {I18n.get(errors.isTerms)}
                                        </HelperText>
                                    )
                                }
                            </View>

                            <Button icon="account-circle"
                                    style={{
                                        ...mbCommonStyles.submitBtn,
                                        ...{
                                            marginVertical: 20,
                                        }
                                    }}
                                    disabled={Object.keys(errors).length > 0}
                                    mode="contained" onPress={handleSubmit}>
                                {I18n.get('SING_UP')}
                            </Button>
                        </Fragment>
                    )}
                </Formik>

                <MBDividerText text={I18n.get('OR')} textColor={null}/>

                <View style={{
                    marginVertical: 5,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: "row",
                    paddingBottom: 20
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '900',
                        color: '#000000'
                    }}>
                        {I18n.get('HAVE_ACCOUNT')}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                        <Text style={styles.forgotPasswordButtonText}> {I18n.get('SING_IN')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: Constants.statusBarHeight,
    },
    scrollView: {
        marginHorizontal: 20,
    },
    text: {
        fontSize: 36
    },
    textLabel: {
        fontSize: 36,
        color: '#97A19A'
    },
    input: {
        borderColor: '#97A19A'
    },
    footerButtonContainer: {
        marginVertical: 5,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row"
    },
    forgotPasswordButtonText: {
        color: '#0771B8',
        fontSize: 18,
        fontWeight: 'bold'
    }
});
