import React, {useContext, useEffect, useState} from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import {Button, HelperText, List, Text, TextInput} from "react-native-paper";
import {API, graphqlOperation, I18n} from "aws-amplify";
import {Formik} from "formik";
import * as Yup from "yup";
import {useNavigation} from "@react-navigation/native";

import {themeDark, themeDefault} from "../../constants/Colors";
import {mbCommonStyles} from "../../constants/styles";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import {upDownCash} from "../graphql/mutations";
import {TxType} from "../API";
import * as LocalAuthentication from "expo-local-authentication";

export default function UpCashMoney() {

    const navigation = useNavigation();
    let formRef: any = null;
    const {mbUser, handleLoading, handleError}: any = useContext(MBContext);
    const [total, setTotal] = useState<number>(10);
    const [code, setCode] = useState<string | null>(null);
    const [isBiometric, setIsBiometric] = useState(false);

    useEffect(() => {
        async function checkBiometric() {
            const data = await LocalAuthentication.hasHardwareAsync();
            setIsBiometric(data);
        }

        async function createCode() {
            handleLoading(true);
            try {
                const {
                    data: {
                        upDownCash: dataOut
                    }
                }: any = await API.graphql(graphqlOperation(
                    upDownCash, {
                        values: JSON.stringify({
                            userId: mbUser?.id,
                            txType: TxType.UP_MONEY_CASH
                        })
                    }
                ));
                const response = JSON.parse(dataOut);
                if (response?.statusCode === 200) {
                    setCode(response?.body?.code);
                    formRef?.setFieldValue('code', response?.body?.code, true);
                    formRef?.setFieldValue('codeId', response?.body?.codeId, true);
                }
            } catch (e) {
                handleError(I18n.get(e?.message || e?.errors[0].message || e), themeDefault.colors.error);
            } finally {
                handleLoading(false);
            }
        }

        checkBiometric();
        createCode();

        return () => {
            setCode(null);
        }
    }, []);

    const totalBlink = (values: any) => {
        setTimeout(() => {
            let subTotal = values?.amount || 0;
            values['total'] = subTotal;
            setTotal(subTotal);
        }, 400);
    }

    async function onConfirmTx(values: any, type?: string) {
        if (isBiometric) {
            const { success } = await LocalAuthentication.authenticateAsync({
                promptMessage: I18n.get('CONFIRM_TEXT'),
                cancelLabel: I18n.get('CANCEL_TEXT')
            });
            if (success && !type) {
                await onUpAmount(values)
            }
        }
    }

    const onUpAmount = async (values: any) => {
        handleLoading(true);
        try {
            const dataIn = Object.assign({}, values);
            const {
                data: {
                    upDownCash: dataOut
                }
            }: any = await API.graphql(graphqlOperation(
                upDownCash, {
                    values: JSON.stringify(dataIn)
                }
            ));
            const response = JSON.parse(dataOut);
            if (response?.statusCode === 200) {
                navigation.navigate('Home');
            }
        } catch (e) {
            handleError(I18n.get(e?.message || e?.errors[0].message || e), themeDefault.colors.error);
        } finally {
            handleLoading(false);
        }
    }

    return (
        <View style={mbCommonStyles.container}>
            <Formik
                initialValues={{
                    amount: 10,
                    currency: mbUser?.currency || "USD",
                    code: code,
                    codeId: null,
                    total: 10,
                    txType: TxType.UP_MONEY_CASH,
                    userId: mbUser?.id
                }}
                validationSchema={
                    Yup.object().shape({
                        amount: Yup.number().nullable()
                            .min(10, 'AMOUNT_SEND_MIN').max(2000, 'AMOUNT_SEND_MAX')
                            .required('AMOUNT_SEND_REQ'),
                        currency: Yup.string()
                            .nullable()
                            .min(3).max(3)
                            .required(),
                        code: Yup.string().nullable().required(),
                        codeId: Yup.string().nullable().required(),
                        txType: Yup.string().required(),
                        userId: Yup.string().nullable().required()
                    })
                }
                innerRef={(ref) => {
                    if (!formRef) {
                        formRef = ref;
                    }
                }}
                validate={values => totalBlink(values)}
                onSubmit={values => onConfirmTx(values)}>
                {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      setFieldTouched,
                      setFieldValue
                  }) => (
                    <ScrollView style={mbCommonStyles.scrollView}>
                        <View style={styles.view}>
                            <Text style={styles.textCashMoney}>
                                {I18n.get('TEXT_UP_CASH_MONEY')}
                            </Text>
                        </View>
                        <View style={mbCommonStyles.viewForm}>
                            <TextInput
                                theme={themeDark}
                                mode='outlined'
                                label={I18n.get('AMOUNT_UP')}
                                placeholder={'1000.00'}
                                keyboardType="number-pad"
                                value={`${values.amount}`}
                                onBlur={() => {
                                    handleBlur('amount');
                                }}
                                error={!!errors.amount}
                                onChangeText={text => {
                                    handleChange('amount');
                                    setFieldTouched('amount');
                                    setFieldValue('amount', Number(text), true);
                                }}
                                style={{textAlign: 'right'}}
                                left={
                                    <TextInput.Affix
                                        text={values?.currency}/>
                                }/>
                            {
                                errors?.amount && touched?.amount && (
                                    <HelperText type="error">
                                        {I18n.get(errors.amount)}
                                    </HelperText>
                                )
                            }
                        </View>
                        <View style={{
                            flex: 1,
                            marginTop: 10,
                            flexDirection: "row",
                        }}>
                            <View style={{
                                flex: 0.6,
                                backgroundColor: '#EEEEEE',
                                height: 50,
                                flexDirection: "row",
                                justifyContent: "space-around"
                            }}>
                                <Text style={styles.totalTextLeft}>
                                    {values?.currency || 'USD'}
                                </Text>
                                <Text style={styles.totalTextRight}>
                                    {`$ ${total.toFixed(2)}`}
                                </Text>
                            </View>
                            <View style={{
                                flex: 0.4,
                                height: 50
                            }}>
                                <Text style={styles.helpTotal}>
                                    {I18n.get('VALUE_TO_PAID')}
                                </Text>
                            </View>
                        </View>
                        <View style={{
                            ...styles.view,
                            marginVertical: 20
                        }}>
                            <Text style={styles.textCode}>{I18n.get('CODE_GENERATE')}</Text>
                        </View>
                        <View style={styles.view}>
                            <Text style={styles.codeText}>{values?.code}</Text>
                        </View>
                        <View style={{
                            ...styles.view
                        }}>
                            <List.Section>
                                <List.Subheader>{I18n.get('MARKER_AVAILABLE')}</List.Subheader>
                                <List.Item
                                    title={I18n.get('Store 1')}
                                    description={'Street, Ave'}
                                    titleStyle={styles.textCashMoney}
                                    left={() => <List.Icon icon="storefront"/>}
                                    right={() => <List.Icon icon="map-marker"/>}/>
                            </List.Section>
                        </View>
                        <Button icon="check"
                                style={mbCommonStyles.submitBtn}
                                mode="contained"
                                onPress={handleSubmit}>
                            {I18n.get('COMPLETED_BTN')}
                        </Button>
                    </ScrollView>
                )}
            </Formik>
        </View>
    );
}

const styles = StyleSheet.create({
    view: {
        paddingVertical: 10
    },
    textCashMoney: {
        fontSize: 15,
        color: themeDefault.colors.primary,
        textAlign: "justify"
    },
    textCode: {
        marginTop: 20,
        fontSize: 20,
        color: themeDefault.colors.primary,
        textAlign: "center"
    },
    codeText: {
        fontSize: 24,
        color: themeDefault.colors.warn,
        textAlign: "center"
    },
    totalTextLeft: {
        flex: 0.3,
        fontWeight: "bold",
        fontSize: 18,
        alignSelf: "flex-start",
        color: '#97A19A',
        textAlign: "left",
        alignItems: 'center',
        alignContent: 'center',
        paddingLeft: 5,
        height: 50,
        textAlignVertical: "center"
    },
    totalTextRight: {
        flex: 0.7,
        fontSize: 20,
        textAlign: "right",
        fontWeight: "bold",
        alignItems: 'center',
        alignContent: 'center',
        color: themeDefault.colors.warn,
        alignSelf: "flex-end",
        height: 50,
        paddingRight: 5,
        textAlignVertical: "center"
    },
    helpTotal: {
        flex: 1,
        fontSize: 18,
        alignSelf: "flex-start",
        color: '#97A19A',
        textAlign: "left",
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 10,
        height: 50,
        textAlignVertical: "center"
    },
})
