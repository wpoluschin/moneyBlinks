import React, {Fragment, useContext, useEffect, useState} from "react";
import {Dimensions, SafeAreaView, ScrollView, TouchableOpacity, View} from "react-native";
import {Formik} from "formik";
import * as Yup from "yup";
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
import {useNavigation} from "@react-navigation/native";
import {API, graphqlOperation, I18n, Storage} from "aws-amplify";
import {MaterialCommunityIcons} from "@expo/vector-icons";

import {TxStatus, TxType} from "../API";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import {mbCommonStyles} from "../../constants/styles";
import {themeDefault} from "../../constants/Colors";
import HomeBlinkContext from "../../contexts/HomeBlink/HomeBlinkContext";
import {RequestType} from "../../functions/enums";
import {styles} from "./SendBlink";
import {createTx, updateMBContact} from "../graphql/mutations";

const {width, height} = Dimensions.get("window");

export default function RequestBlink() {

    const navigation = useNavigation();
    let formRef: any = null;
    const {handleLoading, handleError, mbUser}: any = useContext(MBContext);
    const {
        handleFavorites,
        handleContacts,
        handleReloadFinancial,
        handleNavigateToHme,
        handleClearContacts,
        handleTxType,
        favorites,
        moneyBlinksContacts
    }: any = useContext(HomeBlinkContext);

    const [searchQuery, setSearchQuery] = useState('');
    const [step, setStep] = useState(RequestType.CONTACTS);

    const [checked, setChecked] = useState('email');
    const [myChipList, setMyChipList] = useState<any[]>([]);
    const [notifyTo, setNotifyTo] = useState('');
    const [image, setImage] = useState<any>(null);

    const [filteredFavorites, setFilteredFavorites] = useState<any[]>([]);
    const [avatarFavorites, setAvatarFavorites] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [imageContact, setImageContact] = useState<any>(null);

    useEffect(() => {
        async function loadMyFavorites() {
            await handleFavorites(false);
        }

        loadMyFavorites();
        handleClearContacts();
    }, []);

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


    const onRequestBlink = async (values: any) => {
        handleLoading(true);
        try {
            values['userId'] = mbUser?.id;
            if (!values?.currency) {
                values['currency'] = mbUser?.currency || 'USD';
            }
            values['notifications'] = myChipList;
            const {
                data: {
                    createTx: txData
                }
            }: any = await API.graphql(graphqlOperation(createTx, {
                values: JSON.stringify(values)
            }));
            const response = JSON.parse(txData);
            if (response.statusCode) {
                handleTxType(TxType.REQUEST);
                handleReloadFinancial(true);
                handleNavigateToHme(true);
                navigation.navigate('Home')
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

    const loadAvatarImage = async (contact: any): Promise<any> => {
        return contact?.avatarUrl ? Storage.get(contact.avatarUrl, {level: 'public'}) : null;
    }

    const onChangeSearch = async (query: string) => {
        setSearchQuery(query);
        if (query && query.length >= 2) {
            await handleContacts(query);
            const $filterMbUsers = [
                ...favorites.filter((contact: any) =>
                    contact.invited.phoneNumber.includes(query) ||
                    contact.invited.email.includes(query.toLowerCase()) ||
                    contact.invited.nickname.includes(query.toLowerCase()) ||
                    contact.invited.fullName.includes(query)
                )
            ];
            setFilteredFavorites($filterMbUsers);
        } else {
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
                innerRef={(ref) => {
                    if (!formRef) {
                        // @ts-ignore
                        formRef = ref;
                    }
                }}
                initialValues={{
                    amount: 0,
                    currency: mbUser?.currency,
                    requestMessage: '',
                    contact: {
                        id: null,
                        avatarUrl: null,
                        fullName: null,
                        phoneNumber: null,
                        nickname: null
                    },
                    total: 0,
                    txType: TxType.REQUEST,
                    txStatus: TxStatus.REQUEST
                }}
                validationSchema={
                    Yup.object().shape({
                        amount: Yup.number()
                            .min(10, 'AMOUNT_SEND_MIN')
                            .max(2000, 'AMOUNT_SEND_MAX')
                            .required('AMOUNT_SEND_REQ'),
                        total: Yup.number()
                            .min(10, 'AMOUNT_SEND_MIN')
                            .max(2000, 'AMOUNT_SEND_MAX')
                            .required('AMOUNT_SEND_REQ'),
                        requestMessage: Yup.string().nullable()
                            .max(160, 'MAX_CHARACTERS')
                            .notRequired(),
                        contact: Yup.object().shape({
                            id: Yup.string().required('CONTACT_IS_REQUIRED')
                        })
                    })
                }
                onSubmit={onRequestBlink}>
                {({
                      values,
                      errors,
                      touched,
                      handleSubmit,
                      setFieldValue
                  }) => (
                    <ScrollView style={mbCommonStyles.scrollView}>
                        {
                            step === RequestType.CONTACTS && (
                                <Fragment>
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
                                        fontSize: 20
                                    }}>
                                        {I18n.get('CONTACT_SEND')}
                                    </Text>
                                    <ScrollView style={{
                                        height: height - 180,
                                        width: width - 40
                                    }}>
                                        {
                                            (!filteredFavorites || filteredFavorites.length === 0) &&
                                            (!filteredUsers || filteredUsers.length === 0) && (
                                                <View style={{
                                                    ...styles.containerError,
                                                    height: height - 170
                                                }}>
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
                                                const images = avatarFavorites.filter((item: any) => item.id.indexOf(contact?.invited?.id) === 0);
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
                                                                    setStep(RequestType.END);
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
                                                                        {contact?.myReceipts || 0}
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
                                                loadAvatarImage(contact).then(result => image = result);
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
                                                                    setStep(RequestType.END);
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
                                                                        0
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
                                </Fragment>
                            )
                        }
                        {
                            step === RequestType.END && (
                                <>
                                    <View style={{
                                        marginTop: 20
                                    }}>
                                        <List.Item
                                            title={I18n.get('CONTACT_REQUEST')}
                                            titleStyle={{
                                                color: '#97A19A'
                                            }}
                                            left={props => <List.Icon {...props} icon="send"
                                                                      color={'#97A19A'}/>}
                                        />
                                        <List.Item title={`${values?.contact?.fullName} (${values?.contact?.nickname})`}
                                                   description={`${values?.contact?.phoneNumber}`}
                                                   right={() => <Avatar.Image
                                                       source={require('../../assets/images/icon.png')}
                                                       size={36}
                                                       style={{
                                                           backgroundColor: 'transparent'
                                                       }}/>
                                                   }
                                                   left={() => image ?
                                                       <Avatar.Image source={{uri: image}} size={48}/> :
                                                       <Avatar.Icon icon="account" size={48}/>}/>
                                    </View>

                                    <View style={{
                                        marginVertical: 20
                                    }}>
                                        <TextInput mode="outlined"
                                                   label={I18n.get('REQUEST_VALUE')}
                                                   value={`${values.amount}`}
                                                   error={!!errors.amount}
                                                   placeholder={'1000.00'}
                                                   keyboardType="number-pad"
                                                   style={{
                                                       textAlign: "right"
                                                   }}
                                                   onChangeText={text => {
                                                       setFieldValue('amount', Number(text), true);
                                                       setFieldValue('total', Number(text), true);
                                                   }}
                                                   left={
                                                       <TextInput.Icon
                                                           color="#97A19A"
                                                           name="currency-usd"/>
                                                   }/>
                                    </View>
                                    <View style={{
                                        marginVertical: 20
                                    }}>
                                        <TextInput
                                            mode="outlined"
                                            label={I18n.get('MESSAGE')}
                                            value={values?.requestMessage}
                                            numberOfLines={5}
                                            error={!!errors?.requestMessage}
                                            onChangeText={text => {
                                                setFieldValue('requestMessage', text, true);
                                            }}
                                            multiline
                                            left={
                                                <TextInput.Icon
                                                    color="#97A19A"
                                                    name="message-settings"/>
                                            }
                                            editable={true}/>
                                        {
                                            errors?.requestMessage && touched?.requestMessage && (
                                                <HelperText type="error">
                                                    {I18n.get(errors.requestMessage)}
                                                </HelperText>
                                            )
                                        }
                                    </View>
                                    <View style={{
                                        marginTop: 20
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
                                                myChipList.map((item: any, index: number) => (
                                                    <Chip key={item} icon={checked === 'email' ? 'email' : 'phone'}
                                                          closeIconAccessibilityLabel="close-circle"
                                                          onClose={() => {
                                                              myChipList.splice(index, 1);
                                                          }}
                                                          style={{
                                                              margin: 4,
                                                              backgroundColor: themeDefault.colors.disabled
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
                                                    const index = myChipList.findIndex((it: string) => it.toLowerCase().indexOf(notifyTo) === 0);
                                                    if (index < 0) {
                                                        myChipList.push(notifyTo);
                                                    }
                                                    setNotifyTo('');
                                                }
                                            }}/>
                                        </View>
                                    </View>
                                    <Button icon="check"
                                            style={mbCommonStyles.submitBtn}
                                            mode="contained"
                                            disabled={Object.keys(errors).length > 0}
                                            onPress={handleSubmit}>
                                        {I18n.get('COMPLETED_BTN')}
                                    </Button>
                                </>
                            )
                        }
                    </ScrollView>
                )}
            </Formik>
        </SafeAreaView>
    );
}
