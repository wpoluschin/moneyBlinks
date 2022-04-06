import React, {useState, Fragment, useContext} from "react";
import {Image, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {Formik} from "formik";
import * as Yup from 'yup';
import {Button, Dialog, HelperText, Paragraph, Portal, TextInput} from "react-native-paper";
import {Auth, I18n} from "aws-amplify";
import Constants from "expo-constants";

import {mbCommonStyles} from "../../constants/styles";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import {themeDefault} from "../../constants/Colors";

// @ts-ignore
export default function ConfirmAccount({ route, navigation }) {

    const {username} = route?.params;
    const [message, setMessage] = useState<string | null>('TEXT_CONFIRM_CODE');
    const infoConfirm = {
        username,
        code: ''
    };

    const { handleLoading, handleError }: any = useContext(MBContext);

    const hideDialog = () => setMessage(null);

    const navigateToHome = () => {
        navigation.navigate('SignIn');
    }

    async function onConfirmCode(values: any) {
        handleLoading(true);
        try {
            await Auth.confirmSignUp(values?.username, values?.code);
            setMessage('TEXT_ACCOUNT_CREATE');
            handleLoading(false);
        } catch (e) {
            handleLoading(false);
            handleError(e.message, themeDefault.colors.error);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <Image source={require('../../assets/images/logo-mb.png')} style={{
                    resizeMode: "contain",
                    width: '100%',
                    marginTop: -200,
                    marginBottom: -220
                }}/>
                <Formik
                    initialValues={infoConfirm}
                    validationSchema={
                        Yup.object().shape({
                            username: Yup.string().nullable()
                                .min(4).required('USERNAME_IS_REQUIRED'),
                            code: Yup.string().nullable()
                                .min(6, 'INVALID_CODE').max(6, 'INVALID_CODE')
                                .required('INVALID_CODE')
                        })
                    }
                    onSubmit={onConfirmCode}>
                    {({
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          errors,
                          touched,
                          values
                      }) => (
                        <Fragment>
                            <View style={{ marginBottom: 20 }}>
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
                                           editable={!username}
                                           style={{
                                               backgroundColor: '#EEEEEE',
                                               borderColor: '#97A19A'
                                           }}/>
                            </View>
                            <View style={{ marginBottom: 20 }}>
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
                                           error={!!errors.code}/>
                                {
                                    touched?.code && errors?.code && (
                                        <HelperText type="error">
                                            {I18n.get('INVALID_CODE')}
                                        </HelperText>
                                    )
                                }
                            </View>

                            <Button icon="lock-open"
                                    style={mbCommonStyles.submitBtn}
                                    disabled={Object.keys(errors).length > 0}
                                    mode="contained" onPress={handleSubmit}>
                                {I18n.get('BTN_CONFIRM')}
                            </Button>
                        </Fragment>
                    )}
                </Formik>
            </ScrollView>
            <Portal>
                <Dialog visible={message !== null} onDismiss={hideDialog}>
                    <Dialog.Title>{I18n.get('TITLE_INFO')}</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>{I18n.get(message)}</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={message === 'TEXT_CONFIRM_CODE' ? hideDialog : navigateToHome}>OK</Button>
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
