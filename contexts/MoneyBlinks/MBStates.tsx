import React, {useCallback, useMemo, useReducer, useState} from "react";
import {ActivityIndicator, Modal, Snackbar} from "react-native-paper";
import {API, Auth, graphqlOperation, I18n} from "aws-amplify";

import MBReducer from "./MBReducer";
import {themeDefault} from "../../constants/Colors";
import {
    AUTH_TYPE,
    CURRENT_AWS_USER,
    CURRENT_MB_USER,
    FAILED_AUTH_TYPE,
    FAILED_AWS_USER,
    LOADING_AUTH_TYPE,
    LOADING_AWS_USER,
    LOADING_END,
    LOADING_MB_USER, LOADING_NOTIFICATIONS,
    LOADING_START, NOTIFICATIONS_LOAD,
    REGISTER_AWS, UPDATED_ACCOUNT_INFO, USER_UPDATE_NOTIFICATIONS
} from "./MBTypes";
import MBContext from "./MBContext";
import {StatusLoginType} from "../../functions/enums";
import {byNickname, listMyNotifications} from "../../src/graphql/queries";
import {createMBUser, updateMBUser} from "../../src/graphql/mutations";
import {ModelSortDirection} from "../../src/API";

// @ts-ignore
export default function MBStates({children}) {
    const initialState = useMemo(
        () => ({
            awsUser: null,
            mbUser: null,
            isLoading: false,
            isCompleted: null,
            updatedAuthType: StatusLoginType.INITIALIZED,
            isBack: null,
            regAws: null,
            regMoneyBlinks: null,
            updatedAccountInfo: null,
            notifications: null,
            updateNotifications: null
        }),
        []
    );

    const [state, dispatch] = useReducer(MBReducer, initialState);
    const [color, setColor] = useState(themeDefault.colors.notification);
    const [message, setMessage] = useState<string | null>(null);

    const handleLoading = useCallback((isLoading: boolean) => {
        dispatch({type: isLoading ? LOADING_START : LOADING_END});
    }, []);

    const handleAccountInfoUpdated = useCallback((updated: boolean | null) => {
        dispatch({ type: UPDATED_ACCOUNT_INFO, payload: updated });
    }, []);

    const handleError = useCallback((message: string, color: string) => {
        setColor(color);
        setMessage(message);
    }, []);

    const handleUpdateNotifications = useCallback((payload?: any) => {
        dispatch({ type: USER_UPDATE_NOTIFICATIONS, payload });
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            await Auth.signOut();
            dispatch({type: FAILED_AUTH_TYPE});
        } catch (e) {
            dispatch({type: FAILED_AUTH_TYPE});
        }
    }, []);

    const handleAuthenticatedUser = useCallback(async () => {
        handleLoading(true);
        try {
            dispatch({type: LOADING_AUTH_TYPE});
            const awsUser = await Auth.currentAuthenticatedUser();
            handleLoading(false);
            dispatch({type: CURRENT_AWS_USER, payload: awsUser});
            await handleUser(awsUser?.username);
            dispatch({type: AUTH_TYPE});
        } catch (e) {
            handleLoading(false);
            dispatch({type: FAILED_AUTH_TYPE});
        }
    }, []);

    const handleAwsUser = useCallback(async (username: string, password: string) => {
        handleLoading(true);
        try {
            dispatch({type: LOADING_AWS_USER});
            const awsUser: any = await Auth.signIn(username, password);
            handleLoading(false);
            dispatch({type: CURRENT_AWS_USER, payload: awsUser});
            await handleUser(awsUser?.username);
            dispatch({type: AUTH_TYPE});
        } catch (e) {
            console.log(e);
            handleLoading(false);
            dispatch({type: FAILED_AWS_USER});
            dispatch({type: FAILED_AUTH_TYPE});
            setColor(themeDefault.colors.error);
            if (typeof e === 'object') {
                if (e.hasOwnProperty('message')) {
                    setMessage(I18n.get(e.message));
                }
            }
        }
    }, []);

    const handleRegister = useCallback(async (values: any) => {
        handleLoading(true);
        try {
            const awsUser = await Auth.signUp({
                username: values?.username?.toLowerCase(),
                password: values?.password,
                attributes: {
                    email: values?.email,
                    locale: values?.locale,
                    name: `${values.firstName} ${values.lastName}`,
                    nickname: values?.username?.toLowerCase(),
                    'family_name': values.lastName,
                    'given_name': values.firstName,
                    'phone_number': values.phoneNumber,
                }
            });
            const {
                data: {
                    createUserData: mbUser
                }
            }: any = await API.graphql(graphqlOperation(createMBUser, {
                input: {
                    cognitoUserId: awsUser.userSub,
                    type: 'USER',
                    nickname: values?.username?.toLowerCase(),
                    fullName: `${values.firstName} ${values.lastName}`,
                    email: values.email,
                    phoneNumber: values?.phoneNumber,
                    isAvailabilityTx: false,
                    locale: values?.locale,
                    checkEmail: false,
                    checkPhone: false,
                    currency: "USD",
                    isTerms: true,
                    alpha3Code: values?.countryCode || "USA",
                    alpha2Code: values.isoCountryCode || "NJ",
                    city: values?.city || null,
                    zipCode: values?.postalCode || null,
                    state: values?.region || null,
                    country: values?.country || null,
                    isUsedMoneyBlinkAmount: false
                }
            }));
            dispatch({type: REGISTER_AWS, payload: {awsUser: awsUser.user, mbUser}})
            handleLoading(false);
        } catch (e) {
            handleLoading(false);
            setColor(themeDefault.colors.error);
            setMessage(I18n.get(e.message || e.errors[0].message || e));
        }
    }, []);

    const handleUser = useCallback(async (nickname: string) => {
        handleLoading(true);
        try {
            dispatch({type: LOADING_MB_USER});
            const {
                data: {
                    byNickname: {
                        items: users
                    }
                }
            }: any = await API.graphql(graphqlOperation(byNickname, {
                nickname
            }));
            handleLoading(false);
            if (users && users.length > 0) {
                dispatch({type: CURRENT_MB_USER, payload: users[0]});
            } else {
                await handleLogout();
                setColor(themeDefault.colors.error);
                setMessage(I18n.get('ERROR_LOAD_USER'));
            }
        } catch (e) {
            handleLoading(false);
        }
    }, []);

    const handleUpdateUser = useCallback(async (values: any) => {
        handleLoading(true);
        try {
            delete values.myPayments;
            delete values.myBlinks;
            const {
                data: {
                    updateMBUser: payload
                }
            }: any = await API.graphql(graphqlOperation(updateMBUser, {
                input: values
            }));
            handleAccountInfoUpdated(true);
            dispatch({payload, type: CURRENT_MB_USER});
            handleLoading(false);
            setColor(themeDefault.colors.notification);
            setMessage(I18n.get('UPDATE_INFO_USER'));
        } catch (e) {
            handleLoading(false);
        }
    }, []);

    const handleNotifications = useCallback(async (mbUser: any) => {
        handleLoading(true);
        try {
            dispatch({ type: LOADING_NOTIFICATIONS });
            const currentDate = new Date();
            const beforeDate = new Date();
            beforeDate.setHours(-24);
            const {
                data: {
                    listMyNotifications: {
                        items: payload
                    }
                }
            }: any = await API.graphql(graphqlOperation(listMyNotifications, {
                type: "NOTIFICATION",
                filter: {
                    userID: { eq: mbUser?.id },
                    and: [
                        {
                            or: [
                                { isRead: { eq: false } },
                                { updatedAt: { between: [beforeDate.toISOString(), currentDate.toISOString()] } }
                            ]
                        }
                    ]
                },
                sortDirection: ModelSortDirection.DESC
            }));

            dispatch({ type: NOTIFICATIONS_LOAD, payload })

        } catch (e) {

        } finally {
            handleLoading(false);
        }
    }, []);

    const onDismissSnackBar = () => setMessage(null);

    return (
        <MBContext.Provider
            value={{
                awsUser: state.awsUser,
                mbUser: state.mbUser,
                isLoading: state.isLoading,
                isCompleted: state.isCompleted,
                isBack: state.isBack,
                amount: state.amount,
                blinks: state.blinks,
                updatedAuthType: state.updatedAuthType,
                regAws: state.regAws,
                regMoneyBlinks: state.regMoneyBlinks,
                updatedAccountInfo: state.updatedAccountInfo,
                notifications: state.notifications,
                updateNotifications: state.updateNotifications,
                handleLoading,
                handleAwsUser,
                handleAuthenticatedUser,
                handleUser,
                handleRegister,
                handleError,
                handleLogout,
                handleUpdateUser,
                handleAccountInfoUpdated,
                handleNotifications,
                handleUpdateNotifications
            }}>
            {children}
            <Snackbar
                theme={{
                    colors: {
                        accent: '#FFFFFF',
                        surface: '#FFFFFF'
                    }
                }}
                style={{
                    backgroundColor: color
                }}
                visible={message !== null}
                onDismiss={onDismissSnackBar}
                action={{
                    label: 'OK',
                    onPress: () => onDismissSnackBar(),
                }}>
                {message}
            </Snackbar>
            <Modal visible={state.isLoading} style={{
                backgroundColor: 'transparent',
                elevation: 0
            }}>
                <ActivityIndicator size={120}/>
            </Modal>
        </MBContext.Provider>
    );
}
