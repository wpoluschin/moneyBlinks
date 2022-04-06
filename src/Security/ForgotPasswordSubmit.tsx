import React, {useContext, useState} from "react";
import {Auth, I18n} from "aws-amplify";
import Constants from "expo-constants";
import {Image, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {Button, Dialog, HelperText, Paragraph, Portal, Text, TextInput} from "react-native-paper";
import {Formik} from "formik";
import * as Yup from "yup";

import {mbCommonStyles} from "../../constants/styles";
import {pwdMatch, usrMatch} from "../../functions/functions";
import MBContext from "../../contexts/MoneyBlinks/MBContext";

export default function ForgotPasswordSubmit({ route, navigation }: any) {

    const [passwordView, setPasswordView] = useState(false);
    const [message, setMessage] = useState('TEXT_CONFIRM_CODE');

    const [visible, setVisible] = useState(true);

    const [error, setError] = useState(null);

    const { handleLoading }: any = useContext(MBContext);

    const hideDialog = () => {
        setVisible(false);
    }

    const moveToHome = () => {
        setVisible(false);
        navigation.navigate('SignIn');
    }

    async function onForgotPassword(values: any) {
        handleLoading(true);
        try {
            await Auth.forgotPasswordSubmit(values?.username, values?.code, values?.password);
            setMessage('TEXT_RECOVERY_INFO');
            setVisible(true);
        } catch (e) {
            console.log(e);
            setError(e.message || e.errors[0].message || e);
        } finally {
            handleLoading(false);
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
                           marginBottom: -220
                       }}/>
                {
                    error && (
                        <Text style={{
                            width: '100%',
                            color: '#E76060',
                            fontWeight: "bold",
                            fontSize: 18,
                            marginVertical: 20
                        }}>
                            {I18n.get(error)}
                        </Text>
                    )
                }
                <Formik
                    initialValues={{
                        username: route?.params?.username || '',
                        code: '',
                        password: ''
                    }}
                    validationSchema={Yup.object().shape({
                        username: Yup.string().nullable()
                            .matches(usrMatch,'USERNAME_INVALID')
                            .min(4, 'USERNAME_INVALID')
                            .required('USERNAME_IS_REQUIRED'),
                        password: Yup.string().nullable()
                            .matches(pwdMatch, 'PASSWORD_INVALID')
                            .min(8, 'PASSWORD_INVALID')
                            .required('PASSWORD_IS_REQUIRED'),
                        code: Yup.string().min(6).max(6).nullable().required(),
                    })}
                    onSubmit={onForgotPassword}>
                    {({
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          errors,
                          touched,
                          values
                      }) => (
                        <>
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
                                <TextInput mode='outlined'
                                           label={I18n.get('CODE')}
                                           placeholder={I18n.get('CODE')}
                                           left={
                                               <TextInput.Icon
                                                   color="#97A19A"
                                                   name="check-circle"/>
                                           }
                                           style={{
                                               backgroundColor: '#EEEEEE',
                                               borderColor: '#97A19A'
                                           }}
                                           selectionColor="#97A19A"
                                           underlineColor="#97A19A"
                                           value={values?.code}
                                           onBlur={handleBlur('code')}
                                           onChangeText={handleChange('code')}
                                           keyboardType="number-pad"
                                           textContentType="oneTimeCode"
                                           error={!!errors?.code}/>
                                {
                                    touched?.code && errors?.code && (
                                        <HelperText type="error">
                                            {I18n.get('INVALID_CODE')}
                                        </HelperText>
                                    )
                                }
                            </View>

                            <View style={{marginBottom: 10}}>
                                {
                                    !passwordView ? (
                                        <TextInput mode='outlined'
                                                   label={I18n.get('PASSWORD_INPUT_RECOVERY')}
                                                   placeholder={I18n.get('PASSWORD_PLACEHOLDER_RECOVERY')}
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
                                                           onPress={() => setPasswordView(true)}
                                                       />
                                                   }/>
                                    ) : (
                                        <TextInput mode='outlined'
                                                   label={I18n.get('PASSWORD_INPUT_RECOVERY')}
                                                   placeholder={I18n.get('PASSWORD_PLACEHOLDER_RECOVERY')}
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
                                                   value={values?.password}
                                                   autoCapitalize="none"
                                                   onBlur={handleBlur('password')}
                                                   onChangeText={handleChange('password')}
                                                   error={!!errors?.password}
                                                   right={
                                                       <TextInput.Icon
                                                           name="eye"
                                                           color="#97A19A"
                                                           onPress={() => setPasswordView(false)}
                                                       />
                                                   }/>
                                    )
                                }
                                {
                                    touched?.password && errors?.password && (
                                        <HelperText type="error">
                                            {I18n.get(errors?.password)}
                                        </HelperText>
                                    )
                                }
                            </View>

                            <Button icon="lock-open"
                                    style={mbCommonStyles.submitBtn}
                                    disabled={Object.keys(errors).length > 0}
                                    mode="contained" onPress={handleSubmit}>
                                {I18n.get('RECOVERY')}
                            </Button>
                        </>
                    )}
                </Formik>
            </ScrollView>
            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>{I18n.get('TITLE_INFO')}</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>{I18n.get(message)}</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={message === 'TEXT_CONFIRM_CODE' ? hideDialog : moveToHome}>OK</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
