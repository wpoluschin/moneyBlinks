import React, {useContext, useEffect} from "react";
import {Image, SafeAreaView, ScrollView, TouchableOpacity, View} from "react-native";
import {Formik} from "formik";
import * as Yup from "yup";
import {Appbar, Avatar, Button, RadioButton, Switch, Text} from "react-native-paper";
import {DrawerNavigationProp} from "@react-navigation/drawer";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {API, graphqlOperation, I18n} from "aws-amplify";
import {createStackNavigator} from "@react-navigation/stack";

import {en_US} from "../../assets/translates/en";
import {es_ES} from "../../assets/translates/es";
import {updateMBUser} from "../graphql/mutations";
import MBContext from "../../contexts/MoneyBlinks/MBContext";
import {mbCommonStyles} from "../../constants/styles";
import {themeDefault} from "../../constants/Colors";

;

const SettingsNav = createStackNavigator();
I18n.putVocabulariesForLanguage('en-US', en_US);
I18n.putVocabulariesForLanguage('es-US', es_ES);
I18n.putVocabulariesForLanguage('es-ES', es_ES);
I18n.putVocabulariesForLanguage('es-EC', es_ES);
I18n.putVocabulariesForLanguage('es-CU', es_ES);
I18n.putVocabulariesForLanguage('es', es_ES);
I18n.putVocabulariesForLanguage('en', en_US);

const MBSettings = () => {
    let formRef: any = null;
    const { mbUser, handleLoading }: any = useContext(MBContext);

    useEffect(() => {

    }, []);

    const onUpdateAccount = async (values: any) => {
        try {
            handleLoading(true);
            const {
                data: {
                    updateUserData: currentUser
                }
            }: any = await API.graphql(graphqlOperation(updateMBUser, {
                input: values
            }));
            // setState({ awsUser: state.awsUser, mbUser: currentUser, isLoading: false });
        } catch (e) {
            console.log(e);
        } finally {
            handleLoading(false);
        }
    }

    const updateLanguage = (language: string = 'es') => {
        I18n.setLanguage(language);
        if (formRef) {
            formRef.setFieldValue('locale', language, true);
        }
    }

    return (
        <SafeAreaView style={mbCommonStyles.container}>
            <Formik
                enableReinitialize={true}
                initialValues={{
                    id: mbUser?.id,
                    locale: mbUser?.locale,
                    isMFA: mbUser?.isMFA,
                    acceptedRequestBlink: mbUser?.acceptedRequestBlink,
                    isUsedMoneyBlinkAmount: mbUser?.isUsedMoneyBlinkAmount,
                    acceptedPromotionalInfo: mbUser?.acceptedPromotionalInfo,
                }}
                innerRef={ref => {
                    if (!formRef) {
                        formRef = ref;
                    }
                }}
                validationSchema={
                    Yup.object().shape({
                        locale: Yup.string().required()
                    })
                }
                onSubmit={onUpdateAccount}>
                {({
                      errors,
                      values,
                      touched,
                      setFieldValue,
                      handleSubmit
                  }) => (
                    <ScrollView style={mbCommonStyles.scrollView}>
                        <View style={{
                            marginTop: 20,
                            flexDirection: "row",
                            alignContent: "flex-start"
                        }}>
                            <Avatar.Icon
                                style={{
                                    backgroundColor: 'transparent'
                                }}
                                size={36}
                                icon={(props) => <MaterialCommunityIcons name="google-translate" {...props}/>}
                                color={themeDefault.colors.placeholder}/>
                            <Text style={{
                                marginHorizontal: 5,
                                fontSize: 20,
                                textAlignVertical: "center",
                                color: themeDefault.colors.placeholder
                            }}>{I18n.get('LANGUAGE')}</Text>
                        </View>
                        <View style={{
                            marginTop: 10
                        }}>
                            <RadioButton.Group
                                onValueChange={newValue => updateLanguage(newValue)}
                                value={values.locale}>
                                <View style={{
                                    flexDirection: "row",
                                    flex: 1
                                }}>
                                    <TouchableOpacity
                                        onPress={() => updateLanguage('es')}
                                        style={{
                                            flex: 0.5,
                                            alignContent: "flex-start",
                                            flexDirection: "row"
                                        }}>
                                        <RadioButton color={themeDefault.colors.primary} value="es"/>
                                        <Text style={{
                                            textAlignVertical: "center",
                                            marginRight: -30,
                                        }}>Español</Text>
                                        <Image source={require('../../assets/images/lang-es.png')}
                                               style={{height: 36, resizeMode: "contain"}}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => updateLanguage('en')}
                                        style={{
                                            flex: 0.5,
                                            alignContent: "flex-start",
                                            flexDirection: "row"
                                        }}>
                                        <RadioButton color={themeDefault.colors.primary} value="en"/>
                                        <Text style={{
                                            textAlignVertical: "center",
                                            marginRight: -30,
                                        }}>English</Text>
                                        <Image source={require('../../assets/images/lang-en.png')}
                                               style={{height: 36, resizeMode: "contain"}}/>
                                    </TouchableOpacity>
                                </View>
                            </RadioButton.Group>
                        </View>
                        <View style={{
                            marginTop: 30,
                            flexDirection: "row",
                            alignContent: "flex-start"
                        }}>
                            <Avatar.Icon
                                style={{
                                    backgroundColor: 'transparent'
                                }}
                                size={36}
                                icon={(props) => <MaterialCommunityIcons name="alert-circle" {...props}/>}
                                color={themeDefault.colors.placeholder}/>
                            <Text style={{
                                marginHorizontal: 5,
                                fontSize: 20,
                                textAlignVertical: "center",
                                color: themeDefault.colors.placeholder
                            }}>{I18n.get('SETTINGS_SECURITY_PARAMETERS')}</Text>
                        </View>
                        <View style={{
                            marginTop: 20,
                            flexDirection: "row",
                            alignContent: "space-between"
                        }}>
                            <Text style={{
                                color: themeDefault.colors.text,
                                textAlignVertical: "center",
                                alignSelf: "flex-start",
                                flex: 0.8
                            }}>
                                {I18n.get('MFA_ACCEPTED')}
                            </Text>
                            <Switch
                                style={{
                                    alignSelf: "flex-end",
                                    flex: 0.2
                                }}
                                value={values?.isMFA}
                                color={themeDefault.colors.primary}
                                onValueChange={value => setFieldValue('isMFA', value, true)} />
                        </View>
                        <View style={{
                            marginTop: 20,
                            flexDirection: "row",
                            alignContent: "space-between"
                        }}>
                            <Text style={{
                                color: themeDefault.colors.text,
                                textAlignVertical: "center",
                                alignSelf: "flex-start",
                                flex: 0.8
                            }}>
                                {I18n.get('NO_ACCEPTED_REQUEST_BLINK')}
                            </Text>
                            <Switch
                                style={{
                                    alignSelf: "flex-end",
                                    flex: 0.2
                                }}
                                value={values?.acceptedRequestBlink}
                                color={themeDefault.colors.primary}
                                onValueChange={value => setFieldValue('acceptedRequestBlink', value, true)} />
                        </View>
                        <View style={{
                            marginTop: 20,
                            flexDirection: "row",
                            alignContent: "space-between"
                        }}>
                            <Text style={{
                                color: themeDefault.colors.text,
                                textAlignVertical: "center",
                                alignSelf: "flex-start",
                                flex: 0.8
                            }}>
                                {I18n.get('PROMOTIONAL_ACCEPTED')}
                            </Text>
                            <Switch
                                style={{
                                    alignSelf: "flex-end",
                                    flex: 0.2
                                }}
                                value={values?.acceptedPromotionalInfo}
                                color={themeDefault.colors.primary}
                                onValueChange={value => setFieldValue('acceptedPromotionalInfo', value, true)} />
                        </View>
                        <View style={{
                            marginTop: 20,
                            flexDirection: "row",
                            alignContent: "space-between"
                        }}>
                            <Text style={{
                                color: themeDefault.colors.text,
                                textAlignVertical: "center",
                                alignSelf: "flex-start",
                                flex: 0.8
                            }}>
                                {I18n.get('USE_AMOUNT_MB')}
                            </Text>
                            <Switch
                                style={{
                                    alignSelf: "flex-end",
                                    flex: 0.2
                                }}
                                value={values?.isUsedMoneyBlinkAmount}
                                color={themeDefault.colors.primary}
                                onValueChange={value => setFieldValue('isUsedMoneyBlinkAmount', value, true)} />
                        </View>
                        <Button icon="content-save"
                                style={mbCommonStyles.submitBtn}
                                disabled={Object.keys(errors).length > 0}
                                mode="contained" onPress={handleSubmit}>
                            {I18n.get('OK')}
                        </Button>
                    </ScrollView>
                )}
            </Formik>
        </SafeAreaView>
    );

}

export default function MBSettingsNav(props: any) {

    return (
        <SettingsNav.Navigator
            {...props}
            initialRouteName="MBSettings"
            headerMode="screen"
            screenOptions={{
                header: ({navigation}) => {
                    return (
                        <Appbar.Header style={{
                            backgroundColor: '#52C1E0'
                        }}>

                            <TouchableOpacity
                                style={{marginLeft: 10}}
                                onPress={() => {
                                    ((navigation as any) as DrawerNavigationProp<{}>).openDrawer();
                                }}
                            >
                                <Avatar.Icon
                                    size={48}
                                    icon={({size, color}) => <MaterialCommunityIcons name="menu" size={size}
                                                                                     color={color}/>}
                                    style={{
                                        backgroundColor: '#52C1E0',
                                    }}
                                    color="#FFFFFF"
                                />
                            </TouchableOpacity>
                            <Appbar.Content
                                title={I18n.get('D_ITEM_SETTINGS')}
                                titleStyle={{
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    color: '#FFFF'
                                }}
                            />
                            <Avatar.Icon
                                icon={({color, size}) => <MaterialCommunityIcons name="cogs" color={color}
                                                                                 size={size}/>}
                                color="#FFFFFF" style={{
                                backgroundColor: themeDefault.colors.header
                            }} size={48}/>
                        </Appbar.Header>
                    );
                },
            }}>
            <SettingsNav.Screen name="MBSettings"
                                component={MBSettings}/>
        </SettingsNav.Navigator>
    );
}
