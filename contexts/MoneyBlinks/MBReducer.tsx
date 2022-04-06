import {
    AUTH_TYPE,
    CURRENT_AMOUNT,
    CURRENT_AWS_USER,
    CURRENT_BLINKS,
    CURRENT_MB_USER,
    FAILED_AUTH_TYPE,
    FAILED_AWS_USER,
    FAILED_MB_USER,
    LOADING_AUTH_TYPE,
    LOADING_AWS_USER,
    LOADING_END,
    LOADING_MB_USER, LOADING_NOTIFICATIONS,
    LOADING_REGISTER,
    LOADING_START, NOTIFICATIONS_LOAD, REGISTER_AWS, UPDATED_ACCOUNT_INFO, USER_UPDATE_NOTIFICATIONS
} from "./MBTypes";
import {StatusLoginType} from "../../functions/enums";

export default function MBReducer(state: any, action: any) {
    const {payload, type} = action;

    switch (type) {
        case LOADING_START:
            return {
                ...state,
                isLoading: true
            };

        case LOADING_END:
            return {
                ...state,
                isLoading: false
            };

        case LOADING_AWS_USER:
            return {
                ...state,
                awsUser: null
            };

        case CURRENT_AWS_USER:
            return {
                ...state,
                awsUser: payload
            };

        case FAILED_AWS_USER:
            return {
                ...state,
                awsUser: undefined
            };

        case LOADING_MB_USER:
            return {
                ...state,
                mbUser: null
            };

        case CURRENT_MB_USER:
            return {
                ...state,
                mbUser: payload
            };

        case FAILED_MB_USER:
            return {
                ...state,
                mbUser: undefined
            };

        case LOADING_AUTH_TYPE:
            return {
                ...state,
                updatedAuthType: StatusLoginType.INITIALIZED
            };

        case AUTH_TYPE:
            return {
                ...state,
                updatedAuthType: StatusLoginType.LOGGED_IN
            };

        case FAILED_AUTH_TYPE:
            return {
                ...state,
                updatedAuthType: StatusLoginType.LOGGED_OUT
            };

        case CURRENT_AMOUNT:
            return {
                ...state,
                amount: payload
            };

        case CURRENT_BLINKS:
            return {
                ...state,
                blinks: payload
            };

        case LOADING_REGISTER:
            return {
                ...state,
                ...{
                    regAws: null,
                    regMoneyBlinks: null
                }
            };

        case REGISTER_AWS:
            return {
                ...state,
                ...{
                    regAws: payload?.awsUser,
                    regMoneyBlinks: payload?.mbUser
                }
            };

        case UPDATED_ACCOUNT_INFO:
            return {
                ...state,
                updatedAccountInfo: payload
            }

        case LOADING_NOTIFICATIONS:
            return {
                ...state,
                notifications: null
            };

        case NOTIFICATIONS_LOAD:
            return {
                ...state,
                notifications: payload
            };

        case USER_UPDATE_NOTIFICATIONS:
            return {
                ...state,
                updateNotifications: payload
            };

        default:
            return state;
    }
}
