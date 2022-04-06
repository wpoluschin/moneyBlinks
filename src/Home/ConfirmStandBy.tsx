import React, {useContext, useEffect, useState} from "react";
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import {Formik} from "formik";
import * as Yup from "yup";
import {Button, HelperText, Snackbar, Text} from "react-native-paper";
import {API, graphqlOperation, I18n} from "aws-amplify";
import {useNavigation} from "@react-navigation/native";

import {mbCommonStyles} from "../../constants/styles";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import {getMBTransaction} from "../graphql/queries";
import {themeDefault} from "../../constants/Colors";
import {createPay, createTx, updateMBTransaction} from "../graphql/mutations";
import {TxStatus, TxType} from "../API";
import HomeBlinkContext from "../../contexts/HomeBlink/HomeBlinkContext";
import * as LocalAuthentication from "expo-local-authentication";
import {FontAwesome5, MaterialCommunityIcons} from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";

const { height } = Dimensions.get('screen');

export default function ConfirmStandBy({ route }: any) {

    const navigation: any = useNavigation();

    const { txId }: any = route?.params;
    let formRef: any = null;

    const { mbUser, handleLoading, handleError }: any = useContext(MBContext);
    const {
        handlePaymentsMethodsByCountry,
        paymentMethodsToSend,
        handleTxType,
        handleReloadFinancial,
        handleNavigateToHme
    }: any = useContext(HomeBlinkContext);

    const [tx, setTx] = useState<any>(null);
    const [total, setTotal] = useState<number>(0);

    const [color, setColor] = useState<string>(themeDefault.colors.notification);
    const [messageText, setMessageText] = useState<string | null>(null);
    const [showMessage, setShowMessage] = useState(false);

    const [valuesTx, setValuesTx] = useState<any>(null);
    const [isBiometric, setIsBiometric] = useState(false);

    const [usedMethods, setUsedMethods] = useState<any[]>([]);
    const [usedMethod, setUsedMethod] = useState<any>(null);
    const [openUsedMethod, setOpenUsedMethod] = useState<any>(false);


    useEffect(() => {
        async function getTx(id: string) {
            handleLoading(true);
            try {
                const {
                    data: {
                        getMBTransaction: transaction
                    }
                }: any = await API.graphql(graphqlOperation(getMBTransaction, {
                    id
                }));
                setTx(transaction);
                if (transaction?.txValues) {
                    const values: any = JSON.parse(JSON.parse(transaction.txValues));
                    setValuesTx(values);
                    calcToPay(values);
                    setUsedMethod(values?.paymentMethod);
                }
            } catch (e) {

            } finally {
                handleLoading(false);
            }
            await handlePaymentsMethodsByCountry(true, mbUser.alpha2Code, mbUser.alpha3Code);
            const data = await LocalAuthentication.hasHardwareAsync();
            setIsBiometric(data);
        }

        getTx(txId);
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

    async function onPayAndConfirm(values: any) {
        if (isBiometric) {
            const { success } = await LocalAuthentication.authenticateAsync({
                promptMessage: I18n.get('CONFIRM_TEXT'),
                cancelLabel: I18n.get('CANCEL_TEXT')
            });
            if (success) {
                const dataTx: any = Object.assign({}, values);
                dataTx['total'] = total;
                dataTx['contact'] = tx?.receipt;
                dataTx['isMBContact'] = true;
                dataTx['code'] = tx?.moneyBlinksCode?.code;
                dataTx['codeId'] = tx?.moneyBlinksCode?.id;
                dataTx['txId'] = tx?.id;
                dataTx['txStatus'] = TxStatus.STANDBY;
                await onSendBlink(dataTx);
            }
        }
    }

    async function onSendBlink(values: any) {
        handleLoading(true);
        try {
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

    async function onReject() {
        handleLoading(true);
        try {
            const {
                data: {
                    updateMBTransaction: transaction
                }
            }: any = await API.graphql(
                graphqlOperation(
                    updateMBTransaction, {
                        input: {
                            id: txId,
                            txStatus: TxStatus.REJECT
                        }
                    }
                )
            );
            setTx(transaction);
            setShowMessage(true);
            setColor(themeDefault.colors.notification);
            setMessageText('TX_REJECTED');
        } catch (e) {
            setShowMessage(true);
            setColor(themeDefault.colors.error);
            setMessageText(e?.message || e?.errors[0]?.message || 'TX_ERROR');
            console.log(e);
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

    const calcToPay = (values: any): void => {
        let totalPay: number = values?.amount || 0;
        if (!values?.blinkUserId) {
            totalPay += values?.blinksSettings?.blinkCost;
        }
        setTotal(totalPay);
    }

    return (
        <SafeAreaView style={mbCommonStyles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <Formik
                    innerRef={ref => {
                        if (!formRef) {
                            formRef = ref;
                        }
                    }}
                    initialValues={{
                        ...valuesTx,
                        id: txId
                    }}
                    enableReinitialize={valuesTx !== null}
                    validationSchema={
                        Yup.object().shape({
                            id: Yup.string().required()
                        })
                    }
                    onSubmit={onPayAndConfirm}>
                    {({
                          values,
                          errors,
                          touched,
                          handleSubmit,
                          setFieldValue
                      }) => (
                        <ScrollView style={mbCommonStyles.scrollView}>
                            <Text style={{
                                fontSize: 16,
                                marginTop: 20,
                                marginBottom: 10,
                                fontWeight: "bold",
                                color: themeDefault.colors.primary,
                            }}>
                                {I18n.get('TRANSFER_TO')}
                            </Text>

                            <Text style={{
                                fontSize: 14,
                                marginBottom: 10,
                                fontWeight: "bold"
                            }}>
                                {I18n.get('FULL_NAME') }
                                <Text style={{
                                    fontSize: 14,
                                    marginBottom: 10
                                }}>
                                    : {tx?.receipt?.fullName}
                                </Text>
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                marginBottom: 10,
                                fontWeight: "bold"
                            }}>
                                {I18n.get('PHONE_CONTACT') }
                                <Text style={{
                                    fontSize: 14,
                                    marginBottom: 10
                                }}>
                                    : {tx?.receipt?.phoneNumber}
                                </Text>
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                marginBottom: 10,
                                fontWeight: "bold"
                            }}>
                                {I18n.get('EMAIL') }
                                <Text style={{
                                    fontSize: 14,
                                    marginBottom: 10
                                }}>
                                    : {tx?.receipt?.email}
                                </Text>
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                marginBottom: 10,
                                fontWeight: "bold"
                            }}>
                                {I18n.get('COUNTRY') }
                                <Text style={{
                                    fontSize: 14,
                                    marginBottom: 10
                                }}>
                                    : {tx?.receipt?.alpha3Code}
                                </Text>
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                marginBottom: 10,
                                fontWeight: "bold"
                            }}>
                                {I18n.get('NICKNAME') }
                                <Text style={{
                                    fontSize: 14,
                                    marginBottom: 10
                                }}>
                                    : {tx?.receipt?.nickname}
                                </Text>
                            </Text>
                            <Text style={{
                                fontSize: 16,
                                marginTop: 20,
                                marginBottom: 10,
                                fontWeight: "bold",
                                color: themeDefault.colors.primary,
                            }}>
                                {I18n.get('CONFIRM_TX')}
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: "bold",
                                marginVertical: 15,
                                color: themeDefault.colors.primary,
                            }}>
                                {I18n.get('GET_VALUES_TO_TRANSFER')}
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                marginBottom: 10,
                                fontWeight: "bold"
                            }}>
                                {I18n.get('AMOUNT_SEND') }
                                <Text style={{
                                    fontSize: 14,
                                    marginBottom: 10,
                                    textAlign: "right",
                                    width: '100%'
                                }}>
                                    : {tx?.amount.toFixed(2)} {tx?.currency}
                                </Text>
                            </Text>
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
                                        {tx?.currency || 'USD'}
                                    </Text>
                                    <Text style={styles.totalTextRight}>
                                        {`$ ${total?.toFixed(2)}`}
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
                            <View>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: "bold",
                                    marginVertical: 15,
                                    color: themeDefault.colors.primary,
                                }}>
                                    {I18n.get('GET_FOUND_ORIGIN')}
                                </Text>
                                {
                                    usedMethods && usedMethods.length > 0 && (
                                        <View style={{
                                            marginBottom: 10,
                                            width: '100%',
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
                            </View>
                            <Button
                                style={styles.okBtn}
                                mode="contained"
                                icon="account-box-multiple"
                                disabled={tx?.txStatus !== TxStatus.STANDBY}
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
                                    onPress={() => onReject()}>
                                    <Text style={styles.textBtn}>
                                        {I18n.get('BTN_REJECT')}
                                    </Text>
                                </TouchableOpacity>
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
    textBtn: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
        textAlignVertical: "center",
        textAlign: "center",
        marginVertical: 5
    },
});
