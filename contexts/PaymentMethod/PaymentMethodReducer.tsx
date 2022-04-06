import {
    CHANGE_IS_BACK, COUNTRY_PAYMENTS, FAILED_COUNTRY_PAYMENTS,
    FAILED_PAYMENT_METHODS,
    LOADING_PAYMENT_METHOD,
    LOADING_PAYMENTS_COUNTRIES,
    MY_PAYMENTS_METHODS
} from "./PaymentMethodType";

export default function PaymentMethodReducer(state: any, action: any) {
    const {payload, type} = action;

    switch (type) {
        case CHANGE_IS_BACK:
            return {
                ...state,
                isBack: payload
            };

        case LOADING_PAYMENT_METHOD:
            return {
                ...state,
                paymentMethods: null
            };

        case MY_PAYMENTS_METHODS:
            return {
                ...state,
                paymentMethods: payload
            };

        case FAILED_PAYMENT_METHODS:
            return {
                ...state,
                paymentMethods: undefined
            };

        case LOADING_PAYMENTS_COUNTRIES:
            return {
                ...state,
                paymentsCountries: null
            };

        case COUNTRY_PAYMENTS:
            return {
                ...state,
                paymentsCountries: payload
            };

        case FAILED_COUNTRY_PAYMENTS:
            return {
                ...state,
                paymentsCountries: undefined
            };

        default:
            return state;
    }
}
