import React, {useCallback, useMemo, useReducer} from "react";

import PaymentMethodReducer from "./PaymentMethodReducer";
import PaymentMethodContext from "./PaymentMethodContext";
import {
    CHANGE_IS_BACK,
    COUNTRY_PAYMENTS,
    FAILED_COUNTRY_PAYMENTS,
    FAILED_PAYMENT_METHODS,
    LOADING_PAYMENT_METHOD,
    LOADING_PAYMENTS_COUNTRIES,
    MY_PAYMENTS_METHODS
} from "./PaymentMethodType";
import {themeDefault} from "../../constants/Colors";
import {API, graphqlOperation, I18n} from "aws-amplify";
import {listMBMyPaymentMethods, listMBPaymentMethodCountrys} from "../../src/graphql/queries";

// @ts-ignore
export default function PaymentMethodStates({children}) {
    const initialState = useMemo(
        () => ({
            isBack: false,
            paymentMethods: null,
            paymentsCountries: null
        }),
        []
    );

    const [state, dispatch] = useReducer(PaymentMethodReducer, initialState);

    const handleIsBack = useCallback((isBack: boolean) => {
        dispatch({type: CHANGE_IS_BACK, payload: isBack});
    }, []);

    const handleLoadPaymentMethodsList = useCallback(async (handleLoading, handleError, mbUser: any) => {
        handleLoading(true);
        try {
            dispatch({type: LOADING_PAYMENT_METHOD});
            const {
                data: {
                    listMBMyPaymentMethods: {
                        items: payments
                    }
                }
            }: any = await API.graphql(graphqlOperation(
                listMBMyPaymentMethods, {
                    filter: {
                        userID: {eq: mbUser?.id},
                        payType: {eq: 'ACCOUNT'}
                    }
                }
            ));
            dispatch({type: MY_PAYMENTS_METHODS, payload: payments});
            handleLoading(false);
        } catch (e) {
            handleError(I18n.get('AN_ERROR_OCCURRED'), themeDefault.colors.error)
            handleLoading(false);
            dispatch({type: FAILED_PAYMENT_METHODS});
        }
    }, []);

    const handlePaymentCountries =
        useCallback(async (mbUser: any, paymentType: string, handleLoading, handleError) => {
            handleLoading(true);
            try {
                dispatch({type: LOADING_PAYMENTS_COUNTRIES});
                const {
                    data: {
                        listMBPaymentMethodCountrys: {
                            items: payments
                        }
                    }
                }: any = await API.graphql(graphqlOperation(
                    listMBPaymentMethodCountrys,
                    {
                        filter: {
                            alpha2Code: {eq: mbUser?.alpha2Code},
                            alpha3Code: {eq: mbUser?.alpha3Code},
                            paymentTypeCode: {eq: paymentType}
                        }
                    }
                ));
                dispatch({type: COUNTRY_PAYMENTS, payload: payments});
                handleLoading(false);
            } catch (e) {
                dispatch({type: FAILED_COUNTRY_PAYMENTS});
                handleLoading(false);
                handleError(I18n.get('AN_ERROR_OCCURRED'), themeDefault.colors.error)
            }
        }, []);

    return (
        <PaymentMethodContext.Provider
            value={{
                isBack: state.isBack,
                paymentMethods: state.paymentMethods,
                paymentsCountries: state.paymentsCountries,
                handleIsBack,
                handleLoadPaymentMethodsList,
                handlePaymentCountries
            }}>
            {children}
        </PaymentMethodContext.Provider>
    );
}
