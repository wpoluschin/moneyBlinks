import React, {Fragment, useContext, useEffect, useState} from "react";
import {SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {FieldArray, Formik} from "formik";
import * as Yup from "yup";
import {API, graphqlOperation, I18n} from "aws-amplify";
import DropDownPicker from "react-native-dropdown-picker";
import {FontAwesome5, MaterialCommunityIcons} from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import {Button, Divider, HelperText, Text, TextInput} from "react-native-paper";

import MBContext from "../../contexts/MoneyBlinks/MBContext";
import HomeBlinkContext from "../../contexts/HomeBlink/HomeBlinkContext";
import {mbCommonStyles} from "../../constants/styles";
import {TxStatus, TxType} from "../API";
import {themeDefault} from "../../constants/Colors";
import {completeTx, createPay, createTx} from "../graphql/mutations";

export default function CompletedRequestBlink() {

    const {handleLoading, handleError, mbUser}: any = useContext(MBContext);
    const {
        handlePaymentsMethodsByCountry,
        handleListChargesAndTaxes,
        amount,
        paymentMethodsToSend,
        handleBlinkUserId,
        handleBlinkSettings,
        handleReloadFinancial,
        handleNavigateToHme,
        handleTxType,
        blinkUserId,
        blinkSettings,
        taxes,
        charges,
        moveTx,
        handleProcessBlinks
    }: any = useContext(HomeBlinkContext);

    let formRef: any = null;
    const navigation = useNavigation();

    const [usedMethods, setUsedMethods] = useState<any[]>([]);
    const [usedMethod, setUsedMethod] = useState<any>(null);
    const [openUsedMethod, setOpenUsedMethod] = useState<any>(false);

    const [total, setTotal] = useState(0);
    const [isBiometric, setIsBiometric] = useState(false);

    useEffect(() => {
        async function loadPaymentMethod() {
            await handlePaymentsMethodsByCountry(true, mbUser.alpha2Code, mbUser.alpha3Code);
            await handleBlinkUserId();
            await handleBlinkSettings();
            await handleListChargesAndTaxes(mbUser.alpha2Code, mbUser.alpha3Code, null, true);
            const data = await LocalAuthentication.hasHardwareAsync();
            setIsBiometric(data);
        }

        loadPaymentMethod();
    }, []);

    useEffect(() => {
        if (paymentMethodsToSend && paymentMethodsToSend.length > 0) {
            const paymentIts: any = [];
            paymentMethodsToSend.map((payment: any) => {
                let label: string;
                if (payment?.paymentMethod?.translate) {
                    const parseJSON = JSON.parse(payment.paymentMethod.translate);
                    label = parseJSON[mbUser.locale || 'es'] || payment.paymentMethod.name;
                } else {
                    label = payment.paymentMethod.name;
                }
                paymentIts.push({
                    label,
                    value: payment?.paymentTypeCode
                });
                payment.users?.items?.map((userPayment: any) => {
                    const settings = userPayment.settings ? JSON.parse(userPayment.settings) : {};
                    paymentIts.push({
                        value: userPayment.id,
                        label: userPayment.label,
                        icon: () => userPayment?.payType === 'CARD' ?
                            <FontAwesome5
                                name={`${settings.type ? `cc-${settings.type}` : 'credit-card'}`}
                                type="font-awesome-5"
                                color={themeDefault.colors.primary}
                                size={24}/> :
                            <MaterialCommunityIcons name="bank"
                                                    color={themeDefault.colors.primary}
                                                    size={24}/>,
                        parent: payment?.paymentTypeCode
                    });
                });
            });
            setUsedMethods(paymentIts);
        }
    }, [paymentMethodsToSend]);

    useEffect(() => {
        if (charges && taxes) {
            formRef?.setFieldValue('taxes', taxes, true);
            formRef?.setFieldValue('charges', charges, true);
        }
    }, [
        charges, taxes
    ])

    useEffect(() => {
        if (blinkSettings) {
            formRef?.setFieldValue('blinkSettingId', blinkSettings.id, true);
            formRef?.setFieldValue('blinksSettings', blinkSettings, true);
        }
    }, [
        blinkSettings
    ])

    useEffect(() => {
        if (blinkUserId) {
            formRef?.setFieldValue('blinkUserId', blinkUserId, true);
        }
    }, [
        blinkUserId
    ])

    useEffect(() => {
        if (formRef) {
            const filters = usedMethods.filter((it: any) => it.value?.indexOf(usedMethod) === 0);
            if (filters.length > 0 && filters[0]?.parent) {
                formRef?.setFieldValue('paymentType', filters[0].parent, true);
            } else if (filters.length > 0 && !filters[0].parent) {
                formRef?.setFieldValue('paymentType', filters[0].value, true);
            }
            formRef?.setFieldTouched('paymentMethod');
            formRef?.setFieldValue('paymentMethod', usedMethod, true);
        }
    }, [
        usedMethod
    ]);

    function totalBlink(values: any) {
        setTimeout(() => {
            let subTotal: number = parseFloat(values.amount);
            if (values?.valuesBlinkSetting && Object.keys(values?.valuesBlinkSetting).length > 0) {
                subTotal += values?.valuesBlinkSetting?.blinkCost || 0;
            }
            const cards: any = [];
            let subTotalCommission: number = 0;
            let subTotalTax: number = 0;
            values?.taxes.forEach((tax: any) => {
                const settings = JSON.parse(tax.settings) || {};
                subTotalTax += (eval(settings?.formula) || tax.total) || 0;
            });
            values?.charges.forEach((charge: any) => {
                const settings = JSON.parse(charge.settings) || {};
                if (charge.chargeCode.indexOf('CARD') < 0) {
                    subTotalCommission += (eval(settings?.formula) || charge.total) || 0;
                } else {
                    cards.push(charge);
                }
            });
            values['subTotalCommission'] = subTotalCommission;
            values['subTotalTax'] = subTotalTax;
            subTotal += (subTotalCommission + subTotalTax);
            cards.forEach((charge: any) => {
                const settings = JSON.parse(charge.settings) || {};
                subTotal += (eval(settings?.formula) || charge.total) || 0;
            });
            values['total'] = subTotal;
            setTotal(subTotal);
        }, 500);
    }

    const onReject = async (tx: any) => {
        const dataIn = {
            tx,
            userId: mbUser?.id,
            code: tx?.moneyBlinksCode?.code,
            txType: TxType.REQUEST,
            txStatus: TxStatus.REJECT
        };
        handleLoading(true);
        try {
            const {
                data: {
                    completeTx: txData
                }
            }: any = await API.graphql(graphqlOperation(completeTx, {
                values: JSON.stringify(dataIn)
            }));
            const response = JSON.parse(txData);
            if (response.statusCode) {
                navigation.navigate('Home')
            }
        } catch (e) {
            handleError(
                I18n.get(e?.message || e?.errors[0].message || 'AN_ERROR_OCCURRED'),
                themeDefault.colors.error
            );
        } finally {
            handleLoading(false);
        }
    }

    const onCompleted = async (values: any) => {
        handleLoading(true);
        try {
            values['userId'] = mbUser?.id;
            values['description'] = `Blink shipping for the value of ${values?.total} ${values?.currency}`;
            const {
                data: {
                    createPay: payOrder
                }
            }: any = await API.graphql(graphqlOperation(createPay, {
                payInput: JSON.stringify(values)
            }));
            const payment: any = JSON.parse(payOrder);
            const {statusCode, payInfo}: any = payment;
            if (statusCode < 400) {
                values['payInfo'] = payInfo;
            }
            const dataIn = {...values};
            if (values?.message) {
                dataIn.tx.message = values.message;
            }
            const {
                data: {
                    completeTx: txData
                }
            }: any = await API.graphql(graphqlOperation(completeTx, {
                values: JSON.stringify(dataIn)
            }));
            const response = JSON.parse(txData);
            if (response.statusCode < 400) {
                handleTxType(TxType.SEND);
                handleReloadFinancial(true);
                handleNavigateToHme(true);
                navigation.navigate('Home')
            } else {
                throw Error('AN_ERROR_OCCURRED');
            }
        } catch (e) {
            handleError(
                I18n.get(e?.message || e?.errors[0].message || 'AN_ERROR_OCCURRED'),
                themeDefault.colors.error
            );
        } finally {
            handleLoading(false);
        }
    }

    async function onConfirmTx(values: any) {
        if (isBiometric) {
            const { success } = await LocalAuthentication.authenticateAsync({
                promptMessage: I18n.get('CONFIRM_TEXT'),
                cancelLabel: I18n.get('CANCEL_TEXT')
            });
            if (success) {
                await onCompleted(values)
            }
        }
    }

    return (
        <SafeAreaView style={mbCommonStyles.container}>
            <Formik
                initialValues={{
                    tx: moveTx,
                    amount: moveTx?.amount,
                    taxes: [],
                    charges: [],
                    paymentMethod: null,
                    paymentType: null,
                    currency: mbUser?.currency || 'USD',
                    message: '',
                    requestMessage: '',
                    contact: moveTx.receipt,
                    isMBContact: true,
                    blinkSettingId: null,
                    blinkUserId: null,
                    blinksSettings: {
                        blinkPrice: 0
                    },
                    subTotalTax: 0,
                    subTotalCommission: 0,
                    txType: moveTx?.txType,
                    txStatus: TxStatus.CONFIRM,
                    userId: mbUser?.id,
                    code: moveTx?.moneyBlinksCode?.code
                }}
                enableReinitialize={moveTx || blinkUserId || usedMethods}
                validate={totalBlink}
                validationSchema={
                    Yup.object().shape({
                        amount: Yup.number()
                            .min(10, 'AMOUNT_SEND_MIN')
                            .max(2000, 'AMOUNT_SEND_MAX')
                            .required('AMOUNT_SEND_REQ'),
                        paymentType: Yup.string()
                            .nullable().required('PAYMENT_METHOD_REQ'),
                        paymentMethod: Yup.string()
                            .nullable().when('paymentType', {
                                is: 'AMOUNTMB',
                                then: Yup.string().nullable().notRequired(),
                                otherwise: Yup.string().nullable().required('PAYMENT_METHOD_USED_REQ')
                            }),
                        contact: Yup.object().shape({
                            id: Yup.string().required('CONTACT_REQUIRED')
                        }),
                        blinkUserId: Yup.string().nullable().notRequired(),
                        blinkSettingId: Yup.string().nullable().when('blinkUserId', {
                            is: null,
                            then: Yup.string().nullable().required(),
                            otherwise: Yup.string().nullable(),
                        }),
                        message: Yup.string().nullable()
                            .max(160, 'MAX_CHARACTERS')
                            .notRequired(),
                        charges: Yup.array().of(
                            Yup.object().shape({
                                id: Yup.string().required(),
                                settings: Yup.string().required(),
                                total: Yup.number()
                                    .min(0, 'AMOUNT_CHARGE_MIN')
                                    .required('AMOUNT_CHARGE_REQ')
                            })
                        ),
                        taxes: Yup.array().of(
                            Yup.object().shape({
                                id: Yup.string().required(),
                                settings: Yup.string().required(),
                                total: Yup.number()
                                    .min(0, 'AMOUNT_TAX_MIN')
                                    .required('AMOUNT_TAX_REQ')
                            })
                        )
                    })
                }
                innerRef={(ref) => {
                    if (!formRef) {
                        formRef = ref;
                    }
                }}
                onSubmit={onConfirmTx}>
                {({
                      handleChange,
                      handleBlur,
                      setFieldValue,
                      handleSubmit,
                      errors,
                      touched,
                      values
                  }) => (
                    <ScrollView style={mbCommonStyles.scrollView}>
                        <View style={{
                            marginTop: 20
                        }}>
                            <Text style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: themeDefault.colors.primary,
                                textAlign: "center",
                                textAlignVertical: "center",
                                lineHeight: 28
                            }}>{`${moveTx?.receipt?.fullName} ${I18n.get('TEXT_BLINK_USER_RECEIVED')} $ ${moveTx?.amount?.toFixed(2)} ${moveTx?.currency}`}</Text>
                            <Divider style={{backgroundColor: '#0771B8', height: 2, marginVertical: 15}}/>
                            <Text style={{
                                height: 80,
                                fontSize: 16,
                                color: themeDefault.colors.warn,
                                textAlign: "justify",
                                lineHeight: 28
                            }}>{moveTx?.requestMessage}</Text>
                            <Divider style={{backgroundColor: '#0771B8', height: 2, marginVertical: 15}}/>
                        </View>
                        <View style={{
                            marginBottom: 20
                        }}>
                            <TextInput
                                mode="outlined"
                                label={I18n.get('MESSAGE')}
                                value={values?.message}
                                numberOfLines={4}
                                error={!!errors?.message}
                                onBlur={handleBlur('message')}
                                onChangeText={text => {
                                    handleChange('message');
                                    setFieldValue('message', text, true);
                                }}
                                multiline
                                left={
                                    <TextInput.Icon
                                        color="#97A19A"
                                        name="message-settings"/>
                                }
                                editable={true}/>
                            {
                                errors?.message && touched?.message && (
                                    <HelperText type="error">
                                        {I18n.get(errors.message)}
                                    </HelperText>
                                )
                            }
                        </View>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            marginVertical: 15,
                            color: themeDefault.colors.primary,
                        }}>
                            {I18n.get('GET_FOUND_ORIGIN')}
                        </Text>
                        {
                            usedMethods && usedMethods.length > 0 && (
                                <View style={{
                                    ...mbCommonStyles.viewForm,
                                    zIndex: 25
                                }}>
                                    <DropDownPicker
                                        open={openUsedMethod}
                                        setOpen={setOpenUsedMethod}
                                        itemKey="value"
                                        closeAfterSelecting={true}
                                        searchable={true}
                                        listMode="MODAL"
                                        mode="BADGE"
                                        multiple={false}
                                        placeholder={I18n.get('PAY_WITH')}
                                        searchPlaceholder={I18n.get('SEARCH_ITEM')}
                                        items={usedMethods}
                                        value={usedMethod}
                                        setValue={setUsedMethod}
                                    />
                                    {
                                        mbUser?.isUsedMoneyBlinkAmount && (
                                            <HelperText type="info" style={{
                                                fontSize: 8
                                            }}>
                                                {I18n.get('PAYMENT_NOTE')}
                                            </HelperText>
                                        )
                                    }
                                    {
                                        touched?.paymentMethod && errors?.paymentMethod && (
                                            <HelperText type="error">
                                                {I18n.get(errors.paymentMethod)}
                                            </HelperText>
                                        )
                                    }
                                </View>
                            )
                        }
                        <Text style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            marginVertical: 15,
                            color: themeDefault.colors.primary,
                        }}>
                            {I18n.get('GET_VALUES_TO_TRANSFER')}
                        </Text>
                        {
                            values?.blinkSettingId && !values?.blinkUserId && (
                                <View style={{marginBottom: 10}}>
                                    <TextInput mode='outlined'
                                               style={{
                                                   textAlign: 'right'
                                               }}
                                               label={`${I18n.get('USED_BLINK_PAY')} 1 Blink`}
                                               placeholder={`${I18n.get('USED_BLINK_PAY')} 1 Blink`}
                                               keyboardType="number-pad"
                                               value={`${values?.blinksSettings?.blinkPrice?.toFixed(2)}`}
                                               editable={false}/>
                                </View>
                            )
                        }
                        <FieldArray name="taxes"
                                    render={() => {
                                        const listTaxes: any[] = values.taxes;
                                        return (
                                            <Fragment>
                                                {
                                                    listTaxes.length > 0 && (
                                                        listTaxes.map((tax: any, index: number) => {
                                                            const settings = JSON.parse(tax.settings) || {};
                                                            listTaxes[index].total = eval(settings?.formula) || 0;
                                                            const translateCharge = JSON.parse(tax?.translate) || {};
                                                            const labelCharge = translateCharge[mbUser?.locale];

                                                            return listTaxes[index].total > 0 ? (
                                                                <View key={`${tax?.id}-${index}`}
                                                                      style={{
                                                                          marginBottom: 10,
                                                                          flexDirection: "row",
                                                                          flex: 1
                                                                      }}>
                                                                    <View style={{
                                                                        alignItems: "flex-end",
                                                                        flex: 0.4
                                                                    }}>
                                                                        <Text style={{
                                                                            borderBottomWidth: 1,
                                                                            textAlignVertical: "center",
                                                                            color: themeDefault.colors.placeholder,
                                                                            borderBottomColor: themeDefault.colors.text,
                                                                            marginRight: 5,
                                                                            fontSize: 16,
                                                                            height: 50,
                                                                            paddingLeft: 20
                                                                        }}>
                                                                            + {listTaxes[index].total.toFixed(2)}
                                                                        </Text>
                                                                    </View>
                                                                    <View
                                                                        style={{
                                                                            alignItems: "flex-start",
                                                                            flex: 0.6
                                                                        }}>
                                                                        <Text style={{
                                                                            textAlignVertical: "center",
                                                                            color: themeDefault.colors.placeholder,
                                                                            marginLeft: 5,
                                                                            fontSize: 16,
                                                                            height: 50
                                                                        }}>
                                                                            {labelCharge}
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                            ) : (<View key={`${tax?.id}-${index}`}/>)
                                                        })
                                                    )
                                                }
                                            </Fragment>
                                        )
                                    }}/>
                        <FieldArray name="charges"
                                    render={() => {
                                        const listCharges: any[] = values.charges;
                                        return (
                                            <Fragment>
                                                {
                                                    listCharges.length > 0 && (
                                                        listCharges.map((charge: any, index: number) => {
                                                            const settings = JSON.parse(charge.settings) || {};
                                                            listCharges[index].total = eval(settings?.formula) || 0;
                                                            const translateCharge = JSON.parse(charge?.translate) || {};
                                                            const labelCharge = translateCharge[mbUser?.locale];

                                                            return listCharges[index].total > 0 ? (
                                                                <View key={`${charge?.id}-${index}`}
                                                                      style={{
                                                                          marginBottom: 10,
                                                                          flexDirection: "row",
                                                                          flex: 1
                                                                      }}>
                                                                    <View style={{
                                                                        alignItems: "flex-end",
                                                                        flex: 0.4
                                                                    }}>
                                                                        <Text style={{
                                                                            borderBottomWidth: 1,
                                                                            textAlignVertical: "center",
                                                                            color: themeDefault.colors.placeholder,
                                                                            borderBottomColor: themeDefault.colors.text,
                                                                            marginRight: 5,
                                                                            fontSize: 16,
                                                                            height: 50,
                                                                            paddingLeft: 20
                                                                        }}>
                                                                            + {listCharges[index].total.toFixed(2)}
                                                                        </Text>
                                                                    </View>
                                                                    <View
                                                                        style={{
                                                                            alignItems: "flex-start",
                                                                            flex: 0.6
                                                                        }}>
                                                                        <Text style={{
                                                                            textAlignVertical: "center",
                                                                            color: themeDefault.colors.placeholder,
                                                                            marginLeft: 5,
                                                                            fontSize: 16,
                                                                            height: 50
                                                                        }}>
                                                                            {labelCharge}
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                            ) : (<View key={`${charge?.id}-${index}`}/>)
                                                        })
                                                    )
                                                }
                                            </Fragment>
                                        )
                                    }}/>
                        <View style={{
                            flex: 1,
                            marginTop: 20,
                            flexDirection: "row",
                            alignItems: 'center',
                        }}>
                            <View style={{
                                flex: 0.6,
                                backgroundColor: '#EEEEEE',
                                flexDirection: "row",
                                justifyContent: "space-around"
                            }}>
                                <Text style={styles.totalTextLeft}>
                                    {mbUser?.currency || 'USD'}
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
                        <Button
                            style={styles.okBtn}
                            mode="contained"
                            icon="account-box-multiple"
                            onPress={handleSubmit}>
                            {I18n.get('ACCEPT')}
                        </Button>
                        <View style={{
                            flex: 1,
                            flexDirection: "row",
                            alignContent: "space-between"
                        }}>
                            <TouchableOpacity
                                style={styles.btnInline}
                                onPress={() => navigation.navigate('Home')}>
                                <Text style={styles.textBtn}>{I18n.get('BTN_IGNORE')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    ...styles.btnInline, ['backgroundColor']: themeDefault.colors.warn
                                }}
                                onPress={() => onReject(moveTx)}>
                                <Text style={styles.textBtn}>
                                    {I18n.get('BTN_REJECT')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}
            </Formik>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    okBtn: {
        backgroundColor: themeDefault.colors.header,
        marginHorizontal: 30,
        marginVertical: 20,
        borderRadius: 60,
        padding: 5,
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase'
    },
    btnInline: {
        flex: 0.5,
        backgroundColor: themeDefault.colors.primary,
        marginHorizontal: 5,
        marginVertical: 20,
        borderRadius: 60,
        padding: 5,
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase'
    },
    textBtn: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
        textAlignVertical: "center",
        textAlign: "center",
        marginVertical: 5
    },
    error: {
        fontSize: 24,
        color: '#97A19A',
        textAlign: "center"
    },
    viewInput: {
        marginBottom: 10
    },
    viewRow: {
        flex: 1,
        flexDirection: "row",
        marginBottom: 10
    },
    viewStart60: {
        alignSelf: "flex-start",
        flex: 0.6
    },
    viewStartLabel60: {
        alignSelf: "flex-start",
        flexDirection: "row",
        flex: 0.6,
        alignContent: "space-between",
        textAlignVertical: "center"
    },
    viewEnd40: {
        alignSelf: "flex-end",
        flex: 0.4
    },
    help: {
        paddingLeft: 5,
        color: '#97A19A',
        textAlignVertical: "center"
    },
    labelRow: {
        flexDirection: "row",
        marginVertical: 10,
        alignContent: "space-between"

    },
    totalTextLeft: {
        flex: 0.3,
        fontWeight: "bold",
        fontSize: 18,
        alignSelf: "flex-start",
        color: '#97A19A',
        textAlign: "left",
        alignItems: 'center',
        justifyContent: 'center',
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
        justifyContent: 'center',
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
    }
});
