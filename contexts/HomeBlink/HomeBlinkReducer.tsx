import {
    AVAILABILITY_BLINK_USER_ID,
    CHARGE_TAX_COUNTRY,
    CURRENT_BLINKS_SETTINGS,
    CURRENT_FAVORITES,
    CURRENT_MB_CONTACTS,
    CURRENT_USERS_PHONE,
    FAILED_HISTORICAL_TX,
    FAILED_SEND_PAYMENT_METHOD,
    FAILED_TRANSACTION,
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

export default function HomeBlinkReducer(state: any, action: any) {
    const {payload, type} = action;

    switch (type) {
        case RELOAD_FINANCIAL:
            return {
                ...state,
                reloadFinancialInfo: payload
            };
        case FINANCIAL_INFO:
            return {
                ...state,
                ...{
                    amount: payload?.amount || 0,
                    currency: payload?.currency || "USD",
                    blinks: payload?.blinks || 0,
                    financialID: payload?.id || null
                }
            };

        case LOADING_SEND_PAYMENT_METHOD:
            return {
                ...state,
                paymentMethodsToSend: null
            };

        case SEND_PAYMENT_METHOD:
            return {
                ...state,
                paymentMethodsToSend: payload
            };

        case FAILED_SEND_PAYMENT_METHOD:
            return {
                ...state,
                paymentMethodsToSend: undefined
            };

        case LOADING_BLINK_USER_ID:
            return {
                ...state,
                blinkUserId: null
            };

        case AVAILABILITY_BLINK_USER_ID:
            return {
                ...state,
                blinkUserId: payload
            };

        case LOADING_BLINK_SETTING_AV:
            return {
                ...state,
                blinkSettings: null
            };

        case CURRENT_BLINKS_SETTINGS:
            return {
                ...state,
                blinkSettings: payload
            };

        case LOADING_FAVORITES_CONTACTS:
            return {
                ...state,
                favorites: null
            };

        case CURRENT_FAVORITES:
            return {
                ...state,
                favorites: payload
            };

        case LOADING_MB_CONTACTS:
            return {
                ...state,
                moneyBlinksContacts: null
            };

        case CURRENT_MB_CONTACTS:
            return {
                ...state,
                moneyBlinksContacts: payload
            };

        case LOADING_USERS_PHONE:
            return {
                ...state,
                phoneContacts: null
            };

        case CURRENT_USERS_PHONE:
            return {
                ...state,
                phoneContacts: payload
            };

        case LOADING_CHARGES_TAX_COUNTRY:
            return {
                ...state,
                ...{
                    taxes: null,
                    charges: null
                }
            };

        case CHARGE_TAX_COUNTRY:
            return {
                ...state,
                ...{
                    taxes: payload.taxes.items,
                    charges: payload.charges.items
                }
            };

        case HANDLE_NAVIGATE_TO_HOME:
            return {
                ...state,
                navigateToHome: payload
            }

        case LOADING_TRANSACTION:
            return {
                ...state,
                transaction: null
            };

        case HANDLE_TRANSACTION:
            return {
                ...state,
                transaction: payload
            };

        case FAILED_TRANSACTION:
            return {
                ...state,
                transaction: undefined
            };

        case HANDLE_TX_TYPE:
            return {
                ...state,
                transactionType: payload
            };

        case LOADING_IS_EXIST_CONTAIN_DATA:
            return {
                ...state,
                phoneContactInMoneyBlink: null
            };

        case IS_EXIST_CONTAIN_DATA:
            return {
                ...state,
                phoneContactInMoneyBlink: payload
            };

        case LOADING_HISTORICAL_TX:
            return {
                ...state,
                historicalTx: null
            };

        case HISTORICAL_TX:
            return {
                ...state,
                historicalTx: payload
            };

        case FAILED_HISTORICAL_TX:
            return {
                ...state,
                historicalTx: undefined
            };

        case MOVE_TX:
            return {
                ...state,
                moveTx: payload
            };

        default:
            return state;
    }
}
