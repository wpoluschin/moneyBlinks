import React, {Fragment, useContext, useEffect, useState} from "react";
import {useNavigation} from "@react-navigation/native";
import {Formik} from "formik";
import {View} from "react-native";
import {Avatar, Button, Card, HelperText, TextInput} from "react-native-paper";
import {graphqlOperation, I18n} from "aws-amplify";
import * as Yup from "yup";
import {API} from "@aws-amplify/api";
import DropDownPicker from "react-native-dropdown-picker";

import {ecuBanks} from "../../functions/functions";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import {PlaidAccount} from "../../functions/interfaces";
import {listMBMyPaymentMethods} from "../graphql/queries";
import {createMBMyPaymentMethod} from "../graphql/mutations";
import {mbCommonStyles} from "../../constants/styles";
import MBCommonSelect from "../../components/MBCommonComponents/MBCommonSelect";
import PaymentMethodContext from "../../contexts/PaymentMethod/PaymentMethodContext";

// @ts-ignore
export default function AccountNoConnectedForm({paymentMethodCountry}) {
    const navigation = useNavigation();

    const { handleLoading, mbUser}: any = useContext(MBContext);
    const { handleIsBack }: any = useContext(PaymentMethodContext)
    let formRef: any = null;

    const [bankInitialValue, setBankInitialValue] = useState<any>(null);
    const [bankSchemaValidator, setBankSchemaValidator] = useState<any>(null);
    const [allBanks] = useState(ecuBanks);
    const [settingsMap, setSettingsMap] = useState<any[]>([]);
    const [usedConfig, setUsedConfig] = useState(false);

    useEffect(() => {
        let settings: any;
        if (!usedConfig && paymentMethodCountry) {
            setUsedConfig(true);
            if (paymentMethodCountry.settings) {
                settings = JSON.parse(paymentMethodCountry.settings).settings;
                createBankValidator(settings?.params);
                setTimeout(() => {
                    setSettingsMap(settings?.params);
                }, 200);
            }

        }
    }, [paymentMethodCountry]);

    const createBankValidator = (params: any[]) => {
        let _formData = {};
        let _schema = {};
        params.forEach((item: any) => {
            // @ts-ignore
            _formData[item?.name] = item?.value || null;
            if (item?.validators) {
                // @ts-ignore
                _schema[item?.name] = Yup;
                if (item.type === 'string' || item.type === 'select') {
                    // @ts-ignore
                    _schema[item?.name] = _schema[item?.name].string().nullable();
                }
                item.validators.forEach((keyVal: any) => {
                    if (keyVal.type === "min") {
                        // @ts-ignore
                        _schema[item?.name] = _schema[item?.name].min(keyVal.value, keyVal.messages[mbUser?.locale]);
                    }
                    if (keyVal.type === "max") {
                        // @ts-ignore
                        _schema[item?.name] = _schema[item?.name].max(keyVal.value, keyVal.messages[mbUser?.locale]);
                    }
                    if (keyVal.type === "required") {
                        // @ts-ignore
                        _schema[item?.name] = _schema[item?.name].required(keyVal.messages[mbUser?.locale]);
                    }
                });
            }
        });

        setBankInitialValue(_formData);
        setBankSchemaValidator(Yup.object().shape({..._schema}));
        if (formRef && formRef?.values?.hasOwnProperty('address')) {
            formRef?.setFieldValue('address', mbUser?.address);
        }
        if (formRef && formRef?.values?.hasOwnProperty('email')) {
            formRef?.setFieldValue('email', mbUser?.email);
        }
    }

    async function saveNoConnectedAccount(bankAccount: any) {
        try {
            const myBank = allBanks.filter((bank: any) => bank.code.indexOf(bankAccount.bank) === 0);
            if (myBank.length > 0) {
                const account: PlaidAccount = {
                    institutionName: myBank[0].label,
                    account_id: `${bankAccount.bank}-${bankAccount.accountNumber}`,
                    mask: `${bankAccount.accountNumber}`,
                    name: myBank[0].label,
                    type: bankAccount?.type,
                    usedToPay: false,
                    address: bankAccount?.address || `${mbUser?.address}, ${mbUser?.city}, ${mbUser?.state}, ${mbUser?.country}`,
                    phone: bankAccount?.phone || mbUser?.phoneNumber,
                    email: bankAccount?.email || mbUser?.email,
                    balances: {
                        iso_currency_code: mbUser?.currency || 'USD',
                        current: 0
                    }
                };
                handleLoading(true);
                await createBankAccount(account);
                handleLoading(false);
                handleIsBack(true);
                navigation.navigate('AccountList');
            }
        } catch (e) {
            console.log('Error', e.message || e);
        }
    }

    async function createBankAccount(account: PlaidAccount) {
        try {
            const {
                data: {
                    listMBMyPaymentMethods: {
                        items: myAccounts
                    }
                }
            }: any = await API.graphql(graphqlOperation(listMBMyPaymentMethods, {
                filter: {
                    accountId: {eq: account.account_id},
                    userID: {eq: mbUser?.id},
                    payType: {eq: 'ACCOUNT'}
                }
            }));
            if (myAccounts.length === 0) {
                await API.graphql(graphqlOperation(createMBMyPaymentMethod, {
                    input: {
                        paymentMethodCountryID: paymentMethodCountry?.id,
                        userID: mbUser?.id,
                        value: account.account_id,
                        accountId: account.account_id,
                        label: `${account.name} ----${account.mask}`,
                        settings: JSON.stringify(account),
                        isActive: true,
                        isUsedPayment: false,
                        payType: 'ACCOUNT',
                        description: `${account.institutionName} ${account?.official_name ? account.official_name : ''} ${account.balances.iso_currency_code}`
                    }
                }));
            }
        } catch (e) {
            console.log('Account ', e.message || e);
        }
    }

    return (
        <Formik
            innerRef={ref => {
                if (!formRef) {
                    formRef = ref;
                }
            }}
            initialValues={bankInitialValue}
            enableReinitialize={bankInitialValue}
            validationSchema={bankSchemaValidator}
            onSubmit={saveNoConnectedAccount}>
            {({
                  handleSubmit,
                  setFieldValue,
                  errors,
                  touched,
                  values
              }) => (
                <View style={{
                    marginVertical: 10
                }}>
                    <Card.Title title={I18n.get('TITLE_BANK')}
                                left={() => <Avatar.Icon icon="bank-plus" size={36}/>}/>
                    {
                        usedConfig && settingsMap.map((item: any, index: number) => {
                            if (values?.hasOwnProperty('address')) {
                                values.address = mbUser?.address;
                            }
                            if (values?.hasOwnProperty('email')) {
                                values.email = mbUser?.email;
                            }
                            if (values?.hasOwnProperty('phone')) {
                                values.phone = mbUser?.phoneNumber;
                            }
                            return (
                                <View key={index} style={{marginBottom: 10}}>
                                    {
                                        item?.type === 'select' && (
                                            <Fragment>
                                                <MBCommonSelect
                                                    placeholder={item.translate[mbUser?.locale || 'es']}
                                                    params={{...item, locale: mbUser?.locale || 'es'}}
                                                    setFieldValue={setFieldValue}
                                                    multiple={false}
                                                    searchable={true}/>
                                                {
                                                    errors[item?.name] &&
                                                    touched[item?.name] && (
                                                        <HelperText type="error">
                                                            {errors[item?.name]}
                                                        </HelperText>
                                                    )
                                                }
                                            </Fragment>
                                        )
                                    }
                                    {
                                        (item?.type === 'string' || item?.type === 'email' || item?.type === 'phone') &&
                                        (
                                            <View style={{
                                                marginBottom: 10,
                                                flex: 1
                                            }}>
                                                <TextInput
                                                    mode='outlined'
                                                    label={item.translate[mbUser.locale || 'es']}
                                                    placeholder={item.translate[mbUser.locale || 'es']}
                                                    selectionColor="#97A19A"
                                                    underlineColor="#97A19A"
                                                    left={
                                                        <TextInput.Icon
                                                            color="#97A19A"
                                                            name={item.icon}/>
                                                    }
                                                    value={values[item.name]}
                                                    onChangeText={text => setFieldValue(`${item.name}`, text, true)}
                                                    error={!!errors[item.name]}
                                                    style={{
                                                        backgroundColor: '#EEEEEE',
                                                        borderColor: '#97A19A'
                                                    }}/>
                                                {
                                                    errors[item.name] && touched[item.name] && (
                                                        <HelperText type="error">
                                                            {errors[item.name]}
                                                        </HelperText>
                                                    )
                                                }
                                            </View>
                                        )
                                    }
                                </View>
                            );
                        })
                    }
                    {
                        settingsMap.length > 0 && (
                            <Button
                                icon="bank-plus"
                                style={mbCommonStyles.submitBtn}
                                mode="contained" onPress={handleSubmit}>
                                {I18n.get('SAVE_ACCOUNT')}
                            </Button>
                        )
                    }
                </View>
            )}
        </Formik>
    )
}
