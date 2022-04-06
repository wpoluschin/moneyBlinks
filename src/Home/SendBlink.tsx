import React, {Fragment, useContext, useEffect, useState} from "react";
import {
    Alert,
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import {FieldArray, Formik} from "formik";
import * as Yup from "yup";
import {API, graphqlOperation, I18n, Storage} from "aws-amplify";
import {
    Avatar,
    Button,
    Chip,
    Divider,
    HelperText,
    List,
    RadioButton,
    Searchbar,
    Text,
    TextInput
} from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import {FontAwesome5, MaterialCommunityIcons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import * as LocalAuthentication from 'expo-local-authentication';


import MBContext from "../../contexts/MoneyBlinks/MBContext";
import HomeBlinkContext from "../../contexts/HomeBlink/HomeBlinkContext";
import {SendType} from "../../functions/enums";
import {TxStatus, TxType} from "../API";
import {themeDark, themeDefault} from "../../constants/Colors";
import {mbCommonStyles} from "../../constants/styles";
import {paymentMethod} from "../../functions/functions";
import {createPay, createTx, updateMBContact} from "../graphql/mutations";

const {width, height} = Dimensions.get("screen");

export default function SendBlink() {

    const {handleLoading, handleError, mbUser}: any = useContext(MBContext);
    const {
        handlePaymentsMethodsByCountry,
        handleListChargesAndTaxes,
        amount,
        paymentMethodsToSend,
        handleBlinkUserId,
        handleBlinkSettings,
        handleFavorites,
        handleContacts,
        handleReloadFinancial,
        handleNavigateToHme,
        handleClearContacts,
        handleTxType,
        blinkUserId,
        blinkSettings,
        favorites,
        moneyBlinksContacts,
        taxes,
        charges,
        phoneContactInMoneyBlink
    }: any = useContext(HomeBlinkContext);

    let formRef: any = null;
    const navigation = useNavigation();

    const [step, setStep] = useState(SendType.SEND);

    const [usedMethods, setUsedMethods] = useState<any[]>([]);
    const [usedMethod, setUsedMethod] = useState<any>(null);
    const [openUsedMethod, setOpenUsedMethod] = useState<any>(false);
    const [total, setTotal] = useState<number>(0);

    const [searchQuery, setSearchQuery] = useState('');

    const [filteredFavorites, setFilteredFavorites] = useState<any[]>([]);
    const [avatarFavorites, setAvatarFavorites] = useState<any[]>([]);

    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [imageContact, setImageContact] = useState<any>(null);
    const [isContainData, setIsContainData] = useState<boolean | null>(null);

    const [checked, setChecked] = useState('email');
    const [myChipList, setMyChipList] = useState<any[]>([]);
    const [notifyTo, setNotifyTo] = useState('');

    const [isBiometric, setIsBiometric] = useState(false);

    useEffect(() => {
        async function loadPaymentMethod() {
            await handlePaymentsMethodsByCountry(true, mbUser.alpha2Code, mbUser.alpha3Code);
            await handleBlinkUserId();
            await handleBlinkSettings();
            await handleFavorites(true);
            await handleListChargesAndTaxes(mbUser.alpha2Code, mbUser.alpha3Code, null, true);
            const data = await LocalAuthentication.hasHardwareAsync();
            setIsBiometric(data);
        }

        console.log(`${Platform.OS}: `, height);

        loadPaymentMethod();
        handleClearContacts();
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
        if (formRef) {
            const filters = usedMethods.filter((it: any) => it.value?.indexOf(usedMethod) === 0);
            if (filters.length > 0 && filters[0]?.parent) {
                formRef?.setFieldValue('paymentType', filters[0].parent, true);
            }
            formRef?.setFieldTouched('paymentMethod');
            formRef?.setFieldValue('paymentMethod', usedMethod, true);
        }
    }, [
        usedMethod
    ]);

    useEffect(() => {
        setIsContainData(phoneContactInMoneyBlink);
    }, [
        phoneContactInMoneyBlink
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
        if (charges && taxes) {
            formRef?.setFieldValue('taxes', taxes, true);
            formRef?.setFieldValue('charges', charges, true);
        }
    }, [
        charges, taxes
    ])

    const loadAvatarImage = async (contact: any): Promise<any> => {
        return contact?.avatarUrl ? Storage.get(contact.avatarUrl, {level: 'public'}) : null;
    }

    useEffect(() => {
        setFilteredFavorites(favorites);
        if (favorites && favorites.length > 0) {
            Promise.all(
                favorites.map(async (contact: any) => {
                    const image: any = await loadAvatarImage(contact?.invited);
                    return {
                        id: contact?.invited?.id,
                        imageUrl: image
                    }
                })
            ).then(images => setAvatarFavorites(images));
        }
    }, [favorites]);

    useEffect(() => {
        setFilteredUsers(moneyBlinksContacts);
    }, [
        moneyBlinksContacts
    ]);

    const titleMsg = (values: any): string => {
        const toSend = parseFloat(values?.amount) || 0;
        let msg = `${I18n.get('YOU_SEND_AMOUNT')} ${values?.contact?.fullName} $ ${toSend.toFixed(2)} ${mbUser?.currency || 'USD'}`;
        if (values?.isMBContact) {
            if (total > toSend) {
                msg += ` ${I18n.get('TOTAL_TO_PAID')} $ ${(total - toSend).toFixed(2)} ${mbUser?.currency || 'USD'}`;
            }
        } else {
            msg = `${I18n.get('YOU_SEND_AMOUNT')} ${values?.contact?.firstName} ${values?.contact?.lastName || ''} $ ${toSend.toFixed(2)} ${mbUser?.currency || 'USD'}`;
            if (total > toSend) {
                msg += ` ${I18n.get('TOTAL_TO_PAID')} $ ${(total - toSend).toFixed(2)} ${mbUser?.currency || 'USD'}`;
            }
        }
        return msg;
    }


    function totalBlink(values: any) {
        setTimeout(() => {
            let subTotal: number = parseFloat(values.amount);
            if (values?.blinksSettings &&
                !values?.blinkUserId &&
                Object.keys(values?.blinksSettings).length > 0) {
                subTotal += values?.blinksSettings?.blinkCost || 0;
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

    async function onSharedTx(values: any) {
        handleLoading(true);
        try {
            values['userId'] = mbUser?.id;
            values['txStatus'] = TxStatus.SHARED;
            const {
                data: {
                    createTx: txData
                }
            }: any = await API.graphql(graphqlOperation(createTx, {
                values: JSON.stringify(values)
            }));
            const response = JSON.parse(txData);
            if (response.statusCode) {
                const {action, activityType}: any = await Share.share({
                    message: mbUser?.locale === 'es' ?
                        `${mbUser?.fullName} te ha compartido un blink por el monto de ${values?.amount?.toFixed(2)} ${values?.currency}, puedes descargar nuestra aplicación en https://moneyblinks.com y usar el siguiente código ${response?.body?.code}` :
                        `${mbUser?.fullName} has shared a blink to you for the amount of ${values?.amount?.toFixed(2)} ${values?.currency}, you can download our application at https://moneyblinks.com and use the following code ${response?.body?.code}`
                });
                if (action === Share.sharedAction) {
                    if (activityType) {
                        handleTxType(TxType.SEND);
                        handleReloadFinancial(true);
                        handleNavigateToHme(true);
                        navigation.navigate('Home')
                    } else {
                        handleTxType(TxType.SEND);
                        handleReloadFinancial(true);
                        handleNavigateToHme(true);
                        navigation.navigate('Home')
                    }
                } else if (action === Share.dismissedAction) {
                    alert('Show');
                }
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

    async function onConfirmTx(values: any, type?: string) {
        if (isBiometric) {
            const { success } = await LocalAuthentication.authenticateAsync({
                promptMessage: I18n.get('CONFIRM_TEXT'),
                cancelLabel: I18n.get('CANCEL_TEXT')
            });
            if (success && !type) {
                await onSendBlink(values)
            }
        }
    }

    async function onSendBlink(values: any) {
        handleLoading(true);
        try {
            values['userId'] = mbUser?.id;
            if (!values?.currency) {
                values['currency'] = mbUser?.currency || 'USD';
            }
            values['description'] = `Blink shipping for the value of ${values?.total} ${values?.currency}`;
            values['notifications'] = myChipList;
            if (values?.isMBContact) {
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
            } else {
                values['txStatus'] = TxStatus.SHARED;
            }
            const {
                data: {
                    createTx: txData
                }
            }: any = await API.graphql(graphqlOperation(createTx, {
                values: JSON.stringify(values)
            }));
            const response = JSON.parse(txData);
            if (response.statusCode) {
                handleTxType(TxType.SEND);
                handleReloadFinancial(true);
                handleNavigateToHme(true);
                navigation.navigate('Home')
            }
        } catch (e) {
            console.log(e);
            handleError(
                I18n.get(e?.message || e?.errors[0].message || 'AN_ERROR_OCCURRED'),
                themeDefault.colors.error
            );
        } finally {
            handleLoading(false);
        }
    }

    const onChangeSearch = async (query: string) => {
        setSearchQuery(query);
        if (query && query.length >= 2) {
            await handleContacts(query);
            const $filterMbUsers = [
                ...favorites.filter((contact: any) =>
                    contact?.invited?.phoneNumber.includes(query) ||
                    contact?.invited?.email.includes(query.toLowerCase()) ||
                    contact?.invited?.nickname.includes(query.toLowerCase()) ||
                    contact?.invited?.fullName.includes(query)
                )
            ];
            setFilteredFavorites($filterMbUsers);
        } else {
            if (favorites) {
                favorites.sort((a: any, b: any) =>
                    a.isFavorite && !b.isFavorite ? 1 : (b.isFavorite && !a.isFavorite ? -1 : 0));
            }
            setFilteredFavorites(favorites);
            setFilteredUsers([]);
            handleClearContacts();
        }
    }

    const markAsFavorite = async (id: string, currentState: boolean) => {
        handleLoading(true);
        try {
            await API.graphql(graphqlOperation(updateMBContact, {
                input: {
                    id,
                    isFavorite: !currentState
                }
            }));

            const index: number = filteredFavorites.findIndex((it: any) => it.id.indexOf(id) === 0);
            if (index >= 0) {
                filteredFavorites[index].isFavorite = !currentState;
            }
            const allIndex: number = favorites.findIndex((it: any) => it.id.indexOf(id) === 0);
            if (allIndex >= 0) {
                favorites[allIndex].isFavorite = !currentState;
            }
        } catch (e) {
            console.log(e);
        } finally {
            handleLoading(false);
        }
    }

    return (
        <SafeAreaView style={mbCommonStyles.container}>
            <Formik
                initialValues={{
                    amount: 0,
                    taxes: [],
                    charges: [],
                    paymentMethod: null,
                    paymentType: null,
                    currency: mbUser?.currency || 'USD',
                    message: '',
                    contact: {
                        firstName: null,
                        lastName: null,
                        phoneNumbers: [],
                        phoneNumber: null,
                        fullName: null,
                        nickname: null
                    },
                    isMBContact: false,
                    blinkSettingId: null,
                    blinkUserId: null,
                    blinksSettings: {
                        blinkPrice: 0,
                        blinkCost: 0
                    },
                    subTotalTax: 0,
                    subTotalCommission: 0,
                    txType: TxType.SEND,
                    txStatus: TxStatus.SEND,
                    notifications: []
                }}
                validateOnChange={true}
                validationSchema={
                    Yup.object().shape({
                        amount: Yup.number()
                            .min(10, 'AMOUNT_SEND_MIN')
                            .max(2000, 'AMOUNT_SEND_MAX')
                            .required('AMOUNT_SEND_REQ'),
                        paymentMethod: Yup.string()
                            .nullable()
                            .matches(paymentMethod, 'PAYMENT_METHOD_USED_REQ_INVALID')
                            .required('PAYMENT_METHOD_USED_REQ'),
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
                validate={values => totalBlink(values)}
                onSubmit={values => onConfirmTx(values)}>
                {({
                      handleChange,
                      handleBlur,
                      setFieldTouched,
                      setFieldValue,
                      handleSubmit,
                      errors,
                      touched,
                      values
                  }) => (
                    <ScrollView style={mbCommonStyles.scrollView}>
                        {
                            step === SendType.SEND && (
                                <>
                                    <Text style={{
                                        fontSize: 18,
                                        fontWeight: "bold",
                                        fontFamily: "Roboto-Bold",
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
                                        fontFamily: "Roboto-Bold",
                                        color: themeDefault.colors.primary,
                                    }}>
                                        {I18n.get('GET_VALUES_TO_TRANSFER')}
                                    </Text>
                                    <View style={mbCommonStyles.viewForm}>
                                        <TextInput
                                            theme={themeDark}
                                            mode='outlined'
                                            label={I18n.get('AMOUNT_SEND')}
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
                                                    text={mbUser?.currency}/>
                                            }/>
                                        {
                                            errors?.amount && touched?.amount && (
                                                <HelperText type="error">
                                                    {I18n.get(errors.amount)}
                                                </HelperText>
                                            )
                                        }
                                    </View>
                                    {
                                        values?.blinksSettings && !values?.blinkUserId && (
                                            <View style={{marginBottom: 10}}>
                                                <TextInput mode='outlined'
                                                           style={{
                                                               textAlign: 'right'
                                                           }}
                                                           label={`${I18n.get('USED_BLINK_PAY')} 1 Blink`}
                                                           placeholder={`${I18n.get('USED_BLINK_PAY')} 1 Blink`}
                                                           keyboardType="number-pad"
                                                           value={`${values?.blinksSettings?.blinkCost?.toFixed(2)}`}
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
                                        disabled={(!!errors?.amount || (values?.amount < amount && values?.paymentMethod === ''))
                                        || !!errors?.paymentMethod || !!errors?.blinkSettingId}
                                        onPress={() => setStep(SendType.CONTACTS)}>
                                        {I18n.get('SELECT_CONTACT')}
                                    </Button>
                                </>
                            )
                        }
                        {
                            step === SendType.CONTACTS && (
                                <>
                                    <Searchbar
                                        placeholder={I18n.get('SEARCH_ITEM')}
                                        onChangeText={onChangeSearch}
                                        value={searchQuery}
                                        style={{
                                            marginVertical: 20
                                        }}
                                    />
                                    <Text style={{
                                        color: '#97A19A',
                                        textAlign: "left",
                                        fontWeight: "bold",
                                        fontFamily: "Roboto-Bold",
                                        fontSize: 20,
                                        marginBottom: 15
                                    }}>
                                        {I18n.get('CONTACT_SEND')}
                                    </Text>
                                    <ScrollView style={{
                                        minHeight: height > 850 ? height - 340 : height - 330,
                                        width: width - 40
                                    }}>
                                        {
                                            (!filteredFavorites || filteredFavorites.length === 0) &&
                                            (!filteredUsers || filteredUsers.length === 0) && (
                                                <View style={styles.containerError}>
                                                    <Text style={styles.errorText}>
                                                        {I18n.get('NO_FAVORITES_NO_FREQUENTS')}
                                                    </Text>
                                                </View>
                                            )
                                        }
                                        {
                                            filteredFavorites &&
                                            filteredFavorites.map((contact: any, index: number) => {
                                                let image: any;
                                                const images = avatarFavorites.filter((item: any) => item?.id?.indexOf(contact?.invited?.id) === 0);
                                                if (images.length > 0) {
                                                    image = images[0].imageUrl;
                                                }
                                                return (
                                                    <Fragment key={index}>
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                flexDirection: "row"
                                                            }}>
                                                            {
                                                                image ?
                                                                    <Avatar.Image
                                                                        source={{
                                                                            uri: image
                                                                        }}
                                                                        size={60}/> :
                                                                    <Avatar.Icon icon="account"
                                                                                 size={60}/>
                                                            }
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    setFieldValue('contact', contact.invited, true);
                                                                    setFieldValue('isMBContact', true, true);
                                                                    setImageContact(image);
                                                                    setStep(SendType.END);
                                                                }}
                                                                style={{
                                                                    flexDirection: "column",
                                                                    flex: 0.8,
                                                                    marginLeft: 5
                                                                }}>
                                                                <Text
                                                                    style={{
                                                                        color: themeDefault.colors.primary,
                                                                        height: 40,
                                                                        textAlignVertical: "center",
                                                                        fontSize: 16,
                                                                    }}>
                                                                    {contact?.invited?.fullName}
                                                                </Text>
                                                                <Text
                                                                    style={{
                                                                        color: themeDefault.colors.primary,
                                                                        height: 20,
                                                                        textAlignVertical: "center",
                                                                        fontSize: 10,
                                                                    }}>
                                                                    {`${contact?.invited?.phoneNumber} / ${contact?.invited?.nickname}`}
                                                                </Text>
                                                            </TouchableOpacity>
                                                            <View style={{
                                                                flex: 0.2,
                                                                flexDirection: "column",
                                                                alignSelf: "flex-end"
                                                            }}>
                                                                {
                                                                    contact &&
                                                                    contact.hasOwnProperty('isFavorite') ?
                                                                        <TouchableOpacity
                                                                            onPress={() => markAsFavorite(contact.id, contact.isFavorite)}
                                                                            style={{
                                                                                height: 40,
                                                                                alignItems: "center"
                                                                            }}>
                                                                            <MaterialCommunityIcons
                                                                                name={contact.isFavorite ? 'star' : 'star-outline'}
                                                                                color={contact.isFavorite ? themeDefault.colors.warn : themeDefault.colors.primary}
                                                                                size={36}/>
                                                                        </TouchableOpacity> :
                                                                        <View
                                                                            style={{
                                                                                height: 40,
                                                                                alignItems: "center"
                                                                            }}/>
                                                                }
                                                                <View style={{
                                                                    height: 20
                                                                }}>
                                                                    <Text
                                                                        style={{
                                                                            color: themeDefault.colors.header,
                                                                            height: 20,
                                                                            textAlignVertical: "center",
                                                                            fontSize: 10,
                                                                            textAlign: "center"
                                                                        }}>
                                                                        {contact?.myShipments || 0}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                        <Divider
                                                            style={{
                                                                marginVertical: 5,
                                                                height: 2,
                                                                backgroundColor: themeDefault.colors.primary
                                                            }}/>
                                                    </Fragment>
                                                )
                                            })
                                        }
                                        {
                                            filteredUsers &&
                                            filteredUsers.map((contact: any, index: number) => {
                                                let image: any;
                                                (async () => {
                                                    image = await loadAvatarImage(contact);
                                                })();
                                                return (
                                                    <Fragment key={index}>
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                flexDirection: "row"
                                                            }}>
                                                            {
                                                                image ?
                                                                    <Avatar.Image
                                                                        source={{
                                                                            uri: image
                                                                        }}
                                                                        size={60}/> :
                                                                    <Avatar.Icon icon="account"
                                                                                 size={60}/>
                                                            }
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    setFieldValue('contact', contact, true);
                                                                    setFieldValue('isMBContact', true, true);
                                                                    setImageContact(image);
                                                                    setStep(SendType.END);
                                                                }}
                                                                style={{
                                                                    flexDirection: "column",
                                                                    flex: 0.8,
                                                                    marginLeft: 5
                                                                }}>
                                                                <Text
                                                                    style={{
                                                                        color: themeDefault.colors.primary,
                                                                        height: 40,
                                                                        textAlignVertical: "center",
                                                                        fontSize: 16,
                                                                    }}>
                                                                    {contact?.fullName}
                                                                </Text>
                                                                <Text
                                                                    style={{
                                                                        color: themeDefault.colors.primary,
                                                                        height: 20,
                                                                        textAlignVertical: "center",
                                                                        fontSize: 10,
                                                                    }}>
                                                                    {`${contact?.phoneNumber} / ${contact?.nickname}`}
                                                                </Text>
                                                            </TouchableOpacity>
                                                            <View style={{
                                                                flex: 0.2,
                                                                flexDirection: "column",
                                                                alignSelf: "flex-end"
                                                            }}>
                                                                <View
                                                                    style={{
                                                                        height: 40,
                                                                        alignItems: "center"
                                                                    }}/>
                                                                <View style={{
                                                                    height: 20
                                                                }}>
                                                                    <Text
                                                                        style={{
                                                                            color: themeDefault.colors.header,
                                                                            height: 20,
                                                                            textAlignVertical: "center",
                                                                            fontSize: 10,
                                                                            textAlign: "center"
                                                                        }}>
                                                                        {contact?.myShipments || 0}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                        <Divider
                                                            style={{
                                                                marginVertical: 5,
                                                                height: 2,
                                                                backgroundColor: themeDefault.colors.primary
                                                            }}/>
                                                    </Fragment>
                                                );
                                            })
                                        }
                                    </ScrollView>
                                    <Button icon="share-variant"
                                            style={{
                                                ...mbCommonStyles.submitBtn,
                                                ...{
                                                    marginTop: 10,
                                                    marginHorizontal: 20,
                                                    width: "auto",
                                                }
                                            }}
                                            mode="contained"
                                            onPress={() => onSharedTx(values)}>
                                        {I18n.get('SHARED')}
                                    </Button>
                                </>
                            )
                        }
                        {
                            step === SendType.END && (
                                <Fragment>
                                    <View style={{
                                        marginTop: 20,
                                        marginBottom: 10
                                    }}>
                                        <List.Item
                                            title={I18n.get('CONTACT_SEND_TO')}
                                            titleStyle={{
                                                color: themeDefault.colors.placeholder
                                            }}
                                            left={props => <List.Icon {...props} icon="send"
                                                                      color={themeDefault.colors.placeholder}/>}
                                        />
                                        <List.Item title={values?.contact?.fullName}
                                                   description={`${values?.contact?.phoneNumber} / ${values?.contact?.nickname}`}
                                                   right={() => <Avatar.Image
                                                       source={require('../../assets/images/icon.png')}
                                                       size={36}
                                                       style={{
                                                           backgroundColor: 'transparent'
                                                       }}/>}
                                                   left={() => imageContact ?
                                                       <Avatar.Image source={{uri: imageContact}} size={48}/> :
                                                       <Avatar.Icon icon="account" size={48}/>}/>
                                        {
                                            isContainData && (
                                                <HelperText type="error">
                                                    {I18n.get('DATA_CONTAIN')}
                                                </HelperText>
                                            )
                                        }
                                    </View>
                                    <View style={{
                                        marginBottom: 10
                                    }}>
                                        <TextInput
                                            theme={themeDefault}
                                            mode="outlined"
                                            label={I18n.get('MESSAGE')}
                                            value={values?.message}
                                            numberOfLines={5}
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
                                    </View>
                                    <View style={{marginBottom: 20}}>
                                        <Text style={{
                                            fontSize: 18,
                                            fontWeight: "bold",
                                            marginVertical: 15,
                                            color: themeDefault.colors.primary,
                                            textAlign: "center",
                                            textAlignVertical: "center"
                                        }}>{titleMsg(values)}</Text>
                                    </View>
                                    <View style={{
                                        marginBottom: 20
                                    }}>
                                        <Text style={{
                                            color: themeDefault.colors.placeholder,
                                            fontSize: 20
                                        }}>{I18n.get('NOTIFY_TO_3RD')}</Text>
                                        <RadioButton.Group onValueChange={checked => {
                                            setChecked(checked);
                                            setNotifyTo('');
                                            setMyChipList([]);
                                        }} value={checked}>
                                            <View style={{
                                                flexDirection: "row",
                                                justifyContent: "flex-start"
                                            }}>
                                                <View style={{
                                                    alignSelf: "flex-start",
                                                    flex: 0.5,
                                                    flexDirection: "row",
                                                    alignItems: "center"
                                                }}>
                                                    <RadioButton value="email" color={themeDefault.colors.header}/>
                                                    <Text style={{
                                                        color: themeDefault.colors.placeholder
                                                    }}>{I18n.get('EMAIL')}</Text>
                                                </View>
                                                <View style={{
                                                    alignSelf: "flex-start",
                                                    flex: 0.5,
                                                    flexDirection: "row",
                                                    alignItems: "center"
                                                }}>
                                                    <RadioButton value="sms" color={themeDefault.colors.header}/>
                                                    <Text style={{
                                                        color: themeDefault.colors.placeholder
                                                    }}>{I18n.get('SMS')}</Text>
                                                </View>
                                            </View>
                                        </RadioButton.Group>
                                        <View style={{
                                            flexDirection: "row",
                                            flexWrap: "wrap",
                                            paddingHorizontal: 12
                                        }}>
                                            {
                                                myChipList.map((item, index) => (
                                                    <Chip key={item} icon={checked === 'email' ? 'email' : 'phone'}
                                                          closeIconAccessibilityLabel="close-circle"
                                                          onClose={() => {
                                                              myChipList.splice(index, 1);
                                                          }}
                                                          style={{
                                                              margin: 4,
                                                              backgroundColor: '#EEEEEE'
                                                          }}
                                                          onPress={() => {
                                                              myChipList.slice(index, 1);
                                                          }}>{item}</Chip>
                                                ))
                                            }
                                        </View>
                                        <View style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            alignContent: "flex-start",
                                            alignItems: "center"
                                        }}>
                                            <TextInput mode="outlined"
                                                       label={I18n.get('NOTIFY_TO')}
                                                       placeholder={I18n.get('NOTIFY_TO')}
                                                       value={notifyTo}
                                                       style={{
                                                           flex: 0.9,
                                                           marginRight: 10
                                                       }}
                                                       autoCapitalize="none"
                                                       onChangeText={text => setNotifyTo(text)}
                                                       keyboardType={checked === 'email' ? 'email-address' : 'phone-pad'}
                                                       left={
                                                           <TextInput.Icon
                                                               name={checked === 'email' ? 'email' : 'phone'} size={24}
                                                               color={themeDefault.colors.placeholder}/>
                                                       }/>
                                            <Avatar.Icon icon={"plus"} size={48} onTouchEnd={() => {
                                                if (myChipList.length <= 2) {
                                                    const index = myChipList.findIndex(it => it.toLowerCase().indexOf(notifyTo) === 0);
                                                    if (index < 0) {
                                                        myChipList.push(notifyTo);
                                                    }
                                                    setNotifyTo('');
                                                } else {
                                                    Alert.alert('', '');
                                                }
                                            }}/>
                                        </View>
                                    </View>
                                    <Button icon="check"
                                            style={mbCommonStyles.submitBtn}
                                            mode="contained"
                                            onPress={handleSubmit}>
                                        {I18n.get('COMPLETED_BTN')}
                                    </Button>
                                </Fragment>
                            )
                        }
                    </ScrollView>
                )}
            </Formik>
        </SafeAreaView>
    );
}

export const styles = StyleSheet.create({
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
        backgroundColor: themeDefault.colors.info,
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
        color: themeDefault.colors.placeholder,
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
    },
    containerError: {
        flex: 1,
        height: height - 380,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 24,
        color: themeDefault.colors.error,
        textAlign: "center",
        marginHorizontal: 10
    },
});
