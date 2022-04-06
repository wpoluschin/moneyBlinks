import React, {Fragment, useContext, useEffect, useState} from "react";
import {SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {FieldArray, Formik} from "formik";
import * as Yup from "yup";
import {Avatar, Button, Card, Divider, HelperText, RadioButton, Text} from "react-native-paper";
import {useNavigation} from "@react-navigation/native";
import {API, graphqlOperation, I18n} from "aws-amplify";
import DropDownPicker from "react-native-dropdown-picker";
import * as LocalAuthentication from "expo-local-authentication";

import HomeBlinkContext from "../../contexts/HomeBlink/HomeBlinkContext";
import {mbCommonStyles} from "../../constants/styles";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import {themeDefault} from "../../constants/Colors";
import {FontAwesome5, MaterialCommunityIcons} from "@expo/vector-icons";
import {paymentMethod} from "../../functions/functions";
import {createPay} from "../graphql/mutations";

export default function Packages() {

    const navigation = useNavigation();

    const {
        handlePaymentsMethodsByCountry,
        handleListChargesAndTaxes,
        handleBlinkSettings,
        handlePurchaseBlinkPack,
        handleNavigateToHme,
        blinkSettings,
        paymentMethodsToSend,
        blinks,
        charges,
        taxes,
        navigateToHome
    }: any = useContext(HomeBlinkContext);
    const {handleLoading, handleError, mbUser}: any = useContext(MBContext);

    const [packages, setPackages] = useState<any>(null);
    let formRef: any = null;
    const [usedMethods, setUsedMethods] = useState<any[]>([]);
    const [openUsedMethod, setOpenUsedMethod] = useState<boolean>(false);
    const [usedMethod, setUsedMethod] = useState<any>(null);
    const [total, setTotal] = useState<number>(0);
    const [isBiometric, setIsBiometric] = useState(false);

    useEffect(() => {
        async function loadInitData() {
            await handleBlinkSettings();
            await handlePaymentsMethodsByCountry(true, mbUser.alpha2Code, mbUser.alpha3Code);
            await handleListChargesAndTaxes(mbUser.alpha2Code, mbUser.alpha3Code, true);
            const data = await LocalAuthentication.hasHardwareAsync();
            setIsBiometric(data);
        }

        loadInitData();
    }, []);

    useEffect(() => {
        if (blinkSettings) {
            const countryBlink: any = blinkSettings?.settings ? JSON.parse(blinkSettings.settings) : {};
            setPackages(countryBlink.blinkTable);
            formRef?.setFieldValue('blinkSettingID', blinkSettings?.id, true);
        }
    }, [
        blinkSettings
    ]);

    useEffect(() => {
        if (charges && taxes) {
            formRef?.setFieldValue('taxes', taxes, true);
            formRef?.setFieldValue('charges', charges, true);
        }
    }, [
        charges, taxes
    ]);

    useEffect(() => {
        if (navigateToHome) {
            handleNavigateToHme(false);
            navigation.navigate('Home');
        }
    }, [
        navigateToHome
    ])

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
        if (usedMethod) {
            const filters = usedMethods.filter((it: any) => it.value?.indexOf(usedMethod) === 0);
            if (filters.length > 0 && filters[0]?.parent) {
                formRef?.setFieldValue('paymentType', filters[0].parent, true);
            }
            formRef?.setFieldTouched('paymentMethod');
            formRef?.setFieldValue('paymentMethod', usedMethod, true);
        }
    }, [usedMethod])

    const onTotalCalculate = (values: any) => {
        setTimeout(() => {
            let subTotal: number = values?.valuesBlinkSetting?.blinkCost || 0;
            values?.taxes.forEach((tax: any) => {
                const settings = JSON.parse(tax.settings) || {};
                subTotal += (eval(settings?.formula) || tax.total) || 0;
            });
            values?.charges.forEach((charge: any) => {
                const settings = JSON.parse(charge.settings) || {};
                subTotal += (eval(settings?.formula) || charge.total) || 0;
            });
            setTotal(subTotal);
        }, 500);
    }

    const onPayPackages = async (values: any) => {
        handleLoading(true);
        try {
            values['total'] = total;
            values['userId'] = mbUser?.id;
            values['description'] = `Purchase a pack of ${values.packages.blinks} blinks`;
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
                await handlePurchaseBlinkPack(values);
            }
        } catch (e) {
            console.error('Error', e);
            handleLoading(false);
            handleError(
                I18n.get(e?.message || e?.errors[0].message || 'AN_ERROR_OCCURRED'),
                themeDefault.colors.error
            );
        }
    }

    async function onConfirmTx(values: any) {
        if (isBiometric) {
            const { success } = await LocalAuthentication.authenticateAsync({
                promptMessage: I18n.get('CONFIRM_TEXT'),
                cancelLabel: I18n.get('CANCEL_TEXT')
            });
            if (success) {
                await onPayPackages(values)
            }
        }
    }

    return (
        <SafeAreaView style={mbCommonStyles.container}>
            <Formik
                enableReinitialize={true}
                validateOnChange={true}
                innerRef={ref => {
                    if (!formRef) {
                        formRef = ref;
                    }
                }}
                validate={onTotalCalculate}
                initialValues={{
                    blinkSettingID: null,
                    isPromotional: false,
                    currency: mbUser?.currency || 'USD',
                    paymentMethod: null,
                    paymentType: null,
                    valuesBlinkSetting: {
                        blinkCost: 0
                    },
                    selectedBlink: '-1',
                    taxes: [],
                    charges: [],
                    packages: null
                }}
                validationSchema={
                    Yup.object().shape({
                        blinkSettingID: Yup.string().nullable().required(),
                        currency: Yup.string().min(3).max(3).required(),
                        valuesBlinkSetting: Yup.object().shape({
                            blinkCost: Yup.number().min(5)
                                .required()
                        }),
                        paymentMethod: Yup.string()
                            .nullable()
                            .matches(paymentMethod, 'PAYMENT_METHOD_USED_REQ_INVALID')
                            .required('PAYMENT_METHOD_USED_REQ'),
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
                onSubmit={onConfirmTx}>
                {({
                      setFieldValue,
                      handleSubmit,
                      errors,
                      touched,
                      values
                  }) => (
                    <ScrollView style={mbCommonStyles.scrollView}>
                        <Card
                            style={{
                                backgroundColor: 'transparent',
                                elevation: 0,
                                marginTop: 10
                            }}>
                            <Card.Title
                                title={I18n.get('PACKAGES_TITLES')}
                                titleStyle={{
                                    color: '#97A19A',
                                    marginLeft: 0,
                                    paddingLeft: 0
                                }}/>
                            <Card.Content>
                                <View
                                    style={{
                                        height: 65,
                                        width: '100%',
                                        flexDirection: "row",
                                        alignContent: "space-between",
                                    }}>
                                    <Text
                                        style={{
                                            flex: 0.4,
                                            height: 65,
                                            paddingRight: 5,
                                            textAlignVertical: "center",
                                            textAlign: "right",
                                            color: themeDefault.colors.warn,
                                            fontWeight: "bold",
                                            textTransform: "uppercase",
                                            fontSize: 16
                                        }}>
                                        {I18n.get('PACKAGES_ACTIVES')}
                                    </Text>
                                    <Avatar.Text
                                        size={62}
                                        color='#FFFFFF'
                                        label={`${blinks}`}
                                        style={{
                                            backgroundColor: themeDefault.colors.warn,
                                            marginHorizontal: 10
                                        }}/>
                                    <Text
                                        style={{
                                            flex: 0.4,
                                            height: 65,
                                            color: themeDefault.colors.placeholder,
                                            textAlignVertical: "center",
                                        }}>
                                        {`${I18n.get('REST_BLINK')}`}
                                    </Text>
                                </View>
                                <Divider style={{
                                    marginVertical: 10
                                }}/>
                            </Card.Content>
                        </Card>
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
                        <Card
                            style={{
                                backgroundColor: 'transparent',
                                elevation: 0,
                            }}>
                            <Card.Title
                                title={I18n.get('TITLE_PACKAGES')}
                                left={() =>
                                    <Avatar.Icon
                                        icon="eye" size={36}
                                        style={{
                                            backgroundColor: 'transparent'
                                        }}
                                        color='#97A19A'/>}
                                titleStyle={{
                                    color: '#97A19A',
                                    marginLeft: 0,
                                    paddingLeft: 0
                                }}/>
                            <Card.Content>
                                <RadioButton.Group
                                    onValueChange={index => {
                                        setFieldValue('selectedBlink', index);
                                        setFieldValue('packages', packages[index]);
                                        setFieldValue('valuesBlinkSetting.blinkCost', packages[index].totalPrice, true);

                                    }}
                                    value={values?.selectedBlink}>
                                    {
                                        packages &&
                                        packages.map((pqt: any, index: number) => (
                                            <View key={index}
                                                  style={{
                                                      flex: 1,
                                                      flexDirection: "row",
                                                      alignContent: "flex-start",
                                                      paddingVertical: 5
                                                  }}>
                                                <RadioButton value={`${index}`}
                                                             color={themeDefault.colors.primary}/>
                                                <Text style={{
                                                    flex: 1,
                                                    paddingLeft: 5,
                                                    color: themeDefault.colors.primary,
                                                    textAlignVertical: "center",
                                                    fontWeight: "bold",
                                                    fontSize: 16
                                                }}>
                                                    {`${pqt.blinks} Blinks $ ${pqt?.totalPrice.toFixed(2)} ${mbUser?.currency || 'USD'} ($ ${pqt?.unitPrice.toFixed(2)} ${mbUser?.currency || 'USD'}/Blink)`}
                                                </Text>
                                            </View>
                                        ))
                                    }
                                </RadioButton.Group>
                                <FieldArray name="taxes"
                                            render={() => {
                                                const listTaxes: any[] = values?.taxes || [];
                                                return (
                                                    <Fragment>
                                                        {
                                                            listTaxes.length > 0 && (
                                                                listTaxes.map((tax: any, index: number) => {
                                                                    const settings = JSON.parse(tax.settings) || {};
                                                                    listTaxes[index].total = eval(settings?.formula) || 0;
                                                                    const translateCharge = JSON.parse(tax?.translate) || {};
                                                                    const labelCharge = translateCharge[mbUser?.locale || 'es'];

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
                                                                                    color: '#97A19A',
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
                                                                                    color: '#97A19A',
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
                                                const listCharges: any[] = values?.charges || [];
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
                                                                                    color: '#97A19A',
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
                                                                                    color: '#97A19A',
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
                            </Card.Content>
                        </Card>
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
                            style={mbCommonStyles.submitBtn}
                            onPress={handleSubmit}
                            mode="contained"
                            icon="gift">
                            {I18n.get('ON_SUBMIT_PAY')}
                        </Button>
                    </ScrollView>
                )}
            </Formik>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    btnInline: {
        flex: 0.5,
        backgroundColor: '#1C4F99',
        marginHorizontal: 5,
        marginVertical: 20,
        borderRadius: 60,
        padding: 5,
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase'
    },
    error: {
        fontSize: 24,
        color: themeDefault.colors.error,
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
