import React, {useContext, useState} from "react";
import {Dimensions, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {Formik} from "formik";
import * as Yup from "yup";
import {Button, HelperText, Snackbar, Text, TextInput} from "react-native-paper";
import {API, graphqlOperation, I18n} from "aws-amplify";

import {mbCommonStyles} from "../../constants/styles";
import {themeDefault} from "../../constants/Colors";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import {validateCode} from "../graphql/mutations";

const {height} = Dimensions.get("screen")

export default function HaveCode() {

    const navigation: any = useNavigation();

    const {mbUser, handleLoading}: any = useContext(MBContext);

    const [color, setColor] = useState<string>(themeDefault.colors.notification);
    const [messageText, setMessageText] = useState<string | null>(null);
    const [showMessage, setShowMessage] = useState(false);

    const [isTx, setIsTx] = useState(false);

    const onCodeValidate = async (values: any) => {
        handleLoading(true);
        try {
            const {
                data: {
                    validateCode: result
                }
            }: any = await API.graphql(graphqlOperation(
                validateCode, {
                    values: JSON.stringify({
                        code: values.code,
                        userId: mbUser?.id
                    })
                }
            ));
            const response = JSON.parse(result);
            if (response.statusCode && response.statusCode === 200) {
                setShowMessage(true);
                setColor(themeDefault.colors.notification);
                setMessageText('Ya puedes enviar y recibir blinks de forma segura.');
            }
        } catch (e) {
            setShowMessage(true);
            setColor(themeDefault.colors.error);
            setMessageText(I18n.get(e.message || e.errors[0].message || e));
        } finally {
            handleLoading(false);
        }
    }

    const onDismissSnackBar = () => {
        setShowMessage(false);
        if (color !== themeDefault.colors.error) {
            navigation.navigate('Home');
        }
    };

    return (
        <SafeAreaView style={mbCommonStyles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <Formik
                    initialValues={{
                        code: ''
                    }}
                    validationSchema={
                        Yup.object().shape({
                            code: Yup.string()
                                .min(8, 'INVALID_TX_CODE_UNK').max(8, 'INVALID_TX_CODE_UNK')
                                .required('INVALID_TX_CODE_UNK')
                        })
                    }
                    onSubmit={onCodeValidate}>
                    {({
                          touched,
                          errors,
                          values,
                          handleBlur,
                          handleSubmit,
                          setFieldValue
                      }) => (
                        <ScrollView style={mbCommonStyles.scrollView}>
                            <View style={{
                                flex: 1,
                                marginVertical: 10
                            }}>
                                <Text style={{
                                    textAlign: 'center',
                                    fontSize: 20
                                }}>{I18n.get('CODE_TEXT')}</Text>

                                <View style={{
                                    marginVertical: 30
                                }}>
                                    <TextInput
                                        theme={themeDefault}
                                        mode='outlined'
                                        autoCapitalize="characters"
                                        autoCorrect={false}
                                        editable={!isTx}
                                        label={`${I18n.get('CODE_TO_RECEIVED_UNK')}*`}
                                        value={`${values.code}`}
                                        onBlur={() => {
                                            handleBlur('code');
                                        }}
                                        error={!!errors.code}
                                        onChangeText={text => {
                                            setFieldValue('code', text, true);
                                        }}
                                        style={{
                                            textAlign: 'center',
                                            textTransform: 'uppercase'
                                        }}/>
                                    {
                                        errors?.code && touched?.code && (
                                            <HelperText type="error">
                                                {I18n.get(errors?.code)}
                                            </HelperText>
                                        )
                                    }
                                </View>
                                <View>
                                    <Button icon="check"
                                            style={mbCommonStyles.submitBtn}
                                            mode="contained"
                                            onPress={handleSubmit}>
                                        {I18n.get('COMPLETED_BTN')}
                                    </Button>
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </Formik>
            </KeyboardAvoidingView>
            <Snackbar
                theme={{
                    colors: {
                        accent: '#FFFFFF',
                        surface: '#FFFFFF'
                    }
                }}
                style={{
                    backgroundColor: color,
                    marginBottom: 40
                }}
                visible={showMessage}
                onDismiss={onDismissSnackBar}
                action={{
                    label: 'OK',
                    onPress: () => onDismissSnackBar(),
                }}>
                {I18n.get(messageText)}
            </Snackbar>
        </SafeAreaView>
    );
}
