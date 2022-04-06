import React, {Fragment, useContext, useEffect, useState} from "react";
import {KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {FontAwesome5, MaterialCommunityIcons} from "@expo/vector-icons";
import {API} from "@aws-amplify/api";
import {graphqlOperation, I18n} from "aws-amplify";
import {useNavigation} from "@react-navigation/native";
import {FieldArray, Formik} from "formik";
import * as Yup from "yup";
import {Button, HelperText, Text, TextInput} from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";

import MBContext from "../../contexts/MoneyBlinks/MBContext";
import HomeBlinkContext from "../../contexts/HomeBlink/HomeBlinkContext";
import {listByNameOrOrder} from "../graphql/queries";
import {ModelSortDirection, TxType} from "../API";
import {themeDark, themeDefault} from "../../constants/Colors";
import {mbCommonStyles} from "../../constants/styles";
import {upDownCash} from "../graphql/mutations";

export default function DownCashMoney() {

    const {
        mbUser,
        handleLoading,
        handleError
    }: any = useContext(MBContext);
    const navigation: any = useNavigation();

    const {
        taxes,
        charges,
        reloadFinancialInfo,
        handleMoveTx,
        paymentMethodsToSend,
        handlePaymentsMethodsByCountry,
        handleListChargesAndTaxes,
        handleProcessBlinks
    }: any = useContext(HomeBlinkContext);

    let formRef: any = null;
    const [usedMethods, setUsedMethods] = useState<any[]>([]);
    const [usedMethod, setUsedMethod] = useState<any>(null);
    const [openUsedMethod, setOpenUsedMethod] = useState<any>(false);

    const [countries, setCountries] = useState<any[]>([]);
    const [openedCountry, setOpenedCountry] = useState(false);
    const [useCountry, setUseCountry] = useState<any>(null);

    const [totalDeposit, setTotalDeposit] = useState(10);

    const [code, setCode] = useState<string | null>(null);

    useEffect(() => {
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
                            txType: TxType.DOWN_MONEY_CASH
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

        createCode();
        return () => {
            setCode(null);
        }
    }, []);

    useEffect(() => {
        async function loadPaymentMethod() {
            await handlePaymentsMethodsByCountry(false, mbUser.alpha2Code, mbUser.alpha3Code);
            await handleListChargesAndTaxes(mbUser.alpha2Code, mbUser.alpha3Code, null, false);

            const {
                data: {
                    listByNameOrOrder: {
                        items: countryList
                    }
                }
            }: any = await API.graphql(graphqlOperation(listByNameOrOrder, {
                type: "Country",
                filter: {
                    isDownload: {eq: true}
                },
                sortDirection: ModelSortDirection.ASC
            }));
            if (countryList) {
                const list: any[] = [];
                countryList.map((country: any) => {
                    const translate = country.translate ? JSON.parse(country.translate) : {};
                    const item: any = {
                        value: country.id,
                        alpha2Code: country.alpha2Code,
                        alpha3Code: country.alpha3Code,
                        label: translate[mbUser.locale || 'es'] ? translate[mbUser.locale || 'es'] : country.name
                    };
                    if (country?.countryStateId) {
                        item['parent'] = country?.countryStateId;
                    }
                    if (country?.country) {
                        const findIndex = list.findIndex((it: any) => it.value.indexOf(country.country?.id) === 0);
                        if (findIndex < 0) {
                            const parentTranslate: any = JSON.parse(country.country.translate);
                            list.push({
                                value: country.country.id,
                                alpha2Code: country.country.alpha2Code,
                                alpha3Code: country.country.alpha3Code,
                                label: parentTranslate[mbUser.locale || 'es'] || country.country.name,
                                disabled: true
                            });
                        }
                    }
                    list.push(item);
                });
                setCountries(list);
                const fIndex = list.filter((it: any) => it.alpha2Code.indexOf(mbUser?.alpha2Code) === 0 &&
                    it.alpha3Code.indexOf(mbUser?.alpha3Code) === 0
                );
                if (fIndex.length > 0) {
                    setUseCountry(fIndex[0].value);
                    formRef?.setFieldValue('alpha2Code', mbUser?.alpha2Code, true);
                    formRef?.setFieldValue('countryId', fIndex[0].value, true);
                }
            }
        }

        loadPaymentMethod();
    }, []);

    useEffect(() => {
        if (taxes && taxes.length > 0) {
            formRef?.setFieldValue('taxes', taxes, true);
        }
    }, [
        taxes
    ]);

    useEffect(() => {
        if (charges && charges.length > 0) {
            formRef?.setFieldValue('charges', charges, true);
        }
    }, [
        charges
    ])

    useEffect(() => {
        if (useCountry) {
            const fIndex = countries.filter((it: any) => it.value.indexOf(useCountry) === 0);
            if (fIndex.length > 0) {
                formRef?.setFieldValue('alpha2Code', fIndex[0].alpha2Code, true);
                formRef?.setFieldValue('country', fIndex[0].alpha2Code, true);
                recoveryInitialData(fIndex[0].alpha3Code, fIndex[0].alpha2Code);
            }
        } else {
            formRef?.setFieldValue('alpha2Code', null, true);
            formRef?.setFieldValue('country', null, true);
        }
        formRef?.setFieldValue('countryId', useCountry, true);
    }, [useCountry]);

    useEffect(() => {
        if (paymentMethodsToSend && paymentMethodsToSend.length > 0) {
            const paymentIts: any = [];
            paymentMethodsToSend.map((payment: any) => {
                let label: string;
                if (payment?.paymentTypeCode !== 'AMOUNTMB') {
                    if (payment?.paymentMethod?.translate) {
                        const parseJSON = JSON.parse(payment.paymentMethod.translate);
                        label = parseJSON[mbUser.locale || 'es'] || payment.paymentMethod.name;
                    } else {
                        label = payment.paymentMethod.name;
                    }
                    paymentIts.push({
                        label,
                        value: payment?.id,
                        paymentMethod: payment?.paymentTypeCode,
                        disabled: payment?.paymentTypeCode === 'ACCOUNT'
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
                            parent: payment?.id,
                            paymentMethod: payment?.paymentTypeCode,
                        });
                    });
                }
            });
            setUsedMethods(paymentIts);
        }
    }, [paymentMethodsToSend]);

    useEffect(() => {
        if (usedMethod) {
            const filters = usedMethods.filter((it: any) => it.value.indexOf(usedMethod) === 0);
            if (filters.length > 0) {
                formRef?.setFieldValue('paymentMethod', filters[0].paymentMethod, true);
            }
        } else {
            formRef?.setFieldValue('paymentMethod', null, true);
        }
        formRef?.setFieldValue('paymentMethodId', usedMethod, true);
    }, [
        usedMethod
    ]);

    useEffect(() => {
        if (reloadFinancialInfo) {
            handleMoveTx(null);
            navigation.navigate("Home");
        }
    }, [
        reloadFinancialInfo
    ])

    function calcToAmountDeposit(values: any) {
        setTimeout(() => {
            if (values) {
                let subTotal: number = values?.amount;
                values?.taxes.forEach((tax: any) => {
                    const settings = JSON.parse(tax.settings) || {};
                    subTotal -= (eval(settings?.formula) || tax.total) || 0;
                });
                values?.charges.forEach((charge: any) => {
                    const settings = JSON.parse(charge.settings) || {};
                    subTotal -= (eval(settings?.formula) || charge.total) || 0;
                });
                setTotalDeposit(subTotal || 0);
            }
        }, 450);
    }

    async function recoveryInitialData(alpha3Code: string, alpha2Code: string) {
        await handlePaymentsMethodsByCountry(false, alpha2Code, alpha3Code);
        await handleListChargesAndTaxes(alpha2Code, alpha3Code, null, false);
    }

    const onDownloadBlink = async (values: any) => {
        handleLoading(true);
        try {
            const dataIn = Object.assign({}, values);
            // console.log(dataIn);
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
        <SafeAreaView style={mbCommonStyles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <Formik
                    initialValues={{
                        userId: mbUser?.id,
                        alpha2Code: mbUser?.alpha2Code,
                        country: mbUser?.alpha2Code,
                        countryId: '',
                        taxes: [],
                        charges: [],
                        code: '',
                        codeId: null,
                        paymentMethod: '',
                        paymentMethodId: '',
                        amount: 10,
                        currency: mbUser?.currency,
                        amountToDeposit: 10,
                        txType: TxType.DOWN_MONEY_CASH
                    }}
                    innerRef={(ref) => {
                        if (!formRef) {
                            formRef = ref;
                        }
                    }}
                    validate={calcToAmountDeposit}
                    validationSchema={
                        Yup.object().shape({
                            userId: Yup.string()
                                .nullable().required(),
                            code: Yup.string().nullable()
                                .min(8, 'INVALID_CODE')
                                .max(8, 'INVALID_CODE')
                                .required('INVALID_CODE'),
                            codeId: Yup.string().nullable().required(),
                            paymentMethod: Yup.string()
                                .nullable().required(),
                            paymentMethodId: Yup.string()
                                .nullable().required('PAYMENT_METHOD_USED_REQ_DEP'),
                            amountToDeposit: Yup.number()
                                .min(10, 'AMOUNT_SEND_MIN')
                                .max(2000, 'AMOUNT_SEND_MAX')
                                .required('AMOUNT_SEND_REQ'),
                            countryId: Yup.string().nullable()
                                .required('COUNTRY_IS_REQUIRED'),
                        })
                    }
                    onSubmit={onDownloadBlink}>
                    {({
                          touched,
                          errors,
                          values,
                          handleSubmit,
                          setFieldValue,
                          setFieldTouched,
                          handleChange,
                          handleBlur
                      }) => (
                        <ScrollView style={mbCommonStyles.scrollView}>
                            <View style={styles.view}>
                                <Text style={{
                                    ...styles.textCashMoney,
                                    fontWeight: "bold",
                                    fontFamily: "Roboto-Bold",
                                    textAlign: "center"
                                }}>
                                    {I18n.get('TEXT_DOWN_CASH_MONEY')}
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
                            <Text style={{
                                height: 80,
                                fontSize: Platform.OS === 'ios' ? 18 : 16,
                                fontWeight: 'bold',
                                fontFamily: "Roboto-Bold",
                                color: '#97A19A',
                                textAlign: "center",
                                textAlignVertical: "center",
                                lineHeight: 28
                            }}>{I18n.get('PAYMENT_FORM_SELECTED')}</Text>
                            <View style={{
                                marginBottom: 10
                            }}>
                                {
                                    countries && (
                                        <DropDownPicker
                                            open={openedCountry}
                                            setOpen={setOpenedCountry}
                                            itemKey="value"
                                            closeAfterSelecting={true}
                                            searchable={true}
                                            listMode="MODAL"
                                            mode="BADGE"
                                            disabledItemLabelStyle={{
                                                opacity: 0.5
                                            }}
                                            multiple={false}
                                            placeholder={I18n.get('COUNTRY')}
                                            searchPlaceholder={I18n.get('SEARCH_ITEM')}
                                            items={countries}
                                            value={useCountry}
                                            setValue={setUseCountry}
                                        />
                                    )
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
                                marginBottom: 10
                            }}>
                                {
                                    usedMethods && (
                                        <DropDownPicker
                                            open={openUsedMethod}
                                            setOpen={setOpenUsedMethod}
                                            itemKey="value"
                                            closeAfterSelecting={true}
                                            searchable={true}
                                            listMode="MODAL"
                                            mode="BADGE"
                                            multiple={false}
                                            disabledItemLabelStyle={{
                                                opacity: 0.5
                                            }}
                                            placeholder={I18n.get('DEPOSIT_IN')}
                                            searchPlaceholder={I18n.get('SEARCH_ITEM')}
                                            items={usedMethods}
                                            value={usedMethod}
                                            setValue={setUsedMethod}
                                        />
                                    )
                                }
                                {
                                    errors?.paymentMethodId && touched?.paymentMethodId &&
                                    (
                                        <HelperText type="error">
                                            {I18n.get(errors?.paymentMethodId)}
                                        </HelperText>
                                    )
                                }
                            </View>
                            <Text style={{
                                height: 80,
                                fontSize: 16,
                                color: '#97A19A',
                                textAlign: "center",
                                textAlignVertical: "center",
                                lineHeight: 28
                            }}>{I18n.get('CODE_TO_RECEIVED_DOWN')}</Text>
                            <View style={{
                                marginBottom: 5
                            }}>
                                <Text style={{
                                    height: 80,
                                    fontSize: Platform?.OS === 'ios' ? 18 : 16,
                                    color: themeDefault.colors.warn,
                                    textAlign: "center",
                                    fontFamily: "Roboto-Bold",
                                    textAlignVertical: "center",
                                    lineHeight: 28
                                }}>{`${code || ''}`}</Text>
                            </View>
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
                                                                    <View key={`${index}`}
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
                                                                                color: '#97A19A',
                                                                                borderBottomColor: themeDefault.colors.text,
                                                                                marginRight: 5,
                                                                                fontSize: 16,
                                                                                height: 50,
                                                                                paddingLeft: 20
                                                                            }}>
                                                                                - {`${listTaxes[index].total?.toFixed(2)}`}
                                                                            </Text>
                                                                        </View>
                                                                        <View
                                                                            style={{
                                                                                alignItems: "flex-start",
                                                                                flex: 0.6
                                                                            }}>
                                                                            <Text style={{
                                                                                textAlignVertical: "center",
                                                                                color: '#97A19A',
                                                                                marginLeft: 5,
                                                                                fontSize: 16,
                                                                                height: 50
                                                                            }}>
                                                                                {`${labelCharge}`}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                ) : (<View key={index}/>)
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
                                                                    <View key={index}
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
                                                                                color: '#97A19A',
                                                                                borderBottomColor: themeDefault.colors.text,
                                                                                marginRight: 5,
                                                                                fontSize: 16,
                                                                                height: 50,
                                                                                paddingLeft: 20
                                                                            }}>
                                                                                - {`${listCharges[index].total?.toFixed(2)}`}
                                                                            </Text>
                                                                        </View>
                                                                        <View
                                                                            style={{
                                                                                alignItems: "flex-start",
                                                                                flex: 0.6
                                                                            }}>
                                                                            <Text style={{
                                                                                textAlignVertical: "center",
                                                                                color: '#97A19A',
                                                                                marginLeft: 5,
                                                                                fontSize: 16,
                                                                                height: 50
                                                                            }}>
                                                                                {`${labelCharge}`}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                ) : (<View key={index}/>)
                                                            })
                                                        )
                                                    }
                                                </Fragment>
                                            )
                                        }}/>
                            <Text style={{
                                marginTop: 30,
                                fontSize: 18,
                                fontWeight: "bold",
                                color: themeDefault.colors.warn,
                                textAlign: "center",
                                textAlignVertical: "center"
                            }}>{I18n.get('TO_RECEIVED')}</Text>
                            <Text style={{
                                fontSize: 30,
                                fontWeight: "bold",
                                color: themeDefault.colors.warn,
                                textAlign: "center",
                                textAlignVertical: "center"
                            }}>{`${values?.currency} ${totalDeposit?.toFixed(2)}`}</Text>
                            <Button
                                icon="content-save-all"
                                style={mbCommonStyles.submitBtn}
                                mode="contained" onPress={handleSubmit}>
                                {I18n.get('BTN_OK')}
                            </Button>
                        </ScrollView>
                    )}
                </Formik>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    view: {
        paddingVertical: 10
    },
    textCashMoney: {
        fontSize: Platform.OS === 'ios' ? 17 : 15,
        color: themeDefault.colors.primary,
        textAlign: "justify"
    }
});
