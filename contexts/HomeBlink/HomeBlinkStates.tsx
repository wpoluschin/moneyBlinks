import React, {useCallback, useContext, useMemo, useReducer} from "react";
import HomeBlinkReducer from "./HomeBlinkReducer";
import HomeBlinkContext from "./HomeBlinkContext";
import MBContext from "../MoneyBlinks/MBContext";
import {graphqlOperation, I18n} from "aws-amplify";
import {API} from "@aws-amplify/api";
import {themeDefault} from "../../constants/Colors";
import {
    lastBlinkSettings,
    listMBBlinkUsers,
    listMBFinancialDatas,
    listMBUsers,
} from "../../src/graphql/queries";
import {
    AVAILABILITY_BLINK_USER_ID,
    CHARGE_TAX_COUNTRY,
    CURRENT_BLINKS_SETTINGS,
    CURRENT_FAVORITES,
    CURRENT_MB_CONTACTS,
    CURRENT_USERS_PHONE,
    FAILED_HISTORICAL_TX,
    FINANCIAL_INFO,
    HANDLE_NAVIGATE_TO_HOME,
    HANDLE_TRANSACTION,
    HANDLE_TX_TYPE,
    HISTORICAL_TX,
    IS_EXIST_CONTAIN_DATA,
    LOADING_BLINK_SETTING_AV,
    LOADING_BLINK_USER_ID,
    LOADING_CHARGES_TAX_COUNTRY,
    LOADING_FAVORITES_CONTACTS,
    LOADING_HISTORICAL_TX,
    LOADING_IS_EXIST_CONTAIN_DATA,
    LOADING_MB_CONTACTS,
    LOADING_SEND_PAYMENT_METHOD,
    LOADING_TRANSACTION,
    LOADING_USERS_PHONE, MOVE_TX,
    RELOAD_FINANCIAL,
    SEND_PAYMENT_METHOD
} from "./HomeBlinkTypes";
import {ModelMBUserFilterInput, ModelSortDirection} from "../../src/API";
import {
    completeTx,
    createMBBlinkUser,
    createMBFinancialData,
    createTx,
    purchasePack,
    updateMBFinancialData
} from "../../src/graphql/mutations";
import {
    listAllHistorical, listAllMyFrequentsReceipts, listAllMyFrequentsShipments,
    listChargesTaxesByCountry,
    loadPaymentsMethodsByUserAndCoutries
} from "../../src/OtherQueries/otherMultipleQueries";

// @ts-ignore
export default function HomeBlinkStates({children}) {
    const initialState = useMemo(
        () => ({
            amount: 0,
            currency: "USD",
            blinks: 0,
            financialID: null,
            reloadFinancialInfo: null,
            paymentMethodsToSend: null,
            paymentMethodsToReceived: null,
            blinkUserId: null,
            blinkSettings: null,
            favorites: null,
            moneyBlinksContacts: null,
            phoneContacts: null,
            packages: null,
            charges: null,
            taxes: null,
            navigateToHome: null,
            transaction: null,
            transactionType: null,
            phoneContactInMoneyBlink: null,
            historicalTx: null,
            moveTx: null
        }),
        []
    );

    const {handleLoading, handleError, handleAccountInfoUpdated, mbUser}: any = useContext(MBContext);

    const [state, dispatch] = useReducer(HomeBlinkReducer, initialState);

    const handleClearContacts = useCallback(() => {
        dispatch({type: CURRENT_MB_CONTACTS, payload: null});
    }, []);

    const handleReloadFinancial = useCallback((loadInfo: any) => {
        dispatch({type: RELOAD_FINANCIAL, payload: loadInfo});
    }, []);

    const handleNavigateToHme = useCallback((payload?: boolean) => {
        dispatch({type: HANDLE_NAVIGATE_TO_HOME, payload});
    }, []);

    const handleTransaction = useCallback((payload: any) => {
        dispatch({type: HANDLE_TRANSACTION, payload});
    }, []);

    const handleTxType = useCallback((payload: any) => {
        dispatch({type: HANDLE_TX_TYPE, payload});
    }, []);

    const handleMoveTx = useCallback((payload: any) => {
        dispatch({ type: MOVE_TX, payload });
    }, []);

    const handleAmount = useCallback(async () => {
        handleLoading(true);
        try {
            const {
                data: {
                    listMBFinancialDatas: {
                        items: financial
                    }
                }
            }: any = await API.graphql(graphqlOperation(listMBFinancialDatas, {
                filter: {
                    userID: {eq: mbUser?.id}
                }
            }));
            dispatch({type: FINANCIAL_INFO, payload: financial.length > 0 ? financial[0] : {}});
            handleReloadFinancial(null);
        } catch (e) {
            handleError(I18n.get('AN_ERROR_OCCURRED'), themeDefault.colors.error);
        } finally {
            handleLoading(false);
        }
    }, []);

    const handlePromotionalBlinks = useCallback(async () => {
        handleLoading(true);
        handleAccountInfoUpdated(null);
        try {
            const {
                data: {
                    listMBBlinkUsers: {
                        items: havePromotional
                    }
                }
            }: any = await API.graphql(graphqlOperation(listMBBlinkUsers, {
                filter: {
                    userID: {eq: mbUser?.id},
                    isPromotional: {eq: true}
                }
            }));
            if (havePromotional.length === 0) {
                const {
                    data: {
                        lastBlinkSettings: {
                            items: blinkSettings
                        }
                    }
                }: any = await API.graphql(graphqlOperation(lastBlinkSettings, {
                    type: "BlinkSetting",
                    filter: {
                        isoStateCode: {eq: mbUser?.alpha2Code}
                    },
                    sortDirection: ModelSortDirection.DESC
                }));
                if (blinkSettings.length > 0) {
                    await API.graphql(graphqlOperation(
                        createMBBlinkUser, {
                            input: {
                                userID: mbUser?.id,
                                blinkSettingID: blinkSettings[0].id,
                                blinkAcquired: blinkSettings[0].promotionalCount,
                                blinkAvailable: blinkSettings[0].promotionalCount,
                                blinkPrice: 0,
                                isPromotional: true,
                                currency: "USD"
                            }
                        }
                    ));

                    const blinks = state.blinks + blinkSettings[0].promotionalCount;
                    if (state.financialID) {
                        const {
                            data: {
                                updateMBFinancialData: payload
                            }
                        }: any = await API.graphql(graphqlOperation(updateMBFinancialData, {
                            input: {
                                blinks,
                                id: state.financialID,
                            }
                        }));
                        dispatch({payload, type: FINANCIAL_INFO});
                    } else {
                        const {
                            data: {
                                createMBFinancialData: payload
                            }
                        }: any = await API.graphql(graphqlOperation(createMBFinancialData, {
                            input: {
                                blinks: blinks,
                                type: "UserBlink",
                                amount: 0,
                                currency: mbUser?.currency || "USD",
                                isActive: true,
                                userID: mbUser?.id
                            }
                        }));
                        dispatch({payload, type: FINANCIAL_INFO});
                    }
                }
            }
        } catch (e) {
            handleError(I18n.get('AN_ERROR_OCCURRED'), themeDefault.colors.error);
        } finally {
            handleLoading(false);
        }
    }, []);

    const handlePaymentsMethodsByCountry =
        useCallback(async (isSend: boolean, alpha2Code: string, alpha3Code: string) => {
            handleLoading(true);
            try {
                dispatch({type: LOADING_SEND_PAYMENT_METHOD});
                let AndQuery: any = [
                    { isShipping: { eq: true } },
                    { isActive: { eq: true } }
                ];
                if (isSend !== undefined && isSend !== null && !isSend) {
                    AndQuery = [
                        { isReceipt: { eq: true } },
                        { isActive: { eq: true } }
                    ];
                }
                const {
                    data: {
                        listMBPaymentMethodCountrys: {
                            items: payload
                        }
                    }
                }: any = await API.graphql(graphqlOperation(loadPaymentsMethodsByUserAndCoutries, {
                    filter: {
                        alpha2Code: {eq: alpha2Code},
                        alpha3Code: {eq: alpha3Code},
                        and: AndQuery
                    },
                    filterMyPayments: {
                        userID: { eq: mbUser?.id },
                        isActive: { eq: true }
                    }
                }))
                dispatch({payload, type: SEND_PAYMENT_METHOD});
                handleLoading(false);
            } catch (e) {
                handleLoading(false);
                handleError(I18n.get('AN_ERROR_OCCURRED'), themeDefault.colors.error);
            }
        }, []);

    const handleBlinkUserId = useCallback(async () => {
        handleLoading(true);
        try {
            dispatch({type: LOADING_BLINK_USER_ID});
            const {
                data: {
                    listMBBlinkUsers: {
                        items: blinks
                    }
                }
            }: any = await API.graphql(graphqlOperation(listMBBlinkUsers, {
                filter: {
                    userID: { eq: mbUser?.id },
                    blinkAvailable: {gt: 0},
                    and: [
                        {
                            or: [
                                { deletedAt: { attributeExists: false } },
                                { deletedAt: { lt: (new Date()).toISOString() } }
                            ]
                        }
                    ]
                }
            }));
            dispatch({type: AVAILABILITY_BLINK_USER_ID, payload: blinks.length > 0 ? blinks[0].id : null});
        } catch (e) {
            handleError(I18n.get('AN_ERROR_OCCURRED'), themeDefault.colors.error);
        } finally {
            handleLoading(false);
        }

    }, []);

    const handleBlinkSettings = useCallback(async () => {
        handleLoading(true);
        try {
            dispatch({type: LOADING_BLINK_SETTING_AV});
            const {
                data: {
                    lastBlinkSettings: {
                        items: blinks
                    }
                }
            }: any = await API.graphql(graphqlOperation(lastBlinkSettings, {
                type: "BlinkSetting",
                filter: {
                    isoStateCode: {eq: mbUser?.alpha2Code}
                },
                sortDirection: ModelSortDirection.DESC
            }));
            dispatch({payload: blinks.length > 0 ? blinks[0] : null, type: CURRENT_BLINKS_SETTINGS});
            handleLoading(false);
        } catch (e) {
            handleLoading(false);
            handleError(I18n.get('AN_ERROR_OCCURRED'), themeDefault.colors.error);
        }
    }, []);

    const handleFavorites = useCallback(async (isSend: boolean) => {
        handleLoading(true);
        try {
            dispatch({type: LOADING_FAVORITES_CONTACTS});
            if (isSend) {
                const {
                    data: {
                        myShipmentsFrequents: {
                            items: payload
                        }
                    }
                }: any = await API.graphql(graphqlOperation(listAllMyFrequentsShipments, {
                    invitingID: mbUser?.id,
                    myShipments: {gt: 0},
                    sortDirection: ModelSortDirection.DESC
                }));
                dispatch({type: CURRENT_FAVORITES, payload});
            } else {
                const {
                    data: {
                        myRequestsFrequents: {
                            items: payload
                        }
                    }
                }: any = await API.graphql(graphqlOperation(listAllMyFrequentsReceipts, {
                    invitingID: mbUser?.id,
                    myReceipts: {gt: 0},
                    sortDirection: ModelSortDirection.DESC
                }));
                dispatch({type: CURRENT_FAVORITES, payload});
            }
        } catch (e) {
            console.log(e);
            handleError(I18n.get('AN_ERROR_OCCURRED'), themeDefault.colors.error);
        } finally {
            handleLoading(false);
        }
    }, []);

    const handleContacts = useCallback(async (searchKey: string) => {
        handleLoading(true);
        try {
            dispatch({type: LOADING_MB_CONTACTS});
            const {
                data: {
                    listMBUsers: {
                        items: payload
                    }
                }
            }: any = await API.graphql(graphqlOperation(listMBUsers, {
                filter: {
                    id: {ne: mbUser?.id},
                    and: [
                        {
                            or: [
                                {nickname: {contains: searchKey.toLowerCase()}},
                                {phoneNumber: {contains: searchKey}},
                                {email: {contains: searchKey.toLowerCase()}},
                                {fullName: {contains: searchKey}}
                            ]
                        }
                    ]
                }
            }));
            dispatch({type: CURRENT_MB_CONTACTS, payload});
            handleLoading(false);
        } catch (e) {
            handleLoading(false);
            handleError(I18n.get('AN_ERROR_OCCURRED'), themeDefault.colors.error);
        }
    }, []);

    const handleListChargesAndTaxes = useCallback(async (
        alpha2Code: string, alpha3Code: string, isBlink?: boolean, isSend?: boolean
    ) => {
        handleLoading(true);
        try {
            dispatch({type: LOADING_CHARGES_TAX_COUNTRY});
            let filter: any = {};
            if (isBlink) {
                filter['isBlinkPay'] = {eq: true};
            }
            if (isSend !== null && isSend !== undefined) {
                if (isSend) {
                    filter['isShipping'] = {eq: true};
                } else {
                    filter['isReceipt'] = {eq: true};
                }
            }
            const {
                data: {
                    listMBCountrys: {
                        items: countries
                    }
                }
            }: any = await API.graphql(graphqlOperation(listChargesTaxesByCountry, {
                filter: {
                    alpha2Code: {eq: alpha2Code},
                    alpha3Code: {eq: alpha3Code},
                },
                filterTax: filter,
                filterCharge: filter,
                sortDirection: ModelSortDirection.ASC
            }))
            dispatch({
                type: CHARGE_TAX_COUNTRY, payload: countries.length > 0 ? countries[0] : {
                    taxes: {
                        items: []
                    },
                    charges: {
                        items: []
                    }
                }
            });
            handleLoading(false);
        } catch (e) {
            handleLoading(false);
            handleError(I18n.get('AN_ERROR_OCCURRED'), themeDefault.colors.error);
        }
    }, []);

    const handlePurchaseBlinkPack = useCallback(async (values: any) => {
        handleLoading(true);
        try {
            const {
                data: {
                    purchasePack: buyPack
                }
            }: any = await API.graphql(graphqlOperation(purchasePack, {
                values: JSON.stringify(values)
            }));
            const data = JSON.parse(buyPack);
            if (data.statusCode === 200) {
                await handleAmount();
                handleError(I18n.get('BUY_PACKAGES_SUCCESSFULLY'), themeDefault.colors.notification);
                handleNavigateToHme(true);
            }
            handleLoading(false);
        } catch (e) {
            handleLoading(false);
            handleError(I18n.get('AN_ERROR_OCCURRED'), themeDefault.colors.error);
        }
    }, []);

    const handleTx = useCallback(async (values: any) => {
        handleLoading(true);
        try {
            dispatch({type: LOADING_TRANSACTION});
            const {
                data: {
                    createTx: response
                }
            }: any = await API.graphql(graphqlOperation(createTx, {
                values: JSON.stringify(values)
            }));
            const {data}: any = JSON.parse(response);
            handleTransaction(data);
            handleError(I18n.get('BUY_PACKAGES_SUCCESSFULLY'), themeDefault.colors.notification);
            handleNavigateToHme(true);

        } catch (e) {

        } finally {
            handleLoading(false);
        }
    }, []);

    const handleLoadingHistoricalTx = useCallback(async (type?: string) => {
        handleLoading(true);
        try {
            let orQuery: any = [
                {shippingID: {eq: mbUser?.id}},
                {receiptID: {eq: mbUser?.id}}
            ];
            dispatch({type: LOADING_HISTORICAL_TX});

            if (type === "SEND") {
                orQuery = [
                    {shippingID: {eq: mbUser?.id}}
                ];
            } else if (type === "REQUEST") {
                orQuery = [
                    {receiptID: {eq: mbUser?.id}}
                ];
            }
            const {
                data: {
                    listAll: {
                        items: payload
                    }
                }
            }: any = await API.graphql(graphqlOperation(listAllHistorical, {
                type: "TRANSACTION",
                sortDirection: ModelSortDirection.DESC,
                filter: {
                    or: orQuery
                }
            }));
            dispatch({type: HISTORICAL_TX, payload});
        } catch (e) {
            console.error(e);
            dispatch({type: FAILED_HISTORICAL_TX});
            handleError(I18n.get('AN_ERROR_OCCURRED'), themeDefault.colors.error);
        } finally {
            handleLoading(false);
        }
    }, []);

    const handleProcessBlinks = useCallback(async (values: any) => {
        handleLoading(true);
        try {
            await API.graphql(graphqlOperation(completeTx, {
                values: JSON.stringify(values)
            }));
            await handleReloadFinancial(true);
        } catch (e) {
            dispatch({type: FAILED_HISTORICAL_TX});
            const error = I18n.get(e?.message || e.errors[0].message || 'AN_ERROR_OCCURRED');
            handleError(error, themeDefault.colors.error);
        } finally {
            handleLoading(false);
        }
    }, []);

    return (
        <HomeBlinkContext.Provider
            value={{
                amount: state.amount,
                currency: state.currency,
                blinks: state.blinks,
                financialID: state.financialID,
                reloadFinancialInfo: state.reloadFinancialInfo,
                paymentMethodsToSend: state.paymentMethodsToSend,
                paymentMethodsToReceived: state.paymentMethodsToReceived,
                blinkUserId: state.blinkUserId,
                blinkSettings: state.blinkSettings,
                favorites: state.favorites,
                moneyBlinksContacts: state.moneyBlinksContacts,
                phoneContacts: state.phoneContacts,
                charges: state.charges,
                taxes: state.taxes,
                navigateToHome: state.navigateToHome,
                transaction: state.transaction,
                transactionType: state.transactionType,
                phoneContactInMoneyBlink: state.phoneContactInMoneyBlink,
                historicalTx: state.historicalTx,
                moveTx: state.moveTx,
                handleAmount,
                handleReloadFinancial,
                handlePromotionalBlinks,
                handlePaymentsMethodsByCountry,
                handleBlinkUserId,
                handleBlinkSettings,
                handleFavorites,
                handleContacts,
                handleListChargesAndTaxes,
                handlePurchaseBlinkPack,
                handleNavigateToHme,
                handleTransaction,
                handleTx,
                handleTxType,
                handleClearContacts,
                handleLoadingHistoricalTx,
                handleMoveTx,
                handleProcessBlinks
            }}>
            {children}
        </HomeBlinkContext.Provider>
    );
}
