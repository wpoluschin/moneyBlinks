import React, {Fragment, useContext, useEffect, useState} from "react";
import {KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View} from "react-native";
import {FieldArray, Formik} from "formik";
import * as Yup from "yup";
import {Button, Divider, HelperText, Text, TextInput} from "react-native-paper";
import {graphqlOperation, I18n} from "aws-amplify";
import {API} from "@aws-amplify/api";
import DropDownPicker from "react-native-dropdown-picker";
import {useNavigation} from "@react-navigation/native";
import {FontAwesome5, MaterialCommunityIcons} from "@expo/vector-icons";

import HomeBlinkContext from "../../contexts/HomeBlink/HomeBlinkContext";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import {themeDefault} from "../../constants/Colors";
import {mbCommonStyles} from "../../constants/styles";
import {listByNameOrOrder} from "../graphql/queries";
import {ModelSortDirection} from "../API";

export default function DownloadBlink() {

    const {
        mbUser
    }: any = useContext(MBContext);
    const navigation: any = useNavigation();

    const {
        moveTx,
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

    const [totalDeposit, setTotalDeposit] = useState(0);

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
                let subTotal: number = values?.tx?.amountDeposit;
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
        try {
            const dataIn = {...values, amountToDeposit: totalDeposit};
            await handleProcessBlinks(dataIn);
        } catch (e) {

        }
    }

    if (!moveTx) {
        return (
            <View>

            </View>
        )
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
                        paymentMethod: '',
                        paymentMethodId: '',
                        tx: moveTx,
                        amount: moveTx?.amountDeposit,
                        currency: moveTx?.currencyDeposit,
                        amountToDeposit: moveTx?.amountDeposit
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
                          handleBlur
                      }) => (
                        <ScrollView style={mbCommonStyles.scrollView}>
                            <View style={{
                                marginTop: 20
                            }}>
                                <Text style={{
                                    paddingVertical: 10,
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    color: themeDefault.colors.primary,
                                    textAlign: "center",
                                    textAlignVertical: "center",
                                    lineHeight: 28
                                }}>{`${moveTx?.shipping?.fullName} ${I18n.get('NOTE_DOWNLOAD_BLINK')} $ ${moveTx?.amount?.toFixed(2)} ${moveTx?.currency || mbUser?.currency || 'USD'} ${moveTx?.message ? I18n.get('NOTE_DOWNLOAD_BLINK_CONT') : ''}`}</Text>
                                <Divider style={{backgroundColor: '#0771B8', height: 2, marginVertical: 15}}/>
                            </View>
                            <View>
                                <Text style={{
                                    paddingVertical: 10,
                                    fontSize: 16,
                                    color: themeDefault.colors.warn,
                                    textAlign: "justify",
                                    lineHeight: 28
                                }}>{moveTx.message}</Text>
                                <Divider style={{backgroundColor: '#0771B8', height: 2, marginVertical: 15}}/>
                            </View>
                            <Text style={{
                                height: 80,
                                fontSize: 16,
                                fontWeight: "bold",
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
                            }}>{I18n.get('CODE_TO_RECEIVED')}</Text>
                            <View style={{
                                marginBottom: 5
                            }}>
                                <TextInput
                                    mode='outlined'
                                    placeholder={I18n.get('CODE')}
                                    left={
                                        <TextInput.Icon
                                            color="#97A19A"
                                            name="check-circle"/>
                                    }
                                    error={!!errors?.code}
                                    selectionColor="#97A19A"
                                    underlineColor="#97A19A"
                                    value={`${values?.code}`}
                                    onBlur={handleBlur('code')}
                                    onChangeText={text => setFieldValue('code', text, true)}
                                    autoCapitalize="characters"
                                    style={{
                                        backgroundColor: '#EEEEEE',
                                        borderColor: '#97A19A',
                                        textAlign: "center"
                                    }}/>
                                {
                                    errors?.code && touched?.code && (
                                        <HelperText type="error">
                                            {I18n.get('INVALID_TX_CODE')}
                                        </HelperText>
                                    )
                                }
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
                            }}>{`${moveTx?.currencyDeposit} ${totalDeposit?.toFixed(2)}`}</Text>
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
    );
}
